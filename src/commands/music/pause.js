import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the currently playing song'),

  name: 'pause',
  description: 'Pause the currently playing song',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('⏸️ Music Paused')
      .setDescription('The music has been paused. Use `/resume` to continue.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
