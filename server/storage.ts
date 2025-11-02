import { type DiscordUser, type InsertDiscordUser, type Activity, type InsertActivity, type ApiKey, type InsertApiKey, type DashboardStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Discord Users
  getUser(id: string): Promise<DiscordUser | undefined>;
  getAllUsers(): Promise<DiscordUser[]>;
  getTopUsers(limit: number): Promise<DiscordUser[]>;
  createUser(discordId: string, user: InsertDiscordUser): Promise<DiscordUser>;
  updateUserPoints(id: string, points: number, timestamp: number): Promise<DiscordUser>;
  upsertUser(discordId: string, username: string, discriminator?: string | null, avatar?: string | null): Promise<DiscordUser>;
  
  // Activities
  getRecentActivities(limit: number): Promise<Activity[]>;
  getAllActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // API Keys
  getApiKey(key: string): Promise<ApiKey | undefined>;
  getApiKeyById(id: string): Promise<ApiKey | undefined>;
  getAllApiKeys(): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  deleteApiKey(id: string): Promise<void>;
  updateApiKeyLastUsed(id: string, timestamp: number): Promise<void>;
  
  // Stats
  getStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, DiscordUser>;
  private activities: Map<string, Activity>;
  private apiKeys: Map<string, ApiKey>;
  private botStatus: 'online' | 'offline' = 'offline';
  private lastSync: number = Date.now();

  constructor() {
    this.users = new Map();
    this.activities = new Map();
    this.apiKeys = new Map();
  }

  // Bot Status Management
  setBotStatus(status: 'online' | 'offline') {
    this.botStatus = status;
    this.lastSync = Date.now();
  }

  getBotStatus(): { status: 'online' | 'offline'; lastSync: number } {
    return { status: this.botStatus, lastSync: this.lastSync };
  }

  // Discord Users
  async getUser(id: string): Promise<DiscordUser | undefined> {
    return this.users.get(id);
  }

  async getAllUsers(): Promise<DiscordUser[]> {
    return Array.from(this.users.values()).sort((a, b) => b.points - a.points);
  }

  async getTopUsers(limit: number): Promise<DiscordUser[]> {
    const users = await this.getAllUsers();
    return users.slice(0, limit);
  }

  async createUser(discordId: string, insertUser: InsertDiscordUser): Promise<DiscordUser> {
    const user: DiscordUser = {
      id: discordId,
      ...insertUser,
      points: 0,
      lastPointEarned: null,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserPoints(id: string, points: number, timestamp: number): Promise<DiscordUser> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User ${id} not found`);
    }
    user.points = points;
    user.lastPointEarned = timestamp;
    this.users.set(id, user);
    return user;
  }

  // Activities
  async getRecentActivities(limit: number): Promise<Activity[]> {
    const allActivities = Array.from(this.activities.values());
    return allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = { id, ...insertActivity };
    this.activities.set(id, activity);
    return activity;
  }

  // API Keys
  async getApiKey(key: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values()).find(k => k.key === key);
  }

  async getApiKeyById(id: string): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const id = randomUUID();
    const apiKey: ApiKey = {
      id,
      ...insertApiKey,
      createdAt: Date.now(),
      lastUsed: null,
    };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async deleteApiKey(id: string): Promise<void> {
    this.apiKeys.delete(id);
  }

  async updateApiKeyLastUsed(id: string, timestamp: number): Promise<void> {
    const apiKey = this.apiKeys.get(id);
    if (apiKey) {
      apiKey.lastUsed = timestamp;
      this.apiKeys.set(id, apiKey);
    }
  }

  // Stats
  async getStats(): Promise<DashboardStats> {
    const users = Array.from(this.users.values());
    const activities = Array.from(this.activities.values());
    
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const activeToday = new Set(
      activities
        .filter(a => a.timestamp >= oneDayAgo)
        .map(a => a.userId)
    ).size;

    return {
      totalUsers: users.length,
      totalPoints: users.reduce((sum, user) => sum + user.points, 0),
      activeToday,
      linksPosted: activities.length,
      botStatus: this.botStatus,
      lastSync: this.lastSync,
    };
  }

  // Create or update user (used by Discord bot)
  async upsertUser(discordId: string, username: string, discriminator?: string | null, avatar?: string | null): Promise<DiscordUser> {
    let user = this.users.get(discordId);
    if (user) {
      user.username = username;
      user.discriminator = discriminator || null;
      user.avatar = avatar || null;
      this.users.set(discordId, user);
      return user;
    } else {
      const newUser: DiscordUser = {
        id: discordId,
        username,
        discriminator: discriminator || null,
        avatar: avatar || null,
        points: 0,
        lastPointEarned: null,
      };
      this.users.set(discordId, newUser);
      return newUser;
    }
  }
}

export const storage = new MemStorage();
