import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const botToken = Netlify.env.get("DISCORD_BOT_TOKEN");
  const webhookUrl = Netlify.env.get("DISCORD_WEBHOOK_URL");
  
  const status = {
    botConfigured: !!botToken,
    webhookConfigured: !!webhookUrl,
    botStatus: 'offline' as const,
    message: "Discord bot integration requires a standalone bot instance. Configure DISCORD_BOT_TOKEN and DISCORD_WEBHOOK_URL environment variables, then run the bot separately to sync with this dashboard.",
  };

  return new Response(JSON.stringify(status), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

export const config: Config = {
  path: "/api/discord/status"
};
