import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const jokes = [
  { setup: 'Why do programmers prefer dark mode?', punchline: 'Because light attracts bugs!' },
  { setup: 'Why did the developer go broke?', punchline: 'Because he used up all his cache!' },
  { setup: 'How many programmers does it take to change a light bulb?', punchline: 'None — that\'s a hardware problem.' },
  { setup: 'Why do Java developers wear glasses?', punchline: 'Because they don\'t C#!' },
  { setup: 'What\'s a computer\'s favourite snack?', punchline: 'Microchips!' },
  { setup: 'Why was the JavaScript developer sad?', punchline: 'Because he didn\'t Node how to Express himself.' },
  { setup: 'What do you call a bear with no teeth?', punchline: 'A gummy bear!' },
  { setup: 'Why can\'t you trust an atom?', punchline: 'Because they make up everything!' },
  { setup: 'What do you call fake spaghetti?', punchline: 'An impasta!' },
  { setup: 'Why did the scarecrow win an award?', punchline: 'Because he was outstanding in his field!' },
];

export default {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke'),

  name: 'joke',
  description: 'Get a random joke',

  async execute(interaction, client) {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('😄 Random Joke')
      .addFields(
        { name: '❓ Setup', value: joke.setup, inline: false },
        { name: '💡 Punchline', value: `||${joke.punchline}||`, inline: false },
      )
      .setFooter({ text: 'Click the punchline to reveal it!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
