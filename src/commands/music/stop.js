import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music and clear the queue'),

  name: 'stop',
  description: 'Stop music and clear the queue',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('⏹️ Music Stopped')
      .setDescription('The music has been stopped and the queue has been cleared.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
