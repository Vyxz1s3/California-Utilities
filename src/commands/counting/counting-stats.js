import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('counting-stats')
    .setDescription('View counting channel statistics'),

  name: 'counting-stats',
  description: 'View counting channel statistics',

  async execute(interaction, client) {
    const result = await query(
      'SELECT * FROM counting_channel_data WHERE guild_id = $1',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🔢 Counting Statistics')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No counting channel configured. Use `/counting-channel` to set one.');
    } else {
      const data = result.rows[0];
      embed.addFields(
        { name: '🔢 Current Count', value: `${data.current_count}`, inline: true },
        { name: '🏆 High Score', value: `${data.high_score || data.current_count}`, inline: true },
        { name: '👤 Last Counter', value: data.last_user_id ? `<@${data.last_user_id}>` : 'None', inline: true },
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};
