import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('temp-voice-delete')
    .setDescription('Delete your temporary voice channel'),

  name: 'temp-voice-delete',
  description: 'Delete your temporary voice channel',

  async execute(interaction, client) {
    const result = await query(
      'SELECT * FROM temp_voice_channels WHERE guild_id = $1 AND owner_id = $2',
      [interaction.guild.id, interaction.user.id]
    ).catch(() => ({ rows: [] }));

    if (!result.rows.length) {
      return interaction.reply({ content: '❌ You don\'t have a temporary voice channel.', ephemeral: true });
    }

    const channel = interaction.guild.channels.cache.get(result.rows[0].channel_id);
    if (channel) await channel.delete().catch(() => {});

    await query(
      'DELETE FROM temp_voice_channels WHERE guild_id = $1 AND owner_id = $2',
      [interaction.guild.id, interaction.user.id]
    ).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🗑️ Temp Voice Channel Deleted')
      .setDescription('Your temporary voice channel has been deleted.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
