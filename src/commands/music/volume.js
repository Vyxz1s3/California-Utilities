import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set the music volume')
    .addIntegerOption(option =>
      option.setName('level')
        .setDescription('Volume level (0–100)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)
    ),

  name: 'volume',
  description: 'Set the music volume',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const level = interaction.options.getInteger('level');
    const bar = '█'.repeat(Math.round(level / 10)) + '░'.repeat(10 - Math.round(level / 10));

    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle('🔊 Volume Set')
      .setDescription(`Volume set to **${level}%**\n\`${bar}\``)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
