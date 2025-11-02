import { Client, GatewayIntentBits, Message, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { storage } from './storage';

const COOLDOWN_HOURS = 14;
const MAX_POINTS = 999;
const DAILY_LINK_LIMIT = 10;
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

function extractLink(content: string, linkType: 'paste' | 'server'): string | null {
  if (linkType === 'paste') {
    // Try to match any paste link pattern
    for (const pattern of PASTE_LINK_PATTERNS) {
      const match = content.match(pattern);
      if (match) {
        // Normalize to lowercase for case-insensitive duplicate detection
        return match[0].toLowerCase();
      }
    }
  } else if (linkType === 'server') {
    // Extract server invite
    const match = content.match(SERVER_INVITE_PATTERN);
    if (match) {
      // Normalize to lowercase for case-insensitive duplicate detection
      return match[0].toLowerCase();
    }
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
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  client.on('ready', async () => {
    console.log(`✅ Discord bot logged in as ${client.user?.tag}`);
    storage.setBotStatus('online');

    // Register slash commands
    const commands = [
      new SlashCommandBuilder()
        .setName('login')
        .setDescription('Link your Discord account with an API key')
        .addStringOption(option =>
          option.setName('apikey')
            .setDescription('Your API key from the website')
            .setRequired(true)
        ),
    ].map(command => command.toJSON());

    const rest = new REST().setToken(token);

    try {
      console.log('🔄 Registering slash commands...');
      await rest.put(
        Routes.applicationCommands(client.user!.id),
        { body: commands },
      );
      console.log('✅ Slash commands registered successfully');
    } catch (error) {
      console.error('❌ Error registering slash commands:', error);
    }
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

      // Reset daily limit if needed
      user = await storage.resetDailyLinksIfNeeded(userId);

      // Check if user has reached max points
      if (user.points >= MAX_POINTS) {
        await message.reply(`⚠️ You've already reached the maximum of ${MAX_POINTS} points!`);
        return;
      }

      // Check daily link limit
      if (user.dailyLinksPosted >= DAILY_LINK_LIMIT) {
        await message.reply(`⚠️ You've reached the daily limit of ${DAILY_LINK_LIMIT} links! Try again tomorrow.`);
        return;
      }

      // Extract the actual link from the message
      const extractedLink = extractLink(message.content, linkType);
      if (!extractedLink) {
        await message.reply('❌ Could not extract the link from your message.');
        return;
      }

      // Check for duplicate link using the extracted URL
      const existingActivity = await storage.getActivityByLink(extractedLink);
      if (existingActivity) {
        await message.reply('⚠️ This link has already been posted! Please post a unique link.');
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

      // Increment daily link count
      await storage.incrementDailyLinks(userId);

      // Log activity with the extracted link
      await storage.createActivity({
        userId: userId,
        type: linkType,
        link: extractedLink,
        messageId: message.id,
        pointsEarned: 1,
        timestamp,
      });

      // Send confirmation
      const linkTypeText = linkType === 'paste' ? 'paste link' : 'server invite';
      const linksRemaining = DAILY_LINK_LIMIT - (user.dailyLinksPosted + 1);
      
      if (newPoints >= MAX_POINTS) {
        await message.reply(`🎉 +1 point for posting a ${linkTypeText}! You've reached the maximum of ${MAX_POINTS} points!`);
      } else {
        await message.reply(`✅ +1 point for posting a ${linkTypeText}! Total: ${newPoints}/${MAX_POINTS} points. ${linksRemaining} links left today.`);
      }

      console.log(`✅ Awarded 1 point to ${username} (${userId}) for ${linkType} link. Total: ${newPoints} points`);
    } catch (error) {
      console.error('Error processing message:', error);
      await message.reply('❌ An error occurred while processing your message.');
    }
  });

  // Handle slash commands
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'login') {
      const apiKey = interaction.options.getString('apikey', true);
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const discriminator = interaction.user.discriminator === '0' ? null : interaction.user.discriminator;
      const avatar = interaction.user.avatar;

      try {
        // Verify the API key exists
        const keyRecord = await storage.getApiKey(apiKey);
        if (!keyRecord) {
          await interaction.reply({
            content: '❌ Invalid API key. Please generate a valid API key from the website.',
            ephemeral: true,
          });
          return;
        }

        // Check if API key is already linked
        const existingUser = await storage.getUserByApiKey(apiKey);
        if (existingUser && existingUser.id !== userId) {
          await interaction.reply({
            content: '❌ This API key is already linked to another Discord account.',
            ephemeral: true,
          });
          return;
        }

        // Get or create user
        let user = await storage.getUser(userId);
        if (!user) {
          user = await storage.upsertUser(userId, username, discriminator, avatar);
        }

        // Link the API key
        await storage.linkApiKey(userId, apiKey);

        await interaction.reply({
          content: `✅ Successfully linked your Discord account to the API key! You can now view your profile on the website.`,
          ephemeral: true,
        });

        console.log(`✅ Linked API key for ${username} (${userId})`);
      } catch (error) {
        console.error('Error linking API key:', error);
        await interaction.reply({
          content: '❌ An error occurred while linking your API key.',
          ephemeral: true,
        });
      }
    }
  });

  // Handle message deletion
  client.on('messageDelete', async (message) => {
    // Only process messages from the target channel
    if (message.channelId !== targetChannelId) return;
    
    // Check if this message has an associated activity
    const activity = await storage.getActivityByMessageId(message.id);
    if (!activity) return;

    try {
      const user = await storage.getUser(activity.userId);
      if (!user) return;

      // Remove the point
      const newPoints = Math.max(0, user.points - activity.pointsEarned);
      await storage.updateUserPoints(activity.userId, newPoints, user.lastPointEarned || Date.now());

      // Decrement daily links count
      await storage.decrementDailyLinks(activity.userId);

      // Delete the activity
      await storage.deleteActivity(activity.id);

      console.log(`🗑️ Removed ${activity.pointsEarned} point from ${user.username} (${activity.userId}) due to message deletion. New total: ${newPoints} points`);
    } catch (error) {
      console.error('Error handling message deletion:', error);
    }
  });

  // Handle voice state updates
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const userId = newState.member?.user.id;
    if (!userId) return;

    const username = newState.member?.user.username || 'Unknown';
    const discriminator = newState.member?.user.discriminator === '0' ? null : newState.member?.user.discriminator;
    const avatar = newState.member?.user.avatar || null;

    try {
      // Ensure user exists
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.upsertUser(userId, username, discriminator, avatar);
      }

      // Check if user joined a voice channel
      if (!oldState.channelId && newState.channelId) {
        const channelName = newState.channel?.name || 'Unknown Channel';
        await storage.updateVoiceStatus(userId, true, channelName);
        console.log(`🎤 ${username} joined voice channel: ${channelName}`);
      }
      // Check if user left a voice channel
      else if (oldState.channelId && !newState.channelId) {
        await storage.updateVoiceStatus(userId, false, null);
        console.log(`🔇 ${username} left voice channel`);
      }
      // Check if user switched voice channels
      else if (oldState.channelId !== newState.channelId && newState.channelId) {
        const channelName = newState.channel?.name || 'Unknown Channel';
        await storage.updateVoiceStatus(userId, true, channelName);
        console.log(`🎤 ${username} switched to voice channel: ${channelName}`);
      }
    } catch (error) {
      console.error('Error updating voice status:', error);
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
