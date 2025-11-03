import type { Context, Config } from "@netlify/functions";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { discordUsers, activities, apiKeys } from "../../shared/schema";
import { eq } from "drizzle-orm";

const WEBHOOK_SECRET = "DISCORD_WEBHOOK_SECRET";

interface DiscordWebhookPayload {
  type: "message" | "voice_join" | "voice_leave" | "login";
  userId: string;
  username: string;
  discriminator?: string;
  avatar?: string;
  points?: number;
  linkType?: "paste" | "server" | "voice";
  link?: string;
  messageId?: string;
  apiKey?: string;
  channelName?: string;
}

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const authHeader = req.headers.get('authorization');
    const webhookSecret = Netlify.env.get(WEBHOOK_SECRET);
    
    if (!authHeader || authHeader !== `Bearer ${webhookSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payload: DiscordWebhookPayload = await req.json();
    const databaseUrl = Netlify.env.get("DATABASE_URL");
    
    if (!databaseUrl) {
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const db = drizzle(pool);

    let user = await db.select().from(discordUsers).where(eq(discordUsers.id, payload.userId)).limit(1);
    
    if (user.length === 0 && payload.type !== 'login') {
      const newUser = await db.insert(discordUsers).values({
        id: payload.userId,
        username: payload.username,
        discriminator: payload.discriminator || null,
        avatar: payload.avatar || null,
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
      user = newUser;
    }

    switch (payload.type) {
      case "message":
        if (payload.points && payload.linkType && payload.link) {
          await db.update(discordUsers)
            .set({ 
              points: payload.points, 
              lastPointEarned: Date.now(),
              dailyLinksPosted: (user[0]?.dailyLinksPosted || 0) + 1
            })
            .where(eq(discordUsers.id, payload.userId));

          await db.insert(activities).values({
            userId: payload.userId,
            type: payload.linkType,
            link: payload.link,
            messageId: payload.messageId || null,
            pointsEarned: 1,
            timestamp: Date.now(),
          });
        }
        break;

      case "voice_join":
        await db.update(discordUsers)
          .set({ 
            inVoiceChannel: true,
            voiceChannelName: payload.channelName || null,
            voiceChannelJoinedAt: Date.now()
          })
          .where(eq(discordUsers.id, payload.userId));
        break;

      case "voice_leave":
        await db.update(discordUsers)
          .set({ 
            inVoiceChannel: false,
            voiceChannelName: null,
            voiceChannelJoinedAt: null,
            lastVoicePointEarned: null
          })
          .where(eq(discordUsers.id, payload.userId));
        break;

      case "login":
        if (payload.apiKey) {
          const keyRecord = await db.select().from(apiKeys).where(eq(apiKeys.key, payload.apiKey)).limit(1);
          
          if (keyRecord.length === 0) {
            return new Response(JSON.stringify({ error: "Invalid API key" }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          const existingUser = await db.select().from(discordUsers)
            .where(eq(discordUsers.linkedApiKey, payload.apiKey))
            .limit(1);
          
          if (existingUser.length > 0 && existingUser[0].id !== payload.userId) {
            return new Response(JSON.stringify({ error: "API key already linked" }), {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          if (user.length === 0) {
            await db.insert(discordUsers).values({
              id: payload.userId,
              username: payload.username,
              discriminator: payload.discriminator || null,
              avatar: payload.avatar || null,
              points: 0,
              lastPointEarned: null,
              dailyLinksPosted: 0,
              lastDailyReset: null,
              linkedApiKey: payload.apiKey,
              inVoiceChannel: false,
              voiceChannelName: null,
              voiceChannelJoinedAt: null,
              lastVoicePointEarned: null,
            });
          } else {
            await db.update(discordUsers)
              .set({ linkedApiKey: payload.apiKey })
              .where(eq(discordUsers.id, payload.userId));
          }
        }
        break;
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing Discord webhook:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const config: Config = {
  path: "/api/discord/webhook"
};
