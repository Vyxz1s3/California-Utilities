import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('starboard-logs')
    .setDescription('View starboard activity logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'starboard-logs',
  description: 'View starboard activity logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM starboard_messages WHERE guild_id = $1 ORDER BY created_at DESC LIMIT 10',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('📋 Starboard Logs')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No starboard activity found.');
    } else {
      const lines = result.rows.map((m, i) =>
        `**#${i + 1}** — ⭐ ${m.star_count} | <@${m.author_id}> | <t:${Math.floor(new Date(m.created_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
