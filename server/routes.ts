import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get all users (sorted by points)
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get top users
  app.get("/api/users/top", async (req, res) => {
    try {
      const users = await storage.getTopUsers(5);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top users" });
    }
  });

  // Get recent activities
  app.get("/api/activities/recent", async (req, res) => {
    try {
      const activities = await storage.getRecentActivities(10);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Get all API keys
  app.get("/api/keys", async (req, res) => {
    try {
      const keys = await storage.getAllApiKeys();
      res.json(keys);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  // Generate new API key
  app.post("/api/keys/generate", async (req, res) => {
    try {
      const key = randomBytes(32).toString('hex');
      const apiKey = await storage.createApiKey({ key });
      res.json(apiKey);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate API key" });
    }
  });

  // Revoke API key
  app.delete("/api/keys/:id", async (req, res) => {
    try {
      await storage.deleteApiKey(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to revoke API key" });
    }
  });

  // Middleware to verify API key
  const verifyApiKey = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const key = authHeader.substring(7);
    const apiKey = await storage.getApiKey(key);
    
    if (!apiKey) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Update last used timestamp
    await storage.updateApiKeyLastUsed(apiKey.id, Date.now());
    
    next();
  };

  // Export endpoints (require API key)
  app.get("/api/export/users", verifyApiKey, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json({
        success: true,
        data: users,
        exported_at: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to export users" });
    }
  });

  app.get("/api/export/points", verifyApiKey, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const pointsData = users.map(user => ({
        user_id: user.id,
        username: user.username,
        points: user.points,
        last_earned: user.lastPointEarned,
      }));
      res.json({
        success: true,
        data: pointsData,
        exported_at: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to export points" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
