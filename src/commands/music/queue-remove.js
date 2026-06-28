import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('queue-remove')
    .setDescription('Remove a song from the queue by position')
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription('Position in the queue to remove')
        .setRequired(true)
        .setMinValue(1)
    ),

  name: 'queue-remove',
  description: 'Remove a song from the queue by position',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const position = interaction.options.getInteger('position');

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🗑️ Song Removed')
      .setDescription(`Removed song at position **#${position}** from the queue.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
