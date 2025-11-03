import type { Context, Config } from "@netlify/functions";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { discordUsers, activities } from "../../shared/schema";

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const databaseUrl = Netlify.env.get("DATABASE_URL");
    
    if (databaseUrl) {
      const pool = new Pool({ connectionString: databaseUrl });
      const db = drizzle(pool);
      
      const allUsers = await db.select().from(discordUsers);
      const allActivities = await db.select().from(activities);
      
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      
      const activeToday = new Set(
        allActivities
          .filter(a => a.timestamp >= oneDayAgo)
          .map(a => a.userId)
      ).size;

      const stats = {
        totalUsers: allUsers.length,
        totalPoints: allUsers.reduce((sum, user) => sum + user.points, 0),
        activeToday,
        linksPosted: allActivities.length,
        botStatus: 'offline' as const,
        lastSync: now,
      };
      
      return new Response(JSON.stringify(stats), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      const stats = {
        totalUsers: 0,
        totalPoints: 0,
        activeToday: 0,
        linksPosted: 0,
        botStatus: 'offline' as const,
        lastSync: Date.now(),
      };
      
      return new Response(JSON.stringify(stats), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    return new Response(JSON.stringify({ error: "Failed to fetch stats" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const config: Config = {
  path: "/api/stats"
};
