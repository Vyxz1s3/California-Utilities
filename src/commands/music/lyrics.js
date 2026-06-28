import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Get lyrics for a song')
    .addStringOption(option =>
      option.setName('song')
        .setDescription('Song name to search for (leave blank for current song)')
        .setRequired(false)
    ),

  name: 'lyrics',
  description: 'Get lyrics for a song',

  async execute(interaction, client) {
    const song = interaction.options.getString('song') || 'current song';

    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle(`📝 Lyrics — ${song}`)
      .setDescription('Lyrics fetching requires a lyrics API integration. Configure `LYRICS_API_KEY` in your environment to enable this feature.')
      .setFooter({ text: 'Powered by Genius' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
