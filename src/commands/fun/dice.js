import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice')
    .addIntegerOption(option =>
      option.setName('sides')
        .setDescription('Number of sides (default: 6)')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(100)
    ),
  
  name: 'dice',
  description: 'Roll a dice',

  async execute(interaction, client) {
    const sides = interaction.options.getInteger('sides') || 6;
    const result = Math.floor(Math.random() * sides) + 1;

    await interaction.reply(`🎲 You rolled a **${result}** (1-${sides})`);
  },
};

