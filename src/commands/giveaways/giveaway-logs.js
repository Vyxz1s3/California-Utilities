import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaway-logs')
    .setDescription('View giveaway history for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  name: 'giveaway-logs',
  description: 'View giveaway history for this server',

  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ content: '❌ You need Manage Server permission.', ephemeral: true });
    }

    const result = await query(
      'SELECT * FROM giveaways WHERE guild_id = $1 ORDER BY created_at DESC LIMIT 10',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('📋 Giveaway Logs')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No giveaways found.');
    } else {
      const lines = result.rows.map((g, i) =>
        `**#${i + 1}** — **${g.prize}** | Status: \`${g.status}\` | <t:${Math.floor(new Date(g.created_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
