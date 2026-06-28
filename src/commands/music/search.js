import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for songs to add to the queue')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name to search for')
        .setRequired(true)
    ),

  name: 'search',
  description: 'Search for songs to add to the queue',

  async execute(interaction, client) {
    const query = interaction.options.getString('query');

    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle(`🔍 Search Results — ${query}`)
      .setDescription('Music search requires a music provider integration. Use `/play <song name>` to play directly.')
      .setFooter({ text: 'Use /play to add a song directly' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
