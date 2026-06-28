import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const facts = [
  'Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.',
  'A group of flamingos is called a "flamboyance".',
  'Octopuses have three hearts and blue blood.',
  'The shortest war in history lasted only 38–45 minutes — the Anglo-Zanzibar War of 1896.',
  'Bananas are berries, but strawberries are not.',
  'A day on Venus is longer than a year on Venus.',
  'The human brain uses about 20% of the body\'s total energy.',
  'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.',
  'There are more possible iterations of a game of chess than there are atoms in the observable universe.',
  'Wombat poop is cube-shaped.',
  'The average person walks about 100,000 miles in their lifetime — enough to circle the Earth four times.',
  'A bolt of lightning is five times hotter than the surface of the Sun.',
];

export default {
  data: new SlashCommandBuilder()
    .setName('fact')
    .setDescription('Get a random interesting fact'),

  name: 'fact',
  description: 'Get a random interesting fact',

  async execute(interaction, client) {
    const fact = facts[Math.floor(Math.random() * facts.length)];

    const embed = new EmbedBuilder()
      .setColor(0x1ABC9C)
      .setTitle('🧪 Random Fact')
      .setDescription(fact)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
