import type { Context, Config } from "@netlify/functions";
import { randomBytes } from "crypto";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { apiKeys } from "../../shared/schema";

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const databaseUrl = Netlify.env.get("DATABASE_URL");
    
    if (databaseUrl) {
      const pool = new Pool({ connectionString: databaseUrl });
      const db = drizzle(pool);
      
      const key = randomBytes(32).toString('hex');
      const result = await db.insert(apiKeys).values({
        key,
        createdAt: Date.now(),
        lastUsed: null,
      }).returning();
      
      return new Response(JSON.stringify(result[0]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: "Database not configured" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error generating API key:', error);
    return new Response(JSON.stringify({ error: "Failed to generate API key" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const config: Config = {
  path: "/api/keys/generate"
};
