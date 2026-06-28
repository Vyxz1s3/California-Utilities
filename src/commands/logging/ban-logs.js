import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ban-logs')
    .setDescription('View recent ban logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  name: 'ban-logs',
  description: 'View recent ban logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ You need Ban Members permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM modlogs WHERE guild_id = $1 AND action = $2 ORDER BY created_at DESC LIMIT 15',
      [interaction.guild.id, 'ban']
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🔨 Ban Logs')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No ban logs found.');
    } else {
      const lines = result.rows.map(l =>
        `<@${l.user_id}> — By <@${l.moderator_id}> | Reason: ${l.reason || 'None'} | <t:${Math.floor(new Date(l.created_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
