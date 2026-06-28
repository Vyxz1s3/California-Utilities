import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { checkCooldown } from '../utils/cooldown.js';
import { getOrCreateGuild } from '../utils/helpers.js';
import { query } from '../database/db.js';
import { getRobloxUser, getRobloxUserProfile } from '../utils/robloxApi.js';

// ─── Verification helpers (mirrored from verify.js) ───────────────────────────

function generateVerificationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function upsertVerificationCode(guildId, userId, code) {
  await query(
    `INSERT INTO verification_codes (guild_id, user_id, code, verified, created_at, expires_at)
     VALUES ($1, $2, $3, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 hour')
     ON CONFLICT (guild_id, user_id) DO UPDATE
       SET code = $3,
           verified = FALSE,
           roblox_username = NULL,
           roblox_user_id = NULL,
           created_at = CURRENT_TIMESTAMP,
           expires_at = CURRENT_TIMESTAMP + INTERVAL '1 hour'`,
    [guildId, userId, code]
  );
}

async function getActiveCode(guildId, userId) {
  const result = await query(
    `SELECT * FROM verification_codes
     WHERE guild_id = $1 AND user_id = $2
       AND verified = FALSE AND expires_at > CURRENT_TIMESTAMP`,
    [guildId, userId]
  );
  return result.rows[0] ?? null;
}

async function getVerificationSettings(guildId) {
  const result = await query(
    'SELECT * FROM guild_verification_settings WHERE guild_id = $1',
    [guildId]
  );
  return result.rows[0] ?? null;
}

async function upsertRobloxVerification(guildId, userId, robloxUsername, robloxUserId) {
  await query(
    `INSERT INTO roblox_verifications (guild_id, user_id, roblox_username, roblox_user_id, verified_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     ON CONFLICT (guild_id, user_id) DO UPDATE
       SET roblox_username = $3, roblox_user_id = $4, verified_at = CURRENT_TIMESTAMP`,
    [guildId, userId, robloxUsername, robloxUserId]
  );
}

// ─── Button: "Start Verification" ─────────────────────────────────────────────

async function handleStartVerification(interaction) {
  // interaction.guild is the server where the button was clicked
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;

  // Check if already verified
  const existingVerification = await query(
    'SELECT * FROM roblox_verifications WHERE guild_id = $1 AND user_id = $2',
    [guildId, userId]
  );
  if (existingVerification.rows.length > 0) {
    const rec = existingVerification.rows[0];
    return interaction.reply({
      content:
        `✅ You are already verified as **${rec.roblox_username}** in this server!`,
      ephemeral: true,
    });
  }

  // Generate and store a fresh code
  const code = generateVerificationCode();
  await upsertVerificationCode(guildId, userId, code);

  // Build the DM embed
  const dmEmbed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('✅ Verification Code Generated')
    .setDescription(
      `Here is your unique verification code for **${interaction.guild.name}**:\n\n` +
      `## \`${code}\`\n\n` +
      '**Instructions:**\n' +
      '1. Go to your Roblox profile and click **Edit**\n' +
      '2. Paste the code above into your **About / Bio** section\n' +
      '3. Save your profile\n' +
      '4. Click **Verify Now** below\n\n' +
      '*You can remove the code from your bio after verification is complete.*'
    )
    .addFields(
      { name: '⏰ Code Expires', value: 'In **1 hour**', inline: true },
      { name: '🔒 Security', value: 'This code is unique to you', inline: true }
    )
    .setFooter({ text: 'Do not share this code with anyone.' })
    .setTimestamp();

  const dmRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`roblox_verify_now:${guildId}`)
      .setLabel('Verify Now')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId(`roblox_cancel:${guildId}`)
      .setLabel('Cancel')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('❌')
  );

  // Try to DM the user
  try {
    await interaction.user.send({ embeds: [dmEmbed], components: [dmRow] });
  } catch {
    return interaction.reply({
      content:
        '❌ I couldn\'t send you a DM. Please enable **Direct Messages** from server members ' +
        'in your Privacy Settings and try again.',
      ephemeral: true,
    });
  }

  return interaction.reply({
    content: '📬 Check your DMs! I\'ve sent you your verification code.',
    ephemeral: true,
  });
}

