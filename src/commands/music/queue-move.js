import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('queue-move')
    .setDescription('Move a song to a different position in the queue')
    .addIntegerOption(option =>
      option.setName('from')
        .setDescription('Current position of the song')
        .setRequired(true)
        .setMinValue(1)
    )
    .addIntegerOption(option =>
      option.setName('to')
        .setDescription('New position for the song')
        .setRequired(true)
        .setMinValue(1)
    ),

  name: 'queue-move',
  description: 'Move a song to a different position in the queue',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const from = interaction.options.getInteger('from');
    const to = interaction.options.getInteger('to');

    const embed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle('↕️ Song Moved')
      .setDescription(`Moved song from position **#${from}** to **#${to}**.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
