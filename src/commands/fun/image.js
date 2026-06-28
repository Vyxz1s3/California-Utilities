import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const imageLibrary = {
  nature: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
  ],
  space: [
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800',
  ],
  city: [
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
  ],
  animals: [
    'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800',
    'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800',
  ],
};

export default {
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('Search for an image by keyword')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('What to search for (nature, space, city, animals)')
        .setRequired(true)
    ),

  name: 'image',
  description: 'Search for an image by keyword',

  async execute(interaction, client) {
    const query = interaction.options.getString('query').toLowerCase();
    const key = Object.keys(imageLibrary).find(k => query.includes(k)) || 'nature';
    const list = imageLibrary[key];
    const url = list[Math.floor(Math.random() * list.length)];

    const embed = new EmbedBuilder()
      .setColor(0x27AE60)
      .setTitle(`🖼️ Image: ${query}`)
      .setImage(url)
      .setFooter({ text: 'Powered by Unsplash' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
