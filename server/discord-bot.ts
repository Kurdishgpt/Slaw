import { Client, GatewayIntentBits, Message } from 'discord.js';
import { storage } from './storage';

const COOLDOWN_HOURS = 14;
const MAX_POINTS = 10;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

// Regex patterns for paste links and server invites
const PASTE_LINK_PATTERNS = [
  /pastebin\.com\/\w+/i,
  /paste\.ee\/\w+/i,
  /hastebin\.com\/\w+/i,
  /ghostbin\.com\/paste\/\w+/i,
  /dpaste\.com\/\w+/i,
  /paste\.ubuntu\.com\/\w+/i,
  /controlc\.com\/\w+/i,
  /privnote\.com\/\w+/i,
  /jpst\.it\/\w+/i,
  /rentry\.co\/\w+/i,
];

const SERVER_INVITE_PATTERN = /discord(?:\.gg|app\.com\/invite)\/[\w-]+/i;

function detectLinkType(content: string): 'paste' | 'server' | null {
  // Check for paste links
  for (const pattern of PASTE_LINK_PATTERNS) {
    if (pattern.test(content)) {
      return 'paste';
    }
  }
  
  // Check for server invites
  if (SERVER_INVITE_PATTERN.test(content)) {
    return 'server';
  }
  
  return null;
}

export async function initializeDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const targetChannelId = process.env.DISCORD_TARGET_CHANNEL_ID;

  if (!token) {
    console.error('❌ DISCORD_BOT_TOKEN is not set');
    return;
  }

  if (!targetChannelId) {
    console.error('❌ DISCORD_TARGET_CHANNEL_ID is not set');
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.on('ready', () => {
    console.log(`✅ Discord bot logged in as ${client.user?.tag}`);
    storage.setBotStatus('online');
  });

  client.on('messageCreate', async (message: Message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Only process messages in the target channel
    if (message.channelId !== targetChannelId) return;

    const linkType = detectLinkType(message.content);
    if (!linkType) return;

    const userId = message.author.id;
    const username = message.author.username;
    const discriminator = message.author.discriminator === '0' ? null : message.author.discriminator;
    const avatar = message.author.avatar;

    try {
      // Get or create user
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.upsertUser(userId, username, discriminator, avatar);
      } else {
        // Update user info
        user = await storage.upsertUser(userId, username, discriminator, avatar);
      }

      // Check if user has reached max points
      if (user.points >= MAX_POINTS) {
        await message.reply(`⚠️ You've already reached the maximum of ${MAX_POINTS} points!`);
        return;
      }

      // Check cooldown
      if (user.lastPointEarned) {
        const timeSinceLastPoint = Date.now() - user.lastPointEarned;
        if (timeSinceLastPoint < COOLDOWN_MS) {
          const hoursRemaining = Math.ceil((COOLDOWN_MS - timeSinceLastPoint) / (1000 * 60 * 60));
          await message.reply(`⏳ You're on cooldown! You can earn points again in ${hoursRemaining} hours.`);
          return;
        }
      }

      // Award point
      const newPoints = user.points + 1;
      const timestamp = Date.now();
      await storage.updateUserPoints(userId, newPoints, timestamp);

      // Log activity
      await storage.createActivity({
        userId: userId,
        type: linkType,
        link: message.content,
        pointsEarned: 1,
        timestamp,
      });

      // Send confirmation
      const linkTypeText = linkType === 'paste' ? 'paste link' : 'server invite';
      const pointsLeft = MAX_POINTS - newPoints;
      
      if (newPoints >= MAX_POINTS) {
        await message.reply(`🎉 +1 point for posting a ${linkTypeText}! You've reached the maximum of ${MAX_POINTS} points!`);
      } else {
        await message.reply(`✅ +1 point for posting a ${linkTypeText}! Total: ${newPoints}/${MAX_POINTS} points. ${pointsLeft} points remaining.`);
      }

      console.log(`✅ Awarded 1 point to ${username} (${userId}) for ${linkType} link. Total: ${newPoints} points`);
    } catch (error) {
      console.error('Error processing message:', error);
      await message.reply('❌ An error occurred while processing your message.');
    }
  });

  client.on('error', (error) => {
    console.error('Discord client error:', error);
    storage.setBotStatus('offline');
  });

  client.on('disconnect', () => {
    console.log('❌ Discord bot disconnected');
    storage.setBotStatus('offline');
  });

  try {
    await client.login(token);
  } catch (error) {
    console.error('❌ Failed to login to Discord:', error);
    storage.setBotStatus('offline');
  }

  return client;
}
