import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('welcome-message')
    .setDescription('Set the welcome message for new members')
    .addStringOption(o => o.setName('message').setDescription('Welcome message (use {user}, {server}, {count})').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'welcome-message',
  description: 'Set the welcome message for new members',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const message = interaction.options.getString('message');
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    await query(
      `UPDATE guild_settings SET welcome_message = $1, welcome_enabled = TRUE WHERE guild_id = $2`,
      [message, interaction.guild.id]
    ).catch(() => {});

    const preview = message
      .replace('{user}', interaction.user.toString())
      .replace('{server}', interaction.guild.name)
      .replace('{count}', interaction.guild.memberCount.toString());

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Welcome Message Set')
      .addFields(
        { name: '📝 Template', value: message, inline: false },
        { name: '👁️ Preview', value: preview, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
