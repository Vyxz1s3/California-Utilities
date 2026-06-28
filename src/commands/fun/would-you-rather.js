import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const questions = [
  ['Be able to fly', 'Be able to breathe underwater'],
  ['Always be 10 minutes late', 'Always be 20 minutes early'],
  ['Have unlimited money', 'Have unlimited time'],
  ['Be famous', 'Be the best friend of someone famous'],
  ['Live in the past', 'Live in the future'],
  ['Be able to speak every language', 'Be able to play every instrument'],
  ['Have no internet for a month', 'Have no phone for a month'],
  ['Be a superhero with a useless power', 'Be a villain with an amazing power'],
  ['Only eat your favourite food forever', 'Never eat your favourite food again'],
  ['Know when you will die', 'Know how you will die'],
  ['Be incredibly smart', 'Be incredibly attractive'],
  ['Have a rewind button for your life', 'Have a pause button for your life'],
];

export default {
  data: new SlashCommandBuilder()
    .setName('would-you-rather')
    .setDescription('Get a random would you rather question'),

  name: 'would-you-rather',
  description: 'Get a random would you rather question',

  async execute(interaction, client) {
    const [a, b] = questions[Math.floor(Math.random() * questions.length)];

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('🤔 Would You Rather…')
      .addFields(
        { name: '🅰️ Option A', value: a, inline: false },
        { name: '🅱️ Option B', value: b, inline: false },
      )
      .setFooter({ text: 'Discuss with your friends!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
