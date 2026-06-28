import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seek to a specific time in the current song')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Time to seek to (e.g. 1:30 or 90)')
        .setRequired(true)
    ),

  name: 'seek',
  description: 'Seek to a specific time in the current song',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const time = interaction.options.getString('time');

    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle('⏩ Seeked')
      .setDescription(`Seeked to **${time}**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
