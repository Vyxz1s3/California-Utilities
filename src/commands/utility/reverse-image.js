import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('reverse-image')
    .setDescription('Get reverse image search links for an image URL')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Image URL to reverse search')
        .setRequired(true)
    ),

  name: 'reverse-image',
  description: 'Get reverse image search links for an image URL',

  async execute(interaction, client) {
    const url = interaction.options.getString('url');
    const encoded = encodeURIComponent(url);

    const googleUrl = `https://www.google.com/searchbyimage?image_url=${encoded}`;
    const tineye = `https://tineye.com/search?url=${encoded}`;
    const yandex = `https://yandex.com/images/search?url=${encoded}&rpt=imageview`;

    const embed = new EmbedBuilder()
      .setColor(0x4285F4)
      .setTitle('🔍 Reverse Image Search')
      .setDescription('Click a link below to search for this image:')
      .addFields(
        { name: '🔵 Google Images', value: `[Search on Google](${googleUrl})`, inline: true },
        { name: '🟠 TinEye', value: `[Search on TinEye](${tineye})`, inline: true },
        { name: '🔴 Yandex', value: `[Search on Yandex](${yandex})`, inline: true },
      )
      .setThumbnail(url)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
