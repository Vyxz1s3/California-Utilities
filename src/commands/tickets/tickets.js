import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('tickets')
    .setDescription('View your open tickets'),

  name: 'tickets',
  description: 'View your open tickets',

  async execute(interaction, client) {
    const result = await query(
      'SELECT * FROM tickets WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT 10',
      [interaction.guild.id, interaction.user.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🎫 Your Tickets')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('You have no tickets in this server.');
    } else {
      const lines = result.rows.map((t, i) =>
        `**#${i + 1}** — Status: \`${t.status}\` | <t:${Math.floor(new Date(t.created_at).getTime() / 1000)}:R>`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
