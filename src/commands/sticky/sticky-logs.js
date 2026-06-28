import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('sticky-logs')
    .setDescription('View sticky message activity logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'sticky-logs',
  description: 'View sticky message activity logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM sticky_messages WHERE guild_id = $1 ORDER BY created_at DESC LIMIT 10',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('📋 Sticky Message Logs')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No sticky message activity found.');
    } else {
      const lines = result.rows.map((s, i) =>
        `**#${i + 1}** — <#${s.channel_id}> | By <@${s.created_by}> | <t:${Math.floor(new Date(s.created_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
