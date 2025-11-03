import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, sql, and, isNotNull } from "drizzle-orm";
import { discordUsers, activities, apiKeys } from "./schema.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sqlClient = neon(connectionString);
export const db = drizzle(sqlClient);

export const storage = {
  async getUser(id) {
    const result = await db.select().from(discordUsers).where(eq(discordUsers.id, id));
    return result[0];
  },

  async upsertUser(discordId, username, discriminator, avatar) {
    const existing = await this.getUser(discordId);
    
    if (existing) {
      const result = await db.update(discordUsers)
        .set({ username, discriminator, avatar })
        .where(eq(discordUsers.id, discordId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(discordUsers)
        .values({
          id: discordId,
          username,
          discriminator,
          avatar,
          points: 0,
          dailyLinksPosted: 0,
          inVoiceChannel: false,
        })
        .returning();
      return result[0];
    }
  },

  async updateUserPoints(id, points, timestamp) {
    const result = await db.update(discordUsers)
      .set({ points, lastPointEarned: timestamp })
      .where(eq(discordUsers.id, id))
      .returning();
    return result[0];
  },

  async resetDailyLinksIfNeeded(userId) {
    const user = await this.getUser(userId);
    if (!user) return null;

    const now = Date.now();
    const lastReset = user.lastDailyReset || 0;
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      const result = await db.update(discordUsers)
        .set({ dailyLinksPosted: 0, lastDailyReset: now })
        .where(eq(discordUsers.id, userId))
        .returning();
      return result[0];
    }

    return user;
  },

  async incrementDailyLinks(userId) {
    const user = await this.getUser(userId);
    const result = await db.update(discordUsers)
      .set({ dailyLinksPosted: (user.dailyLinksPosted || 0) + 1 })
      .where(eq(discordUsers.id, userId))
      .returning();
    return result[0];
  },

  async decrementDailyLinks(userId) {
    const user = await this.getUser(userId);
    const result = await db.update(discordUsers)
      .set({ dailyLinksPosted: Math.max(0, (user.dailyLinksPosted || 0) - 1) })
      .where(eq(discordUsers.id, userId))
      .returning();
    return result[0];
  },

  async createActivity(activity) {
    const result = await db.insert(activities)
      .values(activity)
      .returning();
    return result[0];
  },

  async getActivityByLink(link) {
    const result = await db.select().from(activities).where(eq(activities.link, link));
    return result[0];
  },

  async getActivityByMessageId(messageId) {
    const result = await db.select().from(activities).where(eq(activities.messageId, messageId));
    return result[0];
  },

  async deleteActivity(id) {
    await db.delete(activities).where(eq(activities.id, id));
  },

  async updateVoiceStatus(userId, inVoice, channelName) {
    const now = Date.now();
    const updates = {
      inVoiceChannel: inVoice,
      voiceChannelName: channelName,
    };

    if (inVoice) {
      updates.voiceChannelJoinedAt = now;
      updates.lastVoicePointEarned = null;
    } else {
      updates.voiceChannelJoinedAt = null;
      updates.lastVoicePointEarned = null;
    }

    const result = await db.update(discordUsers)
      .set(updates)
      .where(eq(discordUsers.id, userId))
      .returning();
    return result[0];
  },

  async getUsersInVoice() {
    return await db.select()
      .from(discordUsers)
      .where(eq(discordUsers.inVoiceChannel, true));
  },

  async updateLastVoicePointEarned(userId, timestamp) {
    const result = await db.update(discordUsers)
      .set({ lastVoicePointEarned: timestamp })
      .where(eq(discordUsers.id, userId))
      .returning();
    return result[0];
  },

  async getUserByApiKey(apiKey) {
    const result = await db.select()
      .from(discordUsers)
      .where(eq(discordUsers.linkedApiKey, apiKey));
    return result[0];
  },

  async linkApiKey(userId, apiKey) {
    const result = await db.update(discordUsers)
      .set({ linkedApiKey: apiKey })
      .where(eq(discordUsers.id, userId))
      .returning();
    return result[0];
  },
};
