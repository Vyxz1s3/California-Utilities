import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of songs to skip (default: 1)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    ),

  name: 'skip',
  description: 'Skip the current song',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const amount = interaction.options.getInteger('amount') || 1;

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('⏭️ Song Skipped')
      .setDescription(`Skipped **${amount}** song${amount > 1 ? 's' : ''}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
