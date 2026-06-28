import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('View the current music queue'),

  name: 'queue',
  description: 'View the current music queue',

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle('🎵 Music Queue')
      .setDescription('The queue is currently empty. Use `/play` to add songs!')
      .setFooter({ text: 'Use /play to add songs to the queue' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
