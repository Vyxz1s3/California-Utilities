import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const quotes = [
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'In the middle of every difficulty lies opportunity.', author: 'Albert Einstein' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon' },
  { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
  { text: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
  { text: 'Whoever is happy will make others happy too.', author: 'Anne Frank' },
  { text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.', author: 'Ralph Waldo Emerson' },
  { text: 'You will face many defeats in life, but never let yourself be defeated.', author: 'Maya Angelou' },
  { text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.', author: 'Nelson Mandela' },
];

export default {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Get a random inspirational quote'),

  name: 'quote',
  description: 'Get a random inspirational quote',

  async execute(interaction, client) {
    const { text, author } = quotes[Math.floor(Math.random() * quotes.length)];

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('💬 Random Quote')
      .setDescription(`*"${text}"*`)
      .setFooter({ text: `— ${author}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