// ─── Button: "Verify Now" ──────────────────────────────────────────────────────

async function handleVerifyNow(interaction, guildId) {
  const userId = interaction.user.id;

  // Fetch the active code
  const codeRecord = await getActiveCode(guildId, userId);
  if (!codeRecord) {
    return interaction.reply({
      content:
        '❌ Your verification code has **expired** or was already used.\n' +
        'Please click **Start Verification** again in the server to get a new code.',
      ephemeral: true,
    });
  }

  // Show a modal asking for their Roblox username
  const modal = new ModalBuilder()
    .setCustomId(`roblox_submit_username:${guildId}`)
    .setTitle('Enter Your Roblox Username');

  const usernameInput = new TextInputBuilder()
    .setCustomId('roblox_username_input')
    .setLabel('Your exact Roblox username')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Builderman')
    .setRequired(true)
    .setMinLength(3)
    .setMaxLength(20);

  modal.addComponents(new ActionRowBuilder().addComponents(usernameInput));
  await interaction.showModal(modal);
}

// ─── Button: "Cancel" ─────────────────────────────────────────────────────────

async function handleCancel(interaction, guildId) {
  const userId = interaction.user.id;

  await query(
    `UPDATE verification_codes
     SET expires_at = CURRENT_TIMESTAMP
     WHERE guild_id = $1 AND user_id = $2 AND verified = FALSE`,
    [guildId, userId]
  );

  // Edit the DM message to show cancellation
  try {
    await interaction.update({
      content: '❌ Verification cancelled. You can start again anytime.',
      embeds: [],
      components: [],
    });
  } catch {
    await interaction.reply({
      content: '❌ Verification cancelled.',
      ephemeral: true,
    });
  }
}

// ─── Modal submit: username entry ─────────────────────────────────────────────

async function handleUsernameSubmit(interaction, guildId) {
  await interaction.deferReply({ ephemeral: true });

  const userId = interaction.user.id;
  const username = interaction.fields.getTextInputValue('roblox_username_input').trim();

  // Re-fetch the active code (it may have expired between modal open and submit)
  const codeRecord = await getActiveCode(guildId, userId);
  if (!codeRecord) {
    return interaction.editReply({
      content:
        '❌ Your verification code has **expired**.\n' +
        'Please click **Start Verification** again in the server to get a new code.',
    });
  }

  // Look up the Roblox user
  const robloxUser = await getRobloxUser(username);
  if (!robloxUser) {
    return interaction.editReply({
      content:
        `❌ Could not find a Roblox account with the username **${username}**.\n` +
        'Please double-check your username (not your display name) and try again.',
    });
  }

  // Fetch their profile to read the bio
  const profile = await getRobloxUserProfile(robloxUser.id);
  const bio = profile?.description ?? '';

  if (!bio.includes(codeRecord.code)) {
    const retryRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`roblox_verify_now:${guildId}`)
        .setLabel('Try Again')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🔄'),
      new ButtonBuilder()
        .setCustomId(`roblox_cancel:${guildId}`)
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌')
    );

    return interaction.editReply({
      content:
        `❌ **Code not found in your Roblox profile bio.**\n\n` +
        `Make sure you have added \`${codeRecord.code}\` to your **About** section on Roblox, ` +
        `then try again.\n\n` +
        `🔗 [Open your Roblox profile](https://www.roblox.com/users/${robloxUser.id}/profile)`,
      components: [retryRow],
    });
  }

  // ── Code verified! ────────────────────────────────────────────────────────

  // Mark code as verified
  await query(
    `UPDATE verification_codes
     SET verified = TRUE, roblox_username = $3, roblox_user_id = $4
     WHERE guild_id = $1 AND user_id = $2`,
    [guildId, userId, robloxUser.name, robloxUser.id]
  );

  // Persist to roblox_verifications
  await upsertRobloxVerification(guildId, userId, robloxUser.name, robloxUser.id);

  // Assign/remove roles in the guild
  const settings = await getVerificationSettings(guildId);
  let rolesChanged = false;

  try {
    const guild = await interaction.client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);

    if (settings?.verified_role_id) {
      const verifiedRole = guild.roles.cache.get(String(settings.verified_role_id));
      if (verifiedRole) {
        await member.roles.add(verifiedRole, 'Roblox verification').catch(() => {});
        rolesChanged = true;
      }
    }

    if (settings?.unverified_role_id) {
      const unverifiedRole = guild.roles.cache.get(String(settings.unverified_role_id));
      if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
        await member.roles.remove(unverifiedRole, 'Roblox verification').catch(() => {});
      }
    }
  } catch (err) {
    console.error('[Verification] Error assigning roles:', err.message);
  }

  const successEmbed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('✅ Verification Successful!')
    .setDescription(
      `You've been verified as **${robloxUser.name}** on Roblox. Welcome!`
    )
    .addFields(
      { name: '🎮 Roblox Username', value: robloxUser.name, inline: true },
      { name: '🆔 Roblox User ID', value: String(robloxUser.id), inline: true },
      {
        name: '🎭 Role',
        value: rolesChanged
          ? `<@&${settings.verified_role_id}> has been assigned.`
          : settings?.verified_role_id
            ? '⚠️ Role could not be assigned — check bot permissions.'
            : 'No verified role configured. Ask an admin to run `/verify setup`.',
        inline: false,
      }
    )
    .setFooter({ text: 'You can now remove the code from your Roblox bio.' })
    .setTimestamp();

  return interaction.editReply({ embeds: [successEmbed], components: [] });
}

