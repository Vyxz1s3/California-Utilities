import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('afk-logs')
    .setDescription('View AFK activity logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'afk-logs',
  description: 'View AFK activity logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM afk_users WHERE guild_id = $1 ORDER BY set_at DESC LIMIT 20',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('📋 AFK Logs')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No AFK activity found.');
    } else {
      const lines = result.rows.map(a =>
        `<@${a.user_id}> — "${a.reason}" | Set <t:${Math.floor(new Date(a.set_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
