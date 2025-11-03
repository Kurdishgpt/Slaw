import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { discordUsers, activities } from "../../shared/schema.js";
import { sql, gte } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
const sqlClient = neon(connectionString);
const db = drizzle(sqlClient);

export async function handler(event, context) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    const [totalUsersResult] = await db.select({ count: sql<number>`count(*)::int` }).from(discordUsers);
    const [totalPointsResult] = await db.select({ sum: sql<number>`coalesce(sum(${discordUsers.points}), 0)::int` }).from(discordUsers);
    const [activeTodayResult] = await db.select({ count: sql<number>`count(distinct ${activities.userId})::int` }).from(activities).where(gte(activities.timestamp, oneDayAgo));
    const [linksPostedResult] = await db.select({ count: sql<number>`count(*)::int` }).from(activities);

    const stats = {
      totalUsers: totalUsersResult?.count || 0,
      totalPoints: totalPointsResult?.sum || 0,
      activeToday: activeTodayResult?.count || 0,
      linksPosted: linksPostedResult?.count || 0,
      botStatus: 'online',
      lastSync: now,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(stats),
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch stats' }),
    };
  }
}
