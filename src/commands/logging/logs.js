import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('View recent server logs')
    .addStringOption(o =>
      o.setName('type')
        .setDescription('Log type to view')
        .setRequired(false)
        .addChoices(
          { name: 'All', value: 'all' },
          { name: 'Moderation', value: 'moderation' },
          { name: 'Messages', value: 'messages' },
          { name: 'Members', value: 'members' },
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog),

  name: 'logs',
  description: 'View recent server logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
      return interaction.reply({ content: '❌ You need View Audit Log permission.', ephemeral: true });
    }

    const type = interaction.options.getString('type') || 'all';

    const result = await query(
      `SELECT * FROM modlogs WHERE guild_id = $1 ${type !== 'all' ? `AND action LIKE $2` : ''} ORDER BY created_at DESC LIMIT 15`,
      type !== 'all' ? [interaction.guild.id, `%${type}%`] : [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`📋 Server Logs — ${type.charAt(0).toUpperCase() + type.slice(1)}`)
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No logs found.');
    } else {
      const lines = result.rows.map(l =>
        `\`${l.action}\` — <@${l.user_id}> by <@${l.moderator_id}> | <t:${Math.floor(new Date(l.created_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
