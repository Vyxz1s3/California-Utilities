import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick-logs')
    .setDescription('View recent kick logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  name: 'kick-logs',
  description: 'View recent kick logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: '❌ You need Kick Members permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM modlogs WHERE guild_id = $1 AND action = $2 ORDER BY created_at DESC LIMIT 15',
      [interaction.guild.id, 'kick']
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('👢 Kick Logs')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No kick logs found.');
    } else {
      const lines = result.rows.map(l =>
        `<@${l.user_id}> — By <@${l.moderator_id}> | Reason: ${l.reason || 'None'} | <t:${Math.floor(new Date(l.created_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
