import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ComponentType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { query } from '../../database/db.js';
import { getRobloxUser } from '../../utils/robloxApi.js';
import { getRandomCaptcha, validateCaptcha } from '../../utils/captcha.js';
import {
  getVerificationSettings as _getVerificationSettings,
  getAttemptRecord,
  performVerification,
  checkAttemptLimit,
  incrementAttempts,
  resetAttempts,
  buildVerificationEmbed,
  buildSuccessEmbed,
} from '../../utils/verification.js';

// ─── Database helpers ─────────────────────────────────────────────────────────

/** Fetch the verification settings for a guild, or null if none exist. */
async function getVerificationSettings(guildId) {
  const result = await query(
    'SELECT * FROM guild_verification_settings WHERE guild_id = $1',
    [guildId]
  );
  return result.rows[0] ?? null;
}

/** Upsert a single column in guild_verification_settings. */
async function upsertVerificationSetting(guildId, column, value) {
  await query(
    `INSERT INTO guild_verification_settings (guild_id, ${column}, updated_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (guild_id) DO UPDATE
       SET ${column} = $2, updated_at = CURRENT_TIMESTAMP`,
    [guildId, value]
  );
}

/** Store or update a user's Roblox verification record. */
async function upsertRobloxVerification(guildId, userId, robloxUsername, robloxUserId) {
  await query(
    `INSERT INTO roblox_verifications (guild_id, user_id, roblox_username, roblox_user_id, verified_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     ON CONFLICT (guild_id, user_id) DO UPDATE
       SET roblox_username = $3, roblox_user_id = $4, verified_at = CURRENT_TIMESTAMP`,
    [guildId, userId, robloxUsername, robloxUserId]
  );
}

// ─── Embed builders ───────────────────────────────────────────────────────────

/** Build the setup overview embed showing current configuration. */
async function buildSetupEmbed(guild) {
  const settings = await getVerificationSettings(guild.id);

  const verifiedRole = settings?.verified_role_id
    ? guild.roles.cache.get(String(settings.verified_role_id)) ?? `<@&${settings.verified_role_id}>`
    : null;

  const unverifiedRole = settings?.unverified_role_id
    ? guild.roles.cache.get(String(settings.unverified_role_id)) ?? `<@&${settings.unverified_role_id}>`
    : null;

  const verificationChannel = settings?.verification_channel_id
    ? guild.channels.cache.get(String(settings.verification_channel_id)) ?? `<#${settings.verification_channel_id}>`
    : null;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🎮 Roblox Verification Setup')
    .setDescription(
      'The Roblox Verification system lets members link their Roblox account to their ' +
      'Discord profile. Once verified, they automatically receive the **Verified** role ' +
      'and lose the **Unverified** role (if configured).\n\n' +
      'Use the buttons below to configure the system for this server.'
    )
    .addFields(
      {
        name: '✅ Verified Role',
        value: verifiedRole
          ? (typeof verifiedRole === 'string' ? verifiedRole : `<@&${verifiedRole.id}>`)
          : '`Not set`',
        inline: true,
      },
      {
        name: '❌ Unverified Role',
        value: unverifiedRole
          ? (typeof unverifiedRole === 'string' ? unverifiedRole : `<@&${unverifiedRole.id}>`)
          : '`Not set`',
        inline: true,
      },
      {
        name: '📢 Verification Channel',
        value: verificationChannel
          ? (typeof verificationChannel === 'string' ? verificationChannel : `<#${verificationChannel.id}>`)
          : '`Not set`',
        inline: true,
      },
      {
        name: '📋 How to set up',
        value:
          '1. Click **Set Verified Role** and choose the role members receive after verifying.\n' +
          '2. *(Optional)* Click **Set Unverified Role** to assign a role to unverified members.\n' +
          '3. *(Optional)* Click **Set Verification Channel** to restrict `/verify` to one channel.\n' +
          '4. Members can then run `/verify <roblox_username>` to link their account.',
        inline: false,
      }
    )
    .setFooter({ text: 'Only users with Manage Server permission can change these settings.' })
    .setTimestamp();

  return embed;
}

