import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('audit-log')
    .setDescription('View the moderation audit log')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Filter by user')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Filter by action (ban, kick, warn, mute, etc.)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('limit')
        .setDescription('Number of entries to show (1–25, default 10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(25)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog),

  name: 'audit-log',
  description: 'View audit logs',

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const action = interaction.options.getString('action');
    const limit = interaction.options.getInteger('limit') || 10;

    if (!interaction.member.permissions.has(PermissionFlagsBits.ViewAuditLog)) {
      return interaction.reply({ content: '❌ You do not have permission to view audit logs.', ephemeral: true });
    }

    let queryText = 'SELECT * FROM modlogs WHERE guild_id = $1';
    const params = [interaction.guild.id];

    if (user) {
      params.push(user.id);
      queryText += ` AND user_id = $${params.length}`;
    }
    if (action) {
      params.push(action.toLowerCase());
      queryText += ` AND action = $${params.length}`;
    }

    params.push(limit);
    queryText += ` ORDER BY created_at DESC LIMIT $${params.length}`;

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return interaction.reply({ content: '✅ No audit log entries found.', ephemeral: true });
    }

    const entries = result.rows.map((row, i) => {
      const date = new Date(row.created_at).toLocaleDateString();
      return `**#${i + 1}** \`${row.action.toUpperCase()}\` — <@${row.user_id}> by <@${row.moderator_id}>\n> ${row.reason} *(${date})*`;
    }).join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(0x34495e)
      .setTitle('📜 Audit Log')
      .setDescription(entries)
      .setFooter({ text: `${result.rows.length} entry/entries shown` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
