import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('calculator')
    .setDescription('Evaluate a mathematical expression')
    .addStringOption(option =>
      option.setName('expression')
        .setDescription('Math expression to evaluate (e.g. 2 + 2 * 3)')
        .setRequired(true)
    ),

  name: 'calculator',
  description: 'Evaluate a mathematical expression',

  async execute(interaction, client) {
    const expression = interaction.options.getString('expression');

    // Safe evaluation — only allow numbers and basic operators
    const safe = /^[\d\s+\-*/().%^]+$/.test(expression);
    if (!safe) {
      return interaction.reply({ content: '❌ Invalid expression. Only numbers and `+ - * / ( ) . % ^` are allowed.', ephemeral: true });
    }

    let result;
    try {
      // Replace ^ with ** for exponentiation
      const sanitised = expression.replace(/\^/g, '**');
      // eslint-disable-next-line no-new-func
      result = Function(`'use strict'; return (${sanitised})`)();
    } catch {
      return interaction.reply({ content: '❌ Could not evaluate that expression.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0xF39C12)
      .setTitle('🧮 Calculator')
      .addFields(
        { name: '📥 Expression', value: `\`${expression}\``, inline: false },
        { name: '📤 Result', value: `\`${result}\``, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
