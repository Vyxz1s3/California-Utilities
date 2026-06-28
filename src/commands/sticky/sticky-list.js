import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('sticky-list')
    .setDescription('List all sticky messages in this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  name: 'sticky-list',
  description: 'List all sticky messages in this server',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM sticky_messages WHERE guild_id = $1 ORDER BY created_at DESC',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('📌 Sticky Messages')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No sticky messages configured.');
    } else {
      const lines = result.rows.map((s, i) =>
        `**#${i + 1}** — <#${s.channel_id}> | "${s.content.slice(0, 50)}${s.content.length > 50 ? '...' : ''}"`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
