import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { apiKeys } from "../../shared/schema.js";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
const sqlClient = neon(connectionString);
const db = drizzle(sqlClient);

export async function handler(event, context) {
  if (event.httpMethod !== 'DELETE') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const pathParts = event.path.split('/');
    const id = pathParts[pathParts.length - 1];

    await db.delete(apiKeys).where(eq(apiKeys.id, id));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error deleting API key:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete API key' }),
    };
  }
}
