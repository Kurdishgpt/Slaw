import type { Context, Config } from "@netlify/functions";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { apiKeys } from "../../shared/schema";
import { eq } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const keyId = pathParts[pathParts.length - 1];

    if (!keyId) {
      return new Response(JSON.stringify({ error: "Key ID is required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const databaseUrl = Netlify.env.get("DATABASE_URL");
    
    if (databaseUrl) {
      const pool = new Pool({ connectionString: databaseUrl });
      const db = drizzle(pool);
      
      await db.delete(apiKeys).where(eq(apiKeys.id, keyId));
      
      return new Response(JSON.stringify({ success: true }), {
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
    console.error('Error revoking API key:', error);
    return new Response(JSON.stringify({ error: "Failed to revoke API key" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const config: Config = {
  path: "/api/keys/*"
};
