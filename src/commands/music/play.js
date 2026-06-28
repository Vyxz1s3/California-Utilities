import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song in your voice channel')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name or URL')
        .setRequired(true)
    ),

  name: 'play',
  description: 'Play a song in your voice channel',

  async execute(interaction, client) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member?.voice?.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '❌ You must be in a voice channel to play music.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x1DB954)
      .setTitle('🎵 Now Playing')
      .setDescription(`**${query}**`)
      .addFields(
        { name: '📻 Channel', value: voiceChannel.name, inline: true },
        { name: '👤 Requested by', value: interaction.user.tag, inline: true },
      )
      .setFooter({ text: 'Music system — use /queue to see the queue' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
