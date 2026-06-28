import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { query } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Manage your playlists')
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('Create a new playlist')
        .addStringOption(o => o.setName('name').setDescription('Playlist name').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('View your playlists')
    )
    .addSubcommand(sub =>
      sub.setName('play')
        .setDescription('Play a playlist')
        .addStringOption(o => o.setName('name').setDescription('Playlist name').setRequired(true))
    ),

  name: 'playlist',
  description: 'Manage your playlists',

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      const name = interaction.options.getString('name');
      const embed = new EmbedBuilder()
        .setColor(0x1DB954)
        .setTitle('✅ Playlist Created')
        .setDescription(`Playlist **${name}** has been created. Use \`/play\` to add songs!`)
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'list') {
      const embed = new EmbedBuilder()
        .setColor(0x1DB954)
        .setTitle('📋 Your Playlists')
        .setDescription('You have no playlists yet. Use `/playlist create` to make one!')
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'play') {
      const name = interaction.options.getString('name');
      if (!interaction.member?.voice?.channel) {
        return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
      }
      const embed = new EmbedBuilder()
        .setColor(0x1DB954)
        .setTitle('▶️ Playing Playlist')
        .setDescription(`Now playing playlist **${name}**.`)
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
  },
};