/** Build the action-button row for the setup embed. */
function buildSetupButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('verify_set_verified_role')
      .setLabel('Set Verified Role')
      .setStyle(ButtonStyle.Success)
      .setEmoji('✅'),
    new ButtonBuilder()
      .setCustomId('verify_set_unverified_role')
      .setLabel('Set Unverified Role')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('❌'),
    new ButtonBuilder()
      .setCustomId('verify_set_channel')
      .setLabel('Set Verification Channel')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('📢'),
    new ButtonBuilder()
      .setCustomId('verify_instructions')
      .setLabel('View Instructions')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('📋'),
  );
}

/** Build the detailed instructions embed. */
function buildInstructionsEmbed() {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('📋 Roblox Verification — Detailed Instructions')
    .setDescription('Follow these steps to fully configure the Roblox Verification system.')
    .addFields(
      {
        name: 'Step 1 — Set the Verified Role',
        value:
          'Click **Set Verified Role** on the setup panel. A role selector will appear. ' +
          'Choose the role you want members to receive once they have verified their Roblox account. ' +
          'Make sure the bot\'s role is **above** this role in the server\'s role hierarchy.',
        inline: false,
      },
      {
        name: 'Step 2 — Set the Unverified Role (optional)',
        value:
          'Click **Set Unverified Role** and choose a role for members who have not yet verified. ' +
          'This role is automatically removed when a member verifies. ' +
          'You can use this to restrict channel access until members verify.',
        inline: false,
      },
      {
        name: 'Step 3 — Set the Verification Channel (optional)',
        value:
          'Click **Set Verification Channel** and choose a text channel. ' +
          'When set, `/verify` can only be used in that channel, keeping other channels tidy.',
        inline: false,
      },
      {
        name: 'Step 4 — Members verify themselves',
        value:
          'Members run `/verify <roblox_username>` with their exact Roblox username. ' +
          'The bot checks the Roblox API to confirm the account exists, then assigns roles automatically.',
        inline: false,
      },
      {
        name: '⚠️ Important Notes',
        value:
          '• The bot must have **Manage Roles** permission.\n' +
          '• The bot\'s highest role must be above the Verified/Unverified roles.\n' +
          '• Banned Roblox accounts are rejected automatically.\n' +
          '• Each Discord user can only link one Roblox account per server.',
        inline: false,
      }
    )
    .setFooter({ text: 'Run /verify setup to return to the setup panel.' })
    .setTimestamp();
}

// ─── Command definition ───────────────────────────────────────────────────────

