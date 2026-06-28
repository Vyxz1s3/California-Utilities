import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('queue-clear')
    .setDescription('Clear the music queue'),

  name: 'queue-clear',
  description: 'Clear the music queue',

  async execute(interaction, client) {
    if (!interaction.member?.voice?.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('🗑️ Queue Cleared')
      .setDescription('The music queue has been cleared.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
