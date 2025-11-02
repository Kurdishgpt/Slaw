import { type DiscordUser, type InsertDiscordUser, type Activity, type InsertActivity, type ApiKey, type InsertApiKey, type DashboardStats } from "@shared/schema";
import { discordUsers, activities, apiKeys } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Bot Status
  setBotStatus(status: 'online' | 'offline'): void;
  getBotStatus(): { status: 'online' | 'offline'; lastSync: number };
  
  // Discord Users
  getUser(id: string): Promise<DiscordUser | undefined>;
  getUserByApiKey(apiKey: string): Promise<DiscordUser | undefined>;
  getAllUsers(): Promise<DiscordUser[]>;
  getTopUsers(limit: number): Promise<DiscordUser[]>;
  createUser(discordId: string, user: InsertDiscordUser): Promise<DiscordUser>;
  updateUserPoints(id: string, points: number, timestamp: number): Promise<DiscordUser>;
  upsertUser(discordId: string, username: string, discriminator?: string | null, avatar?: string | null): Promise<DiscordUser>;
  linkApiKey(userId: string, apiKey: string): Promise<DiscordUser>;
  updateVoiceStatus(userId: string, inVoice: boolean, channelName: string | null): Promise<DiscordUser>;
  incrementDailyLinks(userId: string): Promise<DiscordUser>;
  decrementDailyLinks(userId: string): Promise<DiscordUser>;
  resetDailyLinksIfNeeded(userId: string): Promise<DiscordUser>;
  getUsersInVoice(): Promise<DiscordUser[]>;
  updateLastVoicePointEarned(userId: string, timestamp: number | null): Promise<DiscordUser>;
  
  // Activities
  getRecentActivities(limit: number): Promise<Activity[]>;
  getAllActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivityByLink(link: string): Promise<Activity | undefined>;
  getActivityByMessageId(messageId: string): Promise<Activity | undefined>;
  deleteActivity(id: string): Promise<void>;
  
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
      username: insertUser.username,
      discriminator: insertUser.discriminator ?? null,
      avatar: insertUser.avatar ?? null,
      points: 0,
      lastPointEarned: null,
      dailyLinksPosted: 0,
      lastDailyReset: null,
      linkedApiKey: null,
      inVoiceChannel: false,
      voiceChannelName: null,
      voiceChannelJoinedAt: null,
      lastVoicePointEarned: null,
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
    const activity: Activity = { 
      id, 
      ...insertActivity,
      messageId: insertActivity.messageId ?? null 
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getActivityByLink(link: string): Promise<Activity | undefined> {
    return Array.from(this.activities.values()).find(a => a.link === link);
  }

  async getActivityByMessageId(messageId: string): Promise<Activity | undefined> {
    return Array.from(this.activities.values()).find(a => a.messageId === messageId);
  }

  async deleteActivity(id: string): Promise<void> {
    this.activities.delete(id);
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
        dailyLinksPosted: 0,
        lastDailyReset: null,
        linkedApiKey: null,
        inVoiceChannel: false,
        voiceChannelName: null,
        voiceChannelJoinedAt: null,
        lastVoicePointEarned: null,
      };
      this.users.set(discordId, newUser);
      return newUser;
    }
  }

  async incrementDailyLinks(userId: string): Promise<DiscordUser> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    user.dailyLinksPosted++;
    this.users.set(userId, user);
    return user;
  }

  async decrementDailyLinks(userId: string): Promise<DiscordUser> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    user.dailyLinksPosted = Math.max(0, user.dailyLinksPosted - 1);
    this.users.set(userId, user);
    return user;
  }

  async resetDailyLinksIfNeeded(userId: string): Promise<DiscordUser> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (!user.lastDailyReset || (now - user.lastDailyReset) >= oneDayMs) {
      user.dailyLinksPosted = 0;
      user.lastDailyReset = now;
      this.users.set(userId, user);
    }
    
    return user;
  }

  async getUserByApiKey(apiKey: string): Promise<DiscordUser | undefined> {
    return Array.from(this.users.values()).find(user => user.linkedApiKey === apiKey);
  }

  async linkApiKey(userId: string, apiKey: string): Promise<DiscordUser> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    user.linkedApiKey = apiKey;
    this.users.set(userId, user);
    return user;
  }

  async updateVoiceStatus(userId: string, inVoice: boolean, channelName: string | null): Promise<DiscordUser> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    user.inVoiceChannel = inVoice;
    user.voiceChannelName = channelName;
    user.voiceChannelJoinedAt = inVoice ? Date.now() : null;
    this.users.set(userId, user);
    return user;
  }

  async getUsersInVoice(): Promise<DiscordUser[]> {
    return Array.from(this.users.values()).filter(user => user.inVoiceChannel);
  }

  async updateLastVoicePointEarned(userId: string, timestamp: number | null): Promise<DiscordUser> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    user.lastVoicePointEarned = timestamp;
    this.users.set(userId, user);
    return user;
  }
}