export default {
  data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('Roblox verification system')
    .addSubcommand(sub =>
      sub
        .setName('setup')
        .setDescription('Configure the Roblox verification system (admin only)')
    )
    .addSubcommand(sub =>
      sub
        .setName('user')
        .setDescription('Verify your Roblox account and receive the verified role')
        .addStringOption(opt =>
          opt
            .setName('username')
            .setDescription('Your exact Roblox username')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('embed')
        .setDescription('Post a verification embed with a button that members click to verify (admin only)')
        .addStringOption(opt =>
          opt
            .setName('title')
            .setDescription('Embed title (default: 🎮 Roblox Verification)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt
            .setName('description')
            .setDescription('Embed description (leave blank for default text)')
            .setRequired(false)
        )
        .addStringOption(opt =>
          opt
            .setName('color')
            .setDescription('Embed color as a hex code, e.g. #5865F2 (default: blurple)')
            .setRequired(false)
        )
    ),

  name: 'verify',
  description: 'Roblox verification system',

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    // ── /verify setup ────────────────────────────────────────────────────────
    if (sub === 'setup') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({
          content: '❌ You need the **Manage Server** permission to configure verification.',
          ephemeral: true,
        });
      }

      const embed = await buildSetupEmbed(interaction.guild);
      const row = buildSetupButtons();

      const reply = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true,
      });

      // Collect button interactions for this setup panel (5-minute window)
      const collector = reply.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        time: 300_000,
      });

      collector.on('collect', async i => {
        // ── View Instructions ──────────────────────────────────────────────
        if (i.customId === 'verify_instructions') {
          await i.reply({ embeds: [buildInstructionsEmbed()], ephemeral: true });
          return;
        }

        // ── Set Verified Role ──────────────────────────────────────────────
        if (i.customId === 'verify_set_verified_role') {
          const roleRow = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder()
              .setCustomId('verify_role_select_verified')
              .setPlaceholder('Select the Verified role…')
              .setMinValues(1)
              .setMaxValues(1)
          );

          await i.reply({
            content: '👇 Select the role to assign to **verified** members:',
            components: [roleRow],
            ephemeral: true,
          });

          const roleInteraction = await i.channel
            .awaitMessageComponent({
              filter: r =>
                r.customId === 'verify_role_select_verified' &&
                r.user.id === interaction.user.id,
              componentType: ComponentType.RoleSelect,
              time: 60_000,
            })
            .catch(() => null);

          if (!roleInteraction) {
            await i.editReply({ content: '⏱️ Role selection timed out.', components: [] });
            return;
          }

          const role = roleInteraction.roles.first();
          await upsertVerificationSetting(interaction.guild.id, 'verified_role_id', role.id);

          const updatedEmbed = await buildSetupEmbed(interaction.guild);
          await roleInteraction.update({ content: `✅ Verified role set to **${role.name}**.`, components: [] });
          await reply.edit({ embeds: [updatedEmbed], components: [buildSetupButtons()] });
          return;
        }

        // ── Set Unverified Role ────────────────────────────────────────────
        if (i.customId === 'verify_set_unverified_role') {
          const roleRow = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder()
              .setCustomId('verify_role_select_unverified')
              .setPlaceholder('Select the Unverified role…')
              .setMinValues(1)
              .setMaxValues(1)
          );

          await i.reply({
            content: '👇 Select the role to assign to **unverified** members:',
            components: [roleRow],
            ephemeral: true,
          });

          const roleInteraction = await i.channel
            .awaitMessageComponent({
              filter: r =>
                r.customId === 'verify_role_select_unverified' &&
                r.user.id === interaction.user.id,
              componentType: ComponentType.RoleSelect,
              time: 60_000,
            })
            .catch(() => null);

          if (!roleInteraction) {
            await i.editReply({ content: '⏱️ Role selection timed out.', components: [] });
            return;
          }

          const role = roleInteraction.roles.first();
          await upsertVerificationSetting(interaction.guild.id, 'unverified_role_id', role.id);

          const updatedEmbed = await buildSetupEmbed(interaction.guild);
          await roleInteraction.update({ content: `✅ Unverified role set to **${role.name}**.`, components: [] });
          await reply.edit({ embeds: [updatedEmbed], components: [buildSetupButtons()] });
          return;
        }

        // ── Set Verification Channel ───────────────────────────────────────
        if (i.customId === 'verify_set_channel') {
          const channelRow = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
              .setCustomId('verify_channel_select')
              .setPlaceholder('Select the verification channel…')
              .addChannelTypes(ChannelType.GuildText)
              .setMinValues(1)
              .setMaxValues(1)
          );

          await i.reply({
            content: '👇 Select the channel where members should run `/verify`:',
            components: [channelRow],
            ephemeral: true,
          });

          const channelInteraction = await i.channel
            .awaitMessageComponent({
              filter: r =>
                r.customId === 'verify_channel_select' &&
                r.user.id === interaction.user.id,
              componentType: ComponentType.ChannelSelect,
              time: 60_000,
            })
            .catch(() => null);

          if (!channelInteraction) {
            await i.editReply({ content: '⏱️ Channel selection timed out.', components: [] });
            return;
          }

          const channel = channelInteraction.channels.first();
          await upsertVerificationSetting(interaction.guild.id, 'verification_channel_id', channel.id);

          const updatedEmbed = await buildSetupEmbed(interaction.guild);
          await channelInteraction.update({
            content: `✅ Verification channel set to <#${channel.id}>.`,
            components: [],
          });
          await reply.edit({ embeds: [updatedEmbed], components: [buildSetupButtons()] });
          return;
        }
      });

      collector.on('end', async () => {
        // Disable all buttons when the collector expires
        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('verify_set_verified_role')
            .setLabel('Set Verified Role')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅')
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('verify_set_unverified_role')
            .setLabel('Set Unverified Role')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌')
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('verify_set_channel')
            .setLabel('Set Verification Channel')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📢')
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId('verify_instructions')
            .setLabel('View Instructions')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📋')
            .setDisabled(true),
        );
        await reply.edit({ components: [disabledRow] }).catch(() => {});
      });

      return;
    }

    // ── /verify user ─────────────────────────────────────────────────────────
    if (sub === 'user') {
      await interaction.deferReply({ ephemeral: true });

      const username = interaction.options.getString('username').trim();
      const settings = await getVerificationSettings(interaction.guild.id);

      // Enforce verification channel restriction
      if (settings?.verification_channel_id) {
        const allowedChannelId = String(settings.verification_channel_id);
        if (interaction.channel.id !== allowedChannelId) {
          return interaction.editReply({
            content: `❌ Please use <#${allowedChannelId}> to verify your Roblox account.`,
          });
        }
      }

      // Validate username via Roblox API
      const robloxUser = await getRobloxUser(username);

      if (!robloxUser) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle('❌ Roblox Username Not Found')
          .setDescription(
            `Could not find a Roblox account with the username **${username}**.\n\n` +
            'Please double-check your username and try again. Make sure you\'re using your ' +
            '**exact** Roblox username (not your display name).'
          )
          .setFooter({ text: 'Banned Roblox accounts are not accepted.' })
          .setTimestamp();

        return interaction.editReply({ embeds: [errorEmbed] });
      }

      // Assign verified role
      const member = interaction.member;
      let rolesChanged = false;

      if (settings?.verified_role_id) {
        const verifiedRole = interaction.guild.roles.cache.get(String(settings.verified_role_id));
        if (verifiedRole) {
          try {
            await member.roles.add(verifiedRole, 'Roblox verification');
            rolesChanged = true;
          } catch {
            // Bot may lack permissions — we still store the verification and inform the user
          }
        }
      }

      // Remove unverified role
      if (settings?.unverified_role_id) {
        const unverifiedRole = interaction.guild.roles.cache.get(String(settings.unverified_role_id));
        if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
          await member.roles.remove(unverifiedRole, 'Roblox verification').catch(() => {});
        }
      }

      // Persist verification to database
      await upsertRobloxVerification(
        interaction.guild.id,
        interaction.user.id,
        robloxUser.name,
        robloxUser.id
      );

      const successEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('✅ Verification Successful!')
        .setDescription(
          `You've been verified as **${robloxUser.name}** on Roblox. Welcome to the server!`
        )
        .addFields(
          { name: '🎮 Roblox Username', value: robloxUser.name, inline: true },
          { name: '🆔 Roblox User ID', value: String(robloxUser.id), inline: true },
          {
            name: '🎭 Role',
            value: rolesChanged && settings?.verified_role_id
              ? `<@&${settings.verified_role_id}> has been assigned.`
              : settings?.verified_role_id
                ? '⚠️ Role could not be assigned — check bot permissions.'
                : 'No verified role is configured yet. Ask an admin to run `/verify setup`.',
            inline: false,
          }
        )
        .setFooter({ text: 'Your Roblox account is now linked to your Discord profile.' })
        .setTimestamp();

      return interaction.editReply({ embeds: [successEmbed] });
    }

    // ── /verify embed ─────────────────────────────────────────────────────────
    if (sub === 'embed') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.reply({
          content: '❌ You need the **Manage Server** permission to post a verification embed.',
          ephemeral: true,
        });
      }

      const titleOpt       = interaction.options.getString('title')       ?? null;
      const descriptionOpt = interaction.options.getString('description') ?? null;
      const colorOpt       = interaction.options.getString('color')       ?? null;

      // Parse hex color string → integer
      let colorInt = 0x5865f2;
      if (colorOpt) {
        const hex = colorOpt.replace('#', '');
        const parsed = parseInt(hex, 16);
        if (!isNaN(parsed)) colorInt = parsed;
      }

      const embed = buildVerificationEmbed({
        title:       titleOpt,
        description: descriptionOpt,
        color:       colorInt,
      });

      const startButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('verify_embed_start')
          .setLabel('Start Verification')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🎮')
      );

      // Post the embed in the current channel
      const posted = await interaction.channel.send({
        embeds: [embed],
        components: [startButton],
      });

      // Persist the embed record so we can reference it later
      await query(
        `INSERT INTO verification_embeds
           (guild_id, channel_id, message_id, title, description, color, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (guild_id, message_id) DO NOTHING`,
        [
          interaction.guild.id,
          interaction.channel.id,
          posted.id,
          titleOpt,
          descriptionOpt,
          colorInt,
          interaction.user.id,
        ]
      );

      return interaction.reply({
        content: `✅ Verification embed posted in <#${interaction.channel.id}>.`,
        ephemeral: true,
      });
    }
  },
};

