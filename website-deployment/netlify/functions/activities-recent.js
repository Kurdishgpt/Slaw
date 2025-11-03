import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { activities, discordUsers } from "../../shared/schema.js";
import { desc, eq } from "drizzle-orm";

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
    const recentActivities = await db.select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(50);

    const activitiesWithUsers = await Promise.all(
      recentActivities.map(async (activity) => {
        const [user] = await db.select()
          .from(discordUsers)
          .where(eq(discordUsers.id, activity.userId));
        
        return {
          ...activity,
          username: user?.username || 'Unknown User',
          avatar: user?.avatar || null,
        };
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(activitiesWithUsers),
    };
  } catch (error) {
    console.error('Error fetching activities:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch activities' }),
    };
  }
}
