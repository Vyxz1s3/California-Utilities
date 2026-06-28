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
} from 'discord.js';
import { query } from '../../database/db.js';
import { getRobloxUser, checkCodeInAbout } from '../../utils/robloxApi.js';

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

/**
 * Generate a random 6-digit numeric verification code.
 * @returns {string} Zero-padded 6-digit string, e.g. "047291".
 */
function generateVerificationCode() {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

/**
 * Upsert a pending verification code for a user.
 * Expires 10 minutes from now.
 */
async function storeVerificationCode(guildId, userId, robloxUsername, robloxUserId, code) {
  await query(
    `INSERT INTO roblox_verification_codes
       (guild_id, user_id, roblox_username, roblox_user_id, verification_code, expires_at, verified)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP + INTERVAL '10 minutes', FALSE)
     ON CONFLICT (guild_id, user_id) DO UPDATE
       SET roblox_username    = $3,
           roblox_user_id     = $4,
           verification_code  = $5,
           created_at         = CURRENT_TIMESTAMP,
           expires_at         = CURRENT_TIMESTAMP + INTERVAL '10 minutes',
           verified           = FALSE`,
    [guildId, userId, robloxUsername, robloxUserId, code]
  );
}

/**
 * Fetch a pending (non-expired, non-verified) code record for a user.
 * @returns {object|null} The row, or null if none exists / it has expired.
 */
async function getPendingCode(guildId, userId) {
  const result = await query(
    `SELECT * FROM roblox_verification_codes
     WHERE guild_id = $1
       AND user_id  = $2
       AND verified = FALSE
       AND expires_at > CURRENT_TIMESTAMP`,
    [guildId, userId]
  );
  return result.rows[0] ?? null;
}

/**
 * Fetch a pending code record by the code value itself (for /verify confirm).
 * @returns {object|null}
 */
async function getPendingCodeByCode(guildId, userId, code) {
  const result = await query(
    `SELECT * FROM roblox_verification_codes
     WHERE guild_id          = $1
       AND user_id           = $2
       AND verification_code = $3
       AND verified          = FALSE
       AND expires_at        > CURRENT_TIMESTAMP`,
    [guildId, userId, code]
  );
  return result.rows[0] ?? null;
}

/** Mark a pending code as verified so it cannot be reused. */
async function markCodeVerified(guildId, userId) {
  await query(
    `UPDATE roblox_verification_codes
     SET verified = TRUE
     WHERE guild_id = $1 AND user_id = $2`,
    [guildId, userId]
  );
}

/** Check whether a user already has a completed verification in this guild. */
async function getExistingVerification(guildId, userId) {
  const result = await query(
    `SELECT * FROM roblox_verifications WHERE guild_id = $1 AND user_id = $2`,
    [guildId, userId]
  );
  return result.rows[0] ?? null;
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
        .setName('start')
        .setDescription('Start Roblox verification — get a code to place in your profile')
        .addStringOption(opt =>
          opt
            .setName('username')
            .setDescription('Your exact Roblox username')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('confirm')
        .setDescription('Confirm verification after adding the code to your Roblox profile')
        .addStringOption(opt =>
          opt
            .setName('code')
            .setDescription('The 6-digit code you received from /verify start')
            .setRequired(true)
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

    // ── /verify start ─────────────────────────────────────────────────────────
    if (sub === 'start') {
      await interaction.deferReply({ ephemeral: true });

      const username = interaction.options.getString('username').trim();
      const settings = await getVerificationSettings(interaction.guild.id);

      // Enforce verification channel restriction
      if (settings?.verification_channel_id) {
        const allowedChannelId = String(settings.verification_channel_id);
        if (interaction.channel.id !== allowedChannelId) {
          return interaction.editReply({
            content: `❌ Please use <#${allowedChannelId}> to start Roblox verification.`,
          });
        }
      }

      // Block if already verified
      const existing = await getExistingVerification(interaction.guild.id, interaction.user.id);
      if (existing) {
        return interaction.editReply({
          content:
            `❌ You are already verified as **${existing.roblox_username}** in this server. ` +
            'Contact an admin if you need to re-link your account.',
        });
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

      // Generate and store the verification code
      const code = generateVerificationCode();
      await storeVerificationCode(
        interaction.guild.id,
        interaction.user.id,
        robloxUser.name,
        robloxUser.id,
        code
      );

      // Send DM with instructions
      const dmEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🎮 Roblox Verification — Action Required')
        .setDescription(
          `You started Roblox verification in **${interaction.guild.name}**.\n\n` +
          'Follow the steps below to complete your verification.'
        )
        .addFields(
          { name: '🎮 Roblox Username', value: robloxUser.name, inline: true },
          { name: '🔑 Verification Code', value: `\`${code}\``, inline: true },
          {
            name: '📋 Instructions',
            value:
              '1. Go to your [Roblox profile](https://www.roblox.com/home)\n' +
              '2. Click **Edit** on your profile\n' +
              '3. Find the **About** section\n' +
              `4. Add this code anywhere in your About text: \`${code}\`\n` +
              `5. Run \`/verify confirm ${code}\` in the server`,
            inline: false,
          }
        )
        .setFooter({ text: '⏱️ This code expires in 10 minutes.' })
        .setTimestamp();

      let dmSent = true;
      try {
        await interaction.user.send({ embeds: [dmEmbed] });
      } catch {
        dmSent = false;
      }

      // Post embed in verification channel (if configured)
      if (settings?.verification_channel_id) {
        const verifyChannel = interaction.guild.channels.cache.get(
          String(settings.verification_channel_id)
        );
        if (verifyChannel) {
          const channelEmbed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle('🎮 Roblox Verification Started')
            .addFields(
              { name: '👤 Discord User', value: `<@${interaction.user.id}>`, inline: true },
              { name: '🎮 Roblox Username', value: robloxUser.name, inline: true },
              { name: '📊 Status', value: '⏳ Pending Verification', inline: true }
            )
            .setFooter({ text: 'Waiting for the user to confirm their code.' })
            .setTimestamp();
          await verifyChannel.send({ embeds: [channelEmbed] }).catch(() => {});
        }
      }

      // Reply to the user
      const replyEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🎮 Roblox Verification Started')
        .setDescription(
          dmSent
            ? '📬 Check your DMs for your verification code and instructions!'
            : `⚠️ I couldn't send you a DM. Your verification code is \`${code}\`.\n` +
              'Make sure your DMs are open for future steps.'
        )
        .addFields(
          { name: '🎮 Roblox Username', value: robloxUser.name, inline: true },
          { name: '📊 Status', value: '⏳ Pending Verification', inline: true },
          {
            name: '📋 Next Step',
            value:
              `Add \`${code}\` to your Roblox profile's **About** section, ` +
              `then run \`/verify confirm ${code}\`.`,
            inline: false,
          }
        )
        .setFooter({ text: '⏱️ Code expires in 10 minutes.' })
        .setTimestamp();

      return interaction.editReply({ embeds: [replyEmbed] });
    }

    // ── /verify confirm ───────────────────────────────────────────────────────
    if (sub === 'confirm') {
      await interaction.deferReply({ ephemeral: true });

      const code = interaction.options.getString('code').trim();
      const settings = await getVerificationSettings(interaction.guild.id);

      // Enforce verification channel restriction
      if (settings?.verification_channel_id) {
        const allowedChannelId = String(settings.verification_channel_id);
        if (interaction.channel.id !== allowedChannelId) {
          return interaction.editReply({
            content: `❌ Please use <#${allowedChannelId}> to confirm your verification.`,
          });
        }
      }

      // Block if already verified
      const existing = await getExistingVerification(interaction.guild.id, interaction.user.id);
      if (existing) {
        return interaction.editReply({
          content:
            `❌ You are already verified as **${existing.roblox_username}** in this server.`,
        });
      }

      // Look up the pending code
      const pending = await getPendingCodeByCode(
        interaction.guild.id,
        interaction.user.id,
        code
      );

      if (!pending) {
        // Check if there's an expired/wrong code to give a better message
        const anyPending = await getPendingCode(interaction.guild.id, interaction.user.id);
        const errorEmbed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle('❌ Verification Failed')
          .setDescription(
            anyPending
              ? `The code \`${code}\` doesn't match your pending verification code. ` +
                'Please check your DMs and try again.'
              : 'No active verification code found. Your code may have expired or you haven\'t ' +
                'started verification yet. Run `/verify start <username>` to get a new code.'
          )
          .setFooter({ text: 'Codes expire after 10 minutes.' })
          .setTimestamp();

        return interaction.editReply({ embeds: [errorEmbed] });
      }

      // Check if the code is in the user's Roblox About section
      const codeFound = await checkCodeInAbout(pending.roblox_user_id, code);

      if (!codeFound) {
        const notFoundEmbed = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle('❌ Code Not Found in Profile')
          .setDescription(
            `The code \`${code}\` was not found in the **About** section of the Roblox ` +
            `profile **${pending.roblox_username}**.\n\n` +
            '**Make sure you:**\n' +
            '1. Saved your Roblox profile after adding the code\n' +
            '2. Added the code to the **About** section (not your display name)\n' +
            '3. Are using the correct Roblox account\n\n' +
            'Then try `/verify confirm` again.'
          )
          .setFooter({ text: 'The code must appear somewhere in your About text.' })
          .setTimestamp();

        return interaction.editReply({ embeds: [notFoundEmbed] });
      }

      // ── Verification passed — assign roles ────────────────────────────────
      const member = interaction.member;
      let rolesChanged = false;

      if (settings?.verified_role_id) {
        const verifiedRole = interaction.guild.roles.cache.get(String(settings.verified_role_id));
        if (verifiedRole) {
          try {
            await member.roles.add(verifiedRole, 'Roblox verification');
            rolesChanged = true;
          } catch {
            // Bot may lack permissions — still complete verification
          }
        }
      }

      if (settings?.unverified_role_id) {
        const unverifiedRole = interaction.guild.roles.cache.get(
          String(settings.unverified_role_id)
        );
        if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
          await member.roles.remove(unverifiedRole, 'Roblox verification').catch(() => {});
        }
      }

      // Persist the completed verification and mark the code as used
      await upsertRobloxVerification(
        interaction.guild.id,
        interaction.user.id,
        pending.roblox_username,
        pending.roblox_user_id
      );
      await markCodeVerified(interaction.guild.id, interaction.user.id);

      // Post success embed in verification channel
      if (settings?.verification_channel_id) {
        const verifyChannel = interaction.guild.channels.cache.get(
          String(settings.verification_channel_id)
        );
        if (verifyChannel) {
          const channelSuccessEmbed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('✅ Verification Successful!')
            .addFields(
              { name: '👤 Discord User', value: `<@${interaction.user.id}>`, inline: true },
              { name: '🎮 Roblox Username', value: pending.roblox_username, inline: true },
              { name: '📊 Status', value: '✅ Verified', inline: true }
            )
            .setFooter({ text: 'Roblox account successfully linked.' })
            .setTimestamp();
          await verifyChannel.send({ embeds: [channelSuccessEmbed] }).catch(() => {});
        }
      }

      // Send DM confirmation
      const dmSuccessEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('✅ Verification Successful!')
        .setDescription(
          `You've been verified as **${pending.roblox_username}** in **${interaction.guild.name}**!`
        )
        .addFields(
          { name: '🎮 Roblox Username', value: pending.roblox_username, inline: true },
          { name: '📊 Status', value: 'Verified ✓', inline: true },
          {
            name: '🎭 Role',
            value: rolesChanged && settings?.verified_role_id
              ? `You've been assigned <@&${settings.verified_role_id}>!`
              : settings?.verified_role_id
                ? '⚠️ Role could not be assigned — contact an admin.'
                : 'No verified role is configured for this server.',
            inline: false,
          }
        )
        .setFooter({ text: 'Your Roblox account is now linked to your Discord profile.' })
        .setTimestamp();

      await interaction.user.send({ embeds: [dmSuccessEmbed] }).catch(() => {});

      // Ephemeral reply
      const successEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('✅ Verification Successful!')
        .setDescription(
          `You've been verified as **${pending.roblox_username}** on Roblox. Welcome to the server!`
        )
        .addFields(
          { name: '🎮 Roblox Username', value: pending.roblox_username, inline: true },
          { name: '🆔 Roblox User ID', value: String(pending.roblox_user_id), inline: true },
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
  },
};
