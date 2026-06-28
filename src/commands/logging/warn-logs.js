import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warn-logs')
    .setDescription('View recent warning logs')
    .addUserOption(o => o.setName('user').setDescription('Filter by user').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  name: 'warn-logs',
  description: 'View recent warning logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return interaction.reply({ content: '❌ You need Moderate Members permission.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');

    const result = await query(
      `SELECT * FROM user_warnings WHERE guild_id = $1 ${user ? 'AND user_id = $2' : ''} ORDER BY created_at DESC LIMIT 15`,
      user ? [interaction.guild.id, user.id] : [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle(`⚠️ Warning Logs${user ? ` — ${user.tag}` : ''}`)
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No warnings found.');
    } else {
      const lines = result.rows.map(w =>
        `<@${w.user_id}> — By <@${w.moderator_id}> | ${w.reason || 'No reason'} | <t:${Math.floor(new Date(w.created_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
