import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { storage } from './database.js';

const COOLDOWN_HOURS = 14;
const MAX_POINTS = 999;
const DAILY_LINK_LIMIT = 10;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;
const VOICE_POINT_INTERVAL_MS = 60 * 60 * 1000;
const VOICE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

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

function detectLinkType(content) {
  for (const pattern of PASTE_LINK_PATTERNS) {
    if (pattern.test(content)) return 'paste';
  }
  if (SERVER_INVITE_PATTERN.test(content)) return 'server';
  return null;
}

function extractLink(content, linkType) {
  if (linkType === 'paste') {
    for (const pattern of PASTE_LINK_PATTERNS) {
      const match = content.match(pattern);
      if (match) return match[0].toLowerCase();
    }
  } else if (linkType === 'server') {
    const match = content.match(SERVER_INVITE_PATTERN);
    if (match) return match[0].toLowerCase();
  }
  return null;
}

async function checkAndAwardVoicePoints() {
  try {
    const usersInVoice = await storage.getUsersInVoice();
    const now = Date.now();

    for (const user of usersInVoice) {
      if (user.points >= MAX_POINTS) continue;

      const referenceTime = user.lastVoicePointEarned || user.voiceChannelJoinedAt;
      if (!referenceTime) continue;

      const timeInVoice = now - referenceTime;

      if (timeInVoice >= VOICE_POINT_INTERVAL_MS) {
        const hoursEarned = Math.floor(timeInVoice / VOICE_POINT_INTERVAL_MS);
        const pointsToAward = Math.min(hoursEarned, MAX_POINTS - user.points);

        if (pointsToAward > 0) {
          const newPoints = user.points + pointsToAward;
          await storage.updateUserPoints(user.id, newPoints, now);

          const newLastVoicePointEarned = referenceTime + (hoursEarned * VOICE_POINT_INTERVAL_MS);
          await storage.updateLastVoicePointEarned(user.id, newLastVoicePointEarned);

          for (let i = 0; i < pointsToAward; i++) {
            await storage.createActivity({
              userId: user.id,
              type: 'voice',
              link: user.voiceChannelName || 'Voice Channel',
              pointsEarned: 1,
              timestamp: now,
            });
          }

          console.log(`🎤 Awarded ${pointsToAward} point(s) to ${user.username} for voice activity. Total: ${newPoints}`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking voice points:', error);
  }
}

async function startBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const targetChannelId = process.env.DISCORD_TARGET_CHANNEL_ID;

  if (!token) {
    console.error('❌ DISCORD_BOT_TOKEN is required');
    process.exit(1);
  }

  if (!targetChannelId) {
    console.log('⚠️  DISCORD_TARGET_CHANNEL_ID not set - link/invite tracking disabled');
    console.log('   Voice point tracking will still work');
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
    console.log(`✅ Bot logged in as ${client.user.tag}`);

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
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );
      console.log('✅ Slash commands registered');
    } catch (error) {
      console.error('❌ Error registering slash commands:', error);
    }

    setInterval(checkAndAwardVoicePoints, VOICE_CHECK_INTERVAL_MS);
    checkAndAwardVoicePoints();
    console.log('🎤 Voice point checker started');
  });

  if (targetChannelId) {
    client.on('messageCreate', async (message) => {
      if (message.author.bot || message.channelId !== targetChannelId) return;

      const linkType = detectLinkType(message.content);
      if (!linkType) return;

      const userId = message.author.id;
      const username = message.author.username;
      const discriminator = message.author.discriminator === '0' ? null : message.author.discriminator;
      const avatar = message.author.avatar;

      try {
        let user = await storage.getUser(userId);
        if (!user) {
          user = await storage.upsertUser(userId, username, discriminator, avatar);
        } else {
          user = await storage.upsertUser(userId, username, discriminator, avatar);
        }

        user = await storage.resetDailyLinksIfNeeded(userId);

        if (user.points >= MAX_POINTS) {
          await message.reply('❌ You have reached the maximum points limit (999). No more points can be earned.');
          return;
        }

        if (user.dailyLinksPosted >= DAILY_LINK_LIMIT) {
          await message.reply(`❌ You have reached the daily link limit (${DAILY_LINK_LIMIT}). Try again in 24 hours.`);
          return;
        }

        const link = extractLink(message.content, linkType);
        if (!link) return;

        const existingActivity = await storage.getActivityByLink(link);
        if (existingActivity) {
          await message.reply('❌ This link has already been posted and awarded points.');
          return;
        }

        const now = Date.now();
        const lastPoint = user.lastPointEarned || 0;
        const timeSinceLastPoint = now - lastPoint;

        if (timeSinceLastPoint < COOLDOWN_MS) {
          const hoursLeft = Math.ceil((COOLDOWN_MS - timeSinceLastPoint) / (1000 * 60 * 60));
          await message.reply(`⏰ Cooldown active. You can earn points again in ${hoursLeft} hour(s).`);
          return;
        }

        const newPoints = user.points + 1;
        await storage.updateUserPoints(userId, newPoints, now);
        await storage.incrementDailyLinks(userId);

        await storage.createActivity({
          userId,
          type: linkType,
          link,
          messageId: message.id,
          pointsEarned: 1,
          timestamp: now,
        });

        const typeEmoji = linkType === 'paste' ? '📋' : '🎫';
        await message.reply(`${typeEmoji} +1 point! You now have ${newPoints} points. (${user.dailyLinksPosted + 1}/${DAILY_LINK_LIMIT} daily links)`);
        console.log(`${typeEmoji} ${username} earned 1 point for ${linkType} link. Total: ${newPoints}`);
      } catch (error) {
        console.error('Error processing message:', error);
        await message.reply('❌ An error occurred while processing your request.');
      }
    });
  }

  client.on('messageDelete', async (message) => {
    if (!message.author || message.author.bot) return;

    try {
      const activity = await storage.getActivityByMessageId(message.id);
      if (!activity) return;

      const user = await storage.getUser(activity.userId);
      if (!user) return;

      const newPoints = Math.max(0, user.points - activity.pointsEarned);
      await storage.updateUserPoints(activity.userId, newPoints, Date.now());
      await storage.decrementDailyLinks(activity.userId);
      await storage.deleteActivity(activity.id);

      console.log(`🗑️  Removed ${activity.pointsEarned} point(s) from ${user.username} (deleted message)`);
    } catch (error) {
      console.error('Error handling message deletion:', error);
    }
  });

  client.on('voiceStateUpdate', async (oldState, newState) => {
    const userId = newState.id;
    const member = newState.member;

    if (!member) return;

    try {
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.upsertUser(
          userId,
          member.user.username,
          member.user.discriminator === '0' ? null : member.user.discriminator,
          member.user.avatar
        );
      }

      const wasInVoice = oldState.channelId !== null;
      const isInVoice = newState.channelId !== null;

      if (!wasInVoice && isInVoice) {
        await storage.updateVoiceStatus(userId, true, newState.channel.name);
        console.log(`🎤 ${member.user.username} joined ${newState.channel.name}`);
      } else if (wasInVoice && !isInVoice) {
        await storage.updateVoiceStatus(userId, false, null);
        console.log(`🎤 ${member.user.username} left voice channel`);
      }
    } catch (error) {
      console.error('Error handling voice state update:', error);
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'login') {
      const apiKey = interaction.options.getString('apikey');

      try {
        const existingUser = await storage.getUserByApiKey(apiKey);
        if (existingUser) {
          await interaction.reply({
            content: '❌ This API key is already linked to another Discord account.',
            ephemeral: true,
          });
          return;
        }

        let user = await storage.getUser(interaction.user.id);
        if (!user) {
          user = await storage.upsertUser(
            interaction.user.id,
            interaction.user.username,
            interaction.user.discriminator === '0' ? null : interaction.user.discriminator,
            interaction.user.avatar
          );
        }

        await storage.linkApiKey(interaction.user.id, apiKey);
        await interaction.reply({
          content: '✅ Your Discord account has been successfully linked!',
          ephemeral: true,
        });
      } catch (error) {
        console.error('Error linking API key:', error);
        await interaction.reply({
          content: '❌ Failed to link API key. Please try again.',
          ephemeral: true,
        });
      }
    }
  });

  await client.login(token);
}

startBot().catch(console.error);
