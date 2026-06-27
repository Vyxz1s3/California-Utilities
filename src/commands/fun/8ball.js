import { SlashCommandBuilder } from 'discord.js';

const responses = [
  'Yes, definitely!',
  'No, absolutely not.',
  'Maybe, ask again later.',
  'The signs point to yes.',
  'Don\'t count on it.',
  'It is certain.',
  'Very doubtful.',
  'Ask again later.',
  'Outlook good.',
  'My sources say no.',
];

export default {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8ball a question')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question')
        .setRequired(true)
    ),
  
  name: '8ball',
  description: 'Ask the magic 8ball a question',

  async execute(interaction, client) {
    const question = interaction.options.getString('question');
    const response = responses[Math.floor(Math.random() * responses.length)];

    await interaction.reply(`🎱 **${question}**\n\n${response}`);
  },
};

