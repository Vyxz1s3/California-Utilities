import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-logs')
    .setDescription('View ticket logs for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'ticket-logs',
  description: 'View ticket logs for this server',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT t.*, u.username FROM tickets t LEFT JOIN users u ON t.user_id = u.id WHERE t.guild_id = $1 ORDER BY t.created_at DESC LIMIT 10',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📋 Ticket Logs')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No tickets found for this server.');
    } else {
      const lines = result.rows.map((t, i) =>
        `**#${i + 1}** — User: <@${t.user_id}> | Status: \`${t.status}\` | <t:${Math.floor(new Date(t.created_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
