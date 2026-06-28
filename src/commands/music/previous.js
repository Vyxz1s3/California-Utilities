import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('previous')
    .setDescription('Play the previous song'),

  name: 'previous',
  description: 'Play the previous song',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('⏮️ Previous Song')
      .setDescription('Playing the previous song.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