// ─── Persistent component handler ─────────────────────────────────────────────
// Called by interactionCreate for button/modal interactions whose customId
// starts with 'verify_embed_'.

/**
 * In-memory CAPTCHA store: maps `${guildId}:${userId}` → { answer, expiresAt }
 * This avoids a DB round-trip for the short-lived CAPTCHA session.
 */
const pendingCaptchas = new Map();

/**
 * Handle button presses and modal submissions originating from a
 * /verify embed posted message.
 *
 * @param {import('discord.js').Interaction} interaction
 */
export async function handleVerifyEmbedInteraction(interaction) {
  const guildId = interaction.guild?.id;
  const userId  = interaction.user.id;

  // ── Button: "Start Verification" ──────────────────────────────────────────
  if (interaction.isButton() && interaction.customId === 'verify_embed_start') {
    // Rate-limit check
    const limit = await checkAttemptLimit(guildId, userId);
    if (limit.limited) {
      const minutes = Math.ceil(limit.retryAfterMs / 60_000);
      return interaction.reply({
        content: `⏱️ You've used all your verification attempts. Please wait **${minutes} minute(s)** before trying again.`,
        ephemeral: true,
      });
    }

    // Pick a CAPTCHA question and store it temporarily
    const captcha = getRandomCaptcha();
    const key = `${guildId}:${userId}`;
    pendingCaptchas.set(key, {
      answer:    captcha.answer,
      expiresAt: Date.now() + 5 * 60_000, // 5-minute window to submit
    });

    // Build and show the modal
    const modal = new ModalBuilder()
      .setCustomId('verify_embed_modal')
      .setTitle('Roblox Verification');

    const usernameInput = new TextInputBuilder()
      .setCustomId('verify_roblox_username')
      .setLabel('Your Roblox Username')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('e.g. Builderman')
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(20);

    const captchaInput = new TextInputBuilder()
      .setCustomId('verify_captcha_answer')
      .setLabel(captcha.question)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Type your answer here')
      .setRequired(true)
      .setMaxLength(10);

    modal.addComponents(
      new ActionRowBuilder().addComponents(usernameInput),
      new ActionRowBuilder().addComponents(captchaInput),
    );

    return interaction.showModal(modal);
  }

  // ── Modal submit: verification form ───────────────────────────────────────
  if (interaction.isModalSubmit() && interaction.customId === 'verify_embed_modal') {
    await interaction.deferReply({ ephemeral: true });

    const key           = `${guildId}:${userId}`;
    const captchaRecord = pendingCaptchas.get(key);

    // Validate CAPTCHA session
    if (!captchaRecord || Date.now() > captchaRecord.expiresAt) {
      pendingCaptchas.delete(key);
      return interaction.editReply({
        content: '⏱️ Your verification session expired. Please click **Start Verification** again.',
      });
    }

    const robloxUsername = interaction.fields.getTextInputValue('verify_roblox_username').trim();
    const userAnswer     = interaction.fields.getTextInputValue('verify_captcha_answer').trim();

    // Validate CAPTCHA answer
    if (!validateCaptcha(userAnswer, captchaRecord.answer)) {
      pendingCaptchas.delete(key);
      await incrementAttempts(guildId, userId);

      const record = await getAttemptRecord(guildId, userId).catch(() => null);

      const attemptsLeft = Math.max(0, 3 - (record?.attempts ?? 3));

      return interaction.editReply({
        content:
          `❌ Incorrect CAPTCHA answer. ` +
          (attemptsLeft > 0
            ? `You have **${attemptsLeft}** attempt(s) remaining.`
            : 'You have no attempts remaining. Please wait 10 minutes before trying again.'),
      });
    }

    // CAPTCHA passed — clean up session
    pendingCaptchas.delete(key);

    // Fetch guild settings
    const settings = await _getVerificationSettings(guildId);

    // Enforce verification channel restriction
    if (settings?.verification_channel_id) {
      const allowedId = String(settings.verification_channel_id);
      if (interaction.channel.id !== allowedId) {
        return interaction.editReply({
          content: `❌ Please use <#${allowedId}> to verify your Roblox account.`,
        });
      }
    }

    // Perform the full verification
    const result = await performVerification(interaction.member, robloxUsername, settings);

    if (!result.success) {
      await incrementAttempts(guildId, userId);

      return interaction.editReply({
        content:
          `❌ Could not find a Roblox account with the username **${robloxUsername}**.\n\n` +
          'Please double-check your username (not your display name) and try again.',
      });
    }

    // Success — reset attempt counter
    await resetAttempts(guildId, userId);

    const successEmbed = buildSuccessEmbed(result.robloxUser, settings, result.rolesChanged);
    return interaction.editReply({ embeds: [successEmbed] });
  }
}
