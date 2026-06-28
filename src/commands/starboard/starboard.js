import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('View the top starred messages in this server'),

  name: 'starboard',
  description: 'View the top starred messages in this server',

  async execute(interaction, client) {
    const result = await query(
      'SELECT * FROM starboard_messages WHERE guild_id = $1 ORDER BY star_count DESC LIMIT 10',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('⭐ Starboard — Top Messages')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No starred messages yet! React with ⭐ to star messages.');
    } else {
      const lines = result.rows.map((m, i) =>
        `**#${i + 1}** — ⭐ ${m.star_count} | <@${m.author_id}> | [Jump](https://discord.com/channels/${m.guild_id}/${m.channel_id}/${m.message_id})`
      ).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
