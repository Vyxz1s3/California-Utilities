import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('join-logs')
    .setDescription('View recent member join logs')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'join-logs',
  description: 'View recent member join logs',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM members WHERE guild_id = $1 ORDER BY join_date DESC LIMIT 15',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('📥 Join Logs')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No join data found.');
    } else {
      const lines = result.rows.map(m =>
        `<@${m.user_id}> — Joined <t:${Math.floor(new Date(m.join_date).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