// ─── Main event handler ───────────────────────────────────────────────────────

export default {
  name: 'interactionCreate',
  async execute(client, interaction) {
    // ── Button interactions ──────────────────────────────────────────────────
    if (interaction.isButton()) {
      const { customId } = interaction;

      try {
        if (customId === 'roblox_start_verification') {
          // Must be used inside a guild
          if (!interaction.guild) {
            return interaction.reply({
              content: '❌ This button can only be used inside a server.',
              ephemeral: true,
            });
          }
          await getOrCreateGuild(interaction.guild.id, interaction.guild.name);
          return await handleStartVerification(interaction);
        }

        if (customId.startsWith('roblox_verify_now:')) {
          const guildId = customId.split(':')[1];
          return await handleVerifyNow(interaction, guildId);
        }

        if (customId.startsWith('roblox_cancel:')) {
          const guildId = customId.split(':')[1];
          return await handleCancel(interaction, guildId);
        }
      } catch (err) {
        console.error('[Verification] Button handler error:', err);
        const reply = { content: '❌ An error occurred. Please try again.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }

      return;
    }

    // ── Modal submit interactions ────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      const { customId } = interaction;

      try {
        if (customId.startsWith('roblox_submit_username:')) {
          const guildId = customId.split(':')[1];
          return await handleUsernameSubmit(interaction, guildId);
        }
      } catch (err) {
        console.error('[Verification] Modal handler error:', err);
        const reply = { content: '❌ An error occurred. Please try again.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply).catch(() => {});
        } else {
          await interaction.reply(reply).catch(() => {});
        }
      }

      return;
    }

    // ── Slash command interactions ───────────────────────────────────────────
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      // Check cooldown
      const cooldown = checkCooldown(client, interaction.user.id, interaction.commandName, 3);
      if (cooldown.onCooldown) {
        return interaction.reply({
          content: `⏱️ You're on cooldown! Try again in ${cooldown.timeLeft}s`,
          ephemeral: true,
        });
      }

      // Ensure guild exists in database
      if (interaction.guild) {
        await getOrCreateGuild(interaction.guild.id, interaction.guild.name);
      }

      await command.execute(interaction, client);
    } catch (err) {
      console.error(`Error executing slash command ${interaction.commandName}:`, err);
      const reply = {
        content: '❌ An error occurred while executing this command.',
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};

