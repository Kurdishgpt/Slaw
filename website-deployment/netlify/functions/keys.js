import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { apiKeys } from "../../shared/schema.js";

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
    const keys = await db.select().from(apiKeys);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(keys),
    };
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch API keys' }),
    };
  }
}
