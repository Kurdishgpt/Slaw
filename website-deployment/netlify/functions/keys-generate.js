import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { apiKeys } from "../../shared/schema.js";
import { randomBytes } from "crypto";

const connectionString = process.env.DATABASE_URL;
const sqlClient = neon(connectionString);
const db = drizzle(sqlClient);

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const key = randomBytes(32).toString('hex');
    const now = Date.now();

    const [newKey] = await db.insert(apiKeys)
      .values({
        key,
        createdAt: now,
      })
      .returning();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(newKey),
    };
  } catch (error) {
    console.error('Error generating API key:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate API key' }),
    };
  }
}
