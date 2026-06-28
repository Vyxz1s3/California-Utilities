import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('emoji-info')
    .setDescription('Get information about a server emoji')
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('Emoji name or ID')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers),

  name: 'emoji-info',
  description: 'Get emoji info',

  async execute(interaction, client) {
    const input = interaction.options.getString('emoji');

    // Try to find by name or ID
    const emoji = interaction.guild.emojis.cache.find(
      e => e.name === input || e.id === input || `<:${e.name}:${e.id}>` === input || `<a:${e.name}:${e.id}>` === input
    );

    if (!emoji) {
      return interaction.reply({ content: '❌ Emoji not found in this server.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`😀 Emoji Info — :${emoji.name}:`)
      .setThumbnail(emoji.imageURL({ size: 256 }))
      .addFields(
        { name: 'Name', value: emoji.name, inline: true },
        { name: 'ID', value: emoji.id, inline: true },
        { name: 'Animated', value: emoji.animated ? 'Yes' : 'No', inline: true },
        { name: 'Created', value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Usage', value: emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
