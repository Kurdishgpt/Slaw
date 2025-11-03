import type { Context, Config } from "@netlify/functions";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { discordUsers } from "../../shared/schema";
import { desc } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(req.url);
    const isTopUsers = url.pathname.includes('/top');

    const databaseUrl = Netlify.env.get("DATABASE_URL");
    
    if (databaseUrl) {
      const pool = new Pool({ connectionString: databaseUrl });
      const db = drizzle(pool);
      
      const query = db.select().from(discordUsers).orderBy(desc(discordUsers.points));
      const users = isTopUsers ? await query.limit(5) : await query;
      
      return new Response(JSON.stringify(users), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const config: Config = {
  path: ["/api/users", "/api/users/top"]
};
