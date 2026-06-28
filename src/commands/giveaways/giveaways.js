import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('giveaways')
    .setDescription('View active giveaways in this server'),

  name: 'giveaways',
  description: 'View active giveaways in this server',

  async execute(interaction, client) {
    const result = await query(
      'SELECT * FROM giveaways WHERE guild_id = $1 AND status = $2 ORDER BY ends_at ASC',
      [interaction.guild.id, 'active']
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🎉 Active Giveaways')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No active giveaways. Use `/giveaway-create` to start one!');
    } else {
      const lines = result.rows.map((g, i) =>
        `**#${i + 1}** — **${g.prize}** | Winners: ${g.winners} | Ends: <t:${Math.floor(new Date(g.ends_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
