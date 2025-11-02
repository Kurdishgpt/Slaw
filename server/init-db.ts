import { neon } from "@neondatabase/serverless";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function initializeDatabase(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  No DATABASE_URL found, skipping database initialization');
    return false;
  }

  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log('🗄️  Initializing database...');
      const sql = neon(process.env.DATABASE_URL);

      await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

      await sql`
        CREATE TABLE IF NOT EXISTS discord_users (
          id VARCHAR PRIMARY KEY,
          username TEXT NOT NULL,
          discriminator TEXT,
          avatar TEXT,
          points INTEGER NOT NULL DEFAULT 0,
          last_point_earned BIGINT,
          linked_api_key TEXT,
          in_voice_channel BOOLEAN NOT NULL DEFAULT false,
          voice_channel_name TEXT,
          voice_channel_joined_at BIGINT
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS activities (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR NOT NULL,
          type TEXT NOT NULL,
          link TEXT NOT NULL,
          points_earned INTEGER NOT NULL,
          timestamp BIGINT NOT NULL
        );
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS api_keys (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          key TEXT NOT NULL UNIQUE,
          created_at BIGINT NOT NULL,
          last_used BIGINT
        );
      `;

      console.log('✅ Database tables initialized successfully');
      return true;
    } catch (error) {
      retryCount++;
      if (retryCount < maxRetries) {
        console.log(`⏳ Database not ready, retrying (${retryCount}/${maxRetries})...`);
        await sleep(3000);
      } else {
        console.error('❌ Failed to initialize database after', maxRetries, 'attempts');
        console.error('❌ The Neon database endpoint appears to be disabled.');
        console.error('❌ This is a Replit/Neon service issue - the database needs to be manually enabled.');
        console.error('❌ APPLICATION WILL USE IN-MEMORY STORAGE - DATA WILL BE LOST ON RESTART');
        return false;
      }
    }
  }
  
  return false;
}
