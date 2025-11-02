import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, bigint, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Discord User with point tracking
export const discordUsers = pgTable("discord_users", {
  id: varchar("id").primaryKey(), // Discord user ID
  username: text("username").notNull(),
  discriminator: text("discriminator"),
  avatar: text("avatar"),
  points: integer("points").notNull().default(0),
  lastPointEarned: bigint("last_point_earned", { mode: "number" }),
  dailyLinksPosted: integer("daily_links_posted").notNull().default(0),
  lastDailyReset: bigint("last_daily_reset", { mode: "number" }),
  linkedApiKey: text("linked_api_key"),
  inVoiceChannel: boolean("in_voice_channel").notNull().default(false),
  voiceChannelName: text("voice_channel_name"),
  voiceChannelJoinedAt: bigint("voice_channel_joined_at", { mode: "number" }),
  lastVoicePointEarned: bigint("last_voice_point_earned", { mode: "number" }),
});

// Activity log for tracking point-earning events
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'paste', 'server', or 'voice'
  link: text("link").notNull(),
  messageId: varchar("message_id"),
  pointsEarned: integer("points_earned").notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
});

// API Keys for exporting data
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  lastUsed: bigint("last_used", { mode: "number" }),
});

// Schemas
export const insertDiscordUserSchema = createInsertSchema(discordUsers).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

// Types
export type DiscordUser = typeof discordUsers.$inferSelect;
export type InsertDiscordUser = z.infer<typeof insertDiscordUserSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

// Stats type for dashboard
export type DashboardStats = {
  totalUsers: number;
  totalPoints: number;
  activeToday: number;
  linksPosted: number;
  botStatus: 'online' | 'offline';
  lastSync: number;
};

// User profile with voice status
export type UserProfile = {
  id: string;
  username: string;
  discriminator: string | null;
  avatar: string | null;
  points: number;
  inVoiceChannel: boolean;
  voiceChannelName: string | null;
  voiceChannelJoinedAt: number | null;
};
