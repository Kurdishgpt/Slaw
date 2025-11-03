import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { discordUsers } from "../../shared/schema.js";
import { desc } from "drizzle-orm";

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
    const users = await db.select()
      .from(discordUsers)
      .orderBy(desc(discordUsers.points))
      .limit(100);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(users),
    };
  } catch (error) {
    console.error('Error fetching top users:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch top users' }),
    };
  }
}
