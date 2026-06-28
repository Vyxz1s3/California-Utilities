import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const compliments = [
  'You have an incredible ability to make everyone around you feel valued.',
  'Your smile could light up the darkest room.',
  'You are more capable than you realise.',
  'The world is a better place because you\'re in it.',
  'You have a gift for making people feel heard and understood.',
  'Your kindness is a superpower.',
  'You inspire others just by being yourself.',
  'You bring out the best in everyone around you.',
  'Your creativity and imagination are truly remarkable.',
  'You are exactly the kind of person the world needs more of.',
];

export default {
  data: new SlashCommandBuilder()
    .setName('compliment')
    .setDescription('Compliment a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to compliment')
        .setRequired(false)
    ),

  name: 'compliment',
  description: 'Compliment a user',

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];

    const embed = new EmbedBuilder()
      .setColor(0xFF69B4)
      .setTitle('💖 Compliment')
      .setDescription(`${target}, ${compliment}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
