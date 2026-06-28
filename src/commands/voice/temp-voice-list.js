import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('temp-voice-list')
    .setDescription('List all active temporary voice channels'),

  name: 'temp-voice-list',
  description: 'List all active temporary voice channels',

  async execute(interaction, client) {
    const result = await query(
      'SELECT * FROM temp_voice_channels WHERE guild_id = $1 ORDER BY created_at DESC',
      [interaction.guild.id]
    ).catch(() => ({ rows: [] }));

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('🎙️ Active Temp Voice Channels')
      .setTimestamp();

    if (!result.rows.length) {
      embed.setDescription('No active temporary voice channels.');
    } else {
      const lines = result.rows.map((c, i) => {
        const channel = interaction.guild.channels.cache.get(c.channel_id);
        return `**#${i + 1}** — ${channel ? channel.name : 'Deleted'} | Owner: <@${c.owner_id}>`;
      }).join('\n');
      embed.setDescription(lines);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
