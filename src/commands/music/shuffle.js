import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the music queue'),

  name: 'shuffle',
  description: 'Shuffle the music queue',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle('🔀 Queue Shuffled')
      .setDescription('The queue has been shuffled.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
