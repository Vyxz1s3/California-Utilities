import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song'),

  name: 'resume',
  description: 'Resume the paused song',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('▶️ Music Resumed')
      .setDescription('The music has been resumed.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