export class DbStorage implements IStorage {
  private db;
  private botStatus: 'online' | 'offline' = 'offline';
  private lastSync: number = Date.now();

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool);
  }

  setBotStatus(status: 'online' | 'offline') {
    this.botStatus = status;
    this.lastSync = Date.now();
  }

  getBotStatus(): { status: 'online' | 'offline'; lastSync: number } {
    return { status: this.botStatus, lastSync: this.lastSync };
  }

  async getUser(id: string): Promise<DiscordUser | undefined> {
    const result = await this.db.select().from(discordUsers).where(eq(discordUsers.id, id)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<DiscordUser[]> {
    return await this.db.select().from(discordUsers).orderBy(desc(discordUsers.points));
  }

  async getTopUsers(limit: number): Promise<DiscordUser[]> {
    return await this.db.select().from(discordUsers).orderBy(desc(discordUsers.points)).limit(limit);
  }

  async createUser(discordId: string, insertUser: InsertDiscordUser): Promise<DiscordUser> {
    const result = await this.db.insert(discordUsers).values({
      id: discordId,
      username: insertUser.username,
      discriminator: insertUser.discriminator ?? null,
      avatar: insertUser.avatar ?? null,
      points: 0,
      lastPointEarned: null,
      dailyLinksPosted: 0,
      lastDailyReset: null,
      linkedApiKey: null,
      inVoiceChannel: false,
      voiceChannelName: null,
      voiceChannelJoinedAt: null,
      lastVoicePointEarned: null,
    }).returning();
    return result[0];
  }

  async updateUserPoints(id: string, points: number, timestamp: number): Promise<DiscordUser> {
    const result = await this.db.update(discordUsers)
      .set({ points, lastPointEarned: timestamp })
      .where(eq(discordUsers.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error(`User ${id} not found`);
    }
    return result[0];
  }

  async upsertUser(discordId: string, username: string, discriminator?: string | null, avatar?: string | null): Promise<DiscordUser> {
    const existing = await this.getUser(discordId);
    
    if (existing) {
      const result = await this.db.update(discordUsers)
        .set({ 
          username, 
          discriminator: discriminator || null, 
          avatar: avatar || null 
        })
        .where(eq(discordUsers.id, discordId))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(discordUsers).values({
        id: discordId,
        username,
        discriminator: discriminator || null,
        avatar: avatar || null,
        points: 0,
        lastPointEarned: null,
        dailyLinksPosted: 0,
        lastDailyReset: null,
        linkedApiKey: null,
        inVoiceChannel: false,
        voiceChannelName: null,
        voiceChannelJoinedAt: null,
        lastVoicePointEarned: null,
      }).returning();
      return result[0];
    }
  }

  async incrementDailyLinks(userId: string): Promise<DiscordUser> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    const result = await this.db.update(discordUsers)
      .set({ dailyLinksPosted: user.dailyLinksPosted + 1 })
      .where(eq(discordUsers.id, userId))
      .returning();
    
    if (!result[0]) {
      throw new Error(`User ${userId} not found`);
    }
    return result[0];
  }

  async decrementDailyLinks(userId: string): Promise<DiscordUser> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    const result = await this.db.update(discordUsers)
      .set({ dailyLinksPosted: Math.max(0, user.dailyLinksPosted - 1) })
      .where(eq(discordUsers.id, userId))
      .returning();
    
    if (!result[0]) {
      throw new Error(`User ${userId} not found`);
    }
    return result[0];
  }

  async resetDailyLinksIfNeeded(userId: string): Promise<DiscordUser> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (!user.lastDailyReset || (now - user.lastDailyReset) >= oneDayMs) {
      const result = await this.db.update(discordUsers)
        .set({ dailyLinksPosted: 0, lastDailyReset: now })
        .where(eq(discordUsers.id, userId))
        .returning();
      
      if (!result[0]) {
        throw new Error(`User ${userId} not found`);
      }
      return result[0];
    }
    
    return user;
  }

  async getUserByApiKey(apiKey: string): Promise<DiscordUser | undefined> {
    const result = await this.db.select().from(discordUsers).where(eq(discordUsers.linkedApiKey, apiKey)).limit(1);
    return result[0];
  }

  async linkApiKey(userId: string, apiKey: string): Promise<DiscordUser> {
    const result = await this.db.update(discordUsers)
      .set({ linkedApiKey: apiKey })
      .where(eq(discordUsers.id, userId))
      .returning();
    
    if (!result[0]) {
      throw new Error(`User ${userId} not found`);
    }
    return result[0];
  }

  async updateVoiceStatus(userId: string, inVoice: boolean, channelName: string | null): Promise<DiscordUser> {
    const result = await this.db.update(discordUsers)
      .set({ 
        inVoiceChannel: inVoice, 
        voiceChannelName: channelName,
        voiceChannelJoinedAt: inVoice ? Date.now() : null
      })
      .where(eq(discordUsers.id, userId))
      .returning();
    
    if (!result[0]) {
      throw new Error(`User ${userId} not found`);
    }
    return result[0];
  }

  async getUsersInVoice(): Promise<DiscordUser[]> {
    return await this.db.select().from(discordUsers).where(eq(discordUsers.inVoiceChannel, true));
  }

  async updateLastVoicePointEarned(userId: string, timestamp: number | null): Promise<DiscordUser> {
    const result = await this.db.update(discordUsers)
      .set({ lastVoicePointEarned: timestamp })
      .where(eq(discordUsers.id, userId))
      .returning();
    
    if (!result[0]) {
      throw new Error(`User ${userId} not found`);
    }
    return result[0];
  }

  async getRecentActivities(limit: number): Promise<Activity[]> {
    return await this.db.select().from(activities).orderBy(desc(activities.timestamp)).limit(limit);
  }

  async getAllActivities(): Promise<Activity[]> {
    return await this.db.select().from(activities).orderBy(desc(activities.timestamp));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const result = await this.db.insert(activities).values(insertActivity).returning();
    return result[0];
  }

  async getActivityByLink(link: string): Promise<Activity | undefined> {
    const result = await this.db.select().from(activities).where(eq(activities.link, link)).limit(1);
    return result[0];
  }

  async getActivityByMessageId(messageId: string): Promise<Activity | undefined> {
    const result = await this.db.select().from(activities).where(eq(activities.messageId, messageId)).limit(1);
    return result[0];
  }

  async deleteActivity(id: string): Promise<void> {
    await this.db.delete(activities).where(eq(activities.id, id));
  }

  async getApiKey(key: string): Promise<ApiKey | undefined> {
    const result = await this.db.select().from(apiKeys).where(eq(apiKeys.key, key)).limit(1);
    return result[0];
  }

  async getApiKeyById(id: string): Promise<ApiKey | undefined> {
    const result = await this.db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
    return result[0];
  }

  async getAllApiKeys(): Promise<ApiKey[]> {
    return await this.db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const result = await this.db.insert(apiKeys).values({
      ...insertApiKey,
      createdAt: Date.now(),
      lastUsed: null,
    }).returning();
    return result[0];
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  async updateApiKeyLastUsed(id: string, timestamp: number): Promise<void> {
    await this.db.update(apiKeys)
      .set({ lastUsed: timestamp })
      .where(eq(apiKeys.id, id));
  }

  async getStats(): Promise<DashboardStats> {
    const allUsers = await this.db.select().from(discordUsers);
    const allActivities = await this.db.select().from(activities);
    
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const activeToday = new Set(
      allActivities
        .filter(a => a.timestamp >= oneDayAgo)
        .map(a => a.userId)
    ).size;

    return {
      totalUsers: allUsers.length,
      totalPoints: allUsers.reduce((sum, user) => sum + user.points, 0),
      activeToday,
      linksPosted: allActivities.length,
      botStatus: this.botStatus,
      lastSync: this.lastSync,
    };
  }
}

let storage: IStorage = new MemStorage();

export function initializeStorage(useDatabaseStorage: boolean) {
  if (useDatabaseStorage && process.env.DATABASE_URL) {
    storage = new DbStorage();
    console.log('📊 Using database storage - data will persist across restarts');
  } else {
    console.log('💾 Using in-memory storage - data will be lost on restart');
  }
}

export { storage };
