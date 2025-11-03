import type { Context, Config } from "@netlify/functions";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { activities } from "../../shared/schema";
import { desc } from "drizzle-orm";

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
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
      
      const recentActivities = await db.select()
        .from(activities)
        .orderBy(desc(activities.timestamp))
        .limit(10);
      
      return new Response(JSON.stringify(recentActivities), {
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
    console.error('Error fetching activities:', error);
    return new Response(JSON.stringify({ error: "Failed to fetch activities" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const config: Config = {
  path: "/api/activities/recent"
};
