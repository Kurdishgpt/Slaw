import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, bigint, boolean } from "drizzle-orm/pg-core";

export const discordUsers = pgTable("discord_users", {
  id: varchar("id").primaryKey(),
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

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  link: text("link").notNull(),
  messageId: varchar("message_id"),
  pointsEarned: integer("points_earned").notNull(),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  lastUsed: bigint("last_used", { mode: "number" }),
});
