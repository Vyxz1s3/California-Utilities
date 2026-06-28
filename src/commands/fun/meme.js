import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const memes = [
  { title: 'When the code finally works', url: 'https://i.imgur.com/5PIBmBU.png' },
  { title: 'Monday morning vibes', url: 'https://i.imgur.com/3ZU0hte.png' },
  { title: 'Me explaining my code', url: 'https://i.imgur.com/7W3QZAL.png' },
  { title: 'Stack Overflow to the rescue', url: 'https://i.imgur.com/9kJpozx.png' },
  { title: 'When the bug fixes itself', url: 'https://i.imgur.com/2Fgc8MU.png' },
];

export default {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme'),

  name: 'meme',
  description: 'Get a random meme',

  async execute(interaction, client) {
    const meme = memes[Math.floor(Math.random() * memes.length)];

    const embed = new EmbedBuilder()
      .setColor(0xFF6B6B)
      .setTitle(`😂 ${meme.title}`)
      .setImage(meme.url)
      .setFooter({ text: 'Use /meme-search to find specific memes' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
