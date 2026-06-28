import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('now-playing')
    .setDescription('Show the currently playing song'),

  name: 'now-playing',
  description: 'Show the currently playing song',

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle('🎵 Now Playing')
      .setDescription('No song is currently playing. Use `/play` to start!')
      .setFooter({ text: 'Use /queue to see the full queue' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
