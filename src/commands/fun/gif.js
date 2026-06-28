import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Curated GIF library by tag
const gifLibrary = {
  happy: [
    'https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
  ],
  sad: [
    'https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif',
    'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif',
  ],
  dance: [
    'https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif',
    'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
  ],
  cat: [
    'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif',
  ],
  dog: [
    'https://media.giphy.com/media/mCRJDo24UvJMA/giphy.gif',
    'https://media.giphy.com/media/4Zo41lhzKt6iZ8xff9/giphy.gif',
  ],
};

export default {
  data: new SlashCommandBuilder()
    .setName('gif')
    .setDescription('Search for a GIF by keyword')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('What to search for (happy, sad, dance, cat, dog)')
        .setRequired(true)
    ),

  name: 'gif',
  description: 'Search for a GIF by keyword',

  async execute(interaction, client) {
    const query = interaction.options.getString('query').toLowerCase();
    const key = Object.keys(gifLibrary).find(k => query.includes(k)) || 'happy';
    const list = gifLibrary[key];
    const url = list[Math.floor(Math.random() * list.length)];

    const embed = new EmbedBuilder()
      .setColor(0x00BFFF)
      .setTitle(`🎬 GIF: ${query}`)
      .setImage(url)
      .setFooter({ text: 'Powered by Giphy' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
