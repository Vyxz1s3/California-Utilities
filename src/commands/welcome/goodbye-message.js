import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';
import { getOrCreateGuild } from '../../utils/helpers.js';

export default {
  data: new SlashCommandBuilder()
    .setName('goodbye-message')
    .setDescription('Set the goodbye message for leaving members')
    .addStringOption(o => o.setName('message').setDescription('Goodbye message (use {user}, {server}, {count})').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'goodbye-message',
  description: 'Set the goodbye message for leaving members',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const message = interaction.options.getString('message');
    await getOrCreateGuild(interaction.guild.id, interaction.guild.name);

    await query(
      `UPDATE guild_settings SET goodbye_message = $1, goodbye_enabled = TRUE WHERE guild_id = $2`,
      [message, interaction.guild.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('✅ Goodbye Message Set')
      .addFields({ name: '📝 Template', value: message, inline: false })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
