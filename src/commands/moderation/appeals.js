import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('appeals')
    .setDescription('View all pending appeals (moderators only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'appeals',
  description: 'View pending appeals',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You do not have permission to view appeals.', ephemeral: true });
    }

    const result = await query(
      "SELECT * FROM appeals WHERE guild_id = $1 AND status = 'pending' ORDER BY created_at ASC LIMIT 20",
      [interaction.guild.id]
    );

    if (result.rows.length === 0) {
      return interaction.reply({ content: '✅ There are no pending appeals.', ephemeral: true });
    }

    const entries = result.rows.map(row => {
      const date = new Date(row.created_at).toLocaleDateString();
      return `**#${row.id}** — <@${row.user_id}> *(${date})*\n> ${row.reason}`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle('📋 Pending Appeals')
      .setDescription(entries)
      .setFooter({ text: `${result.rows.length} pending appeal(s)` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
