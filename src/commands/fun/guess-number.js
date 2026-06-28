import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('guess-number')
    .setDescription('Guess the number the bot is thinking of (1–100)')
    .addIntegerOption(option =>
      option.setName('guess')
        .setDescription('Your guess (1–100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  name: 'guess-number',
  description: 'Guess the number the bot is thinking of (1–100)',

  async execute(interaction, client) {
    const guess = interaction.options.getInteger('guess');
    const secret = Math.floor(Math.random() * 100) + 1;
    const diff = Math.abs(guess - secret);

    let result, color;
    if (guess === secret) {
      result = '🎉 **Exact match! You guessed it!**';
      color = 0x2ECC71;
    } else if (diff <= 5) {
      result = `🔥 **So close!** The number was **${secret}**. You were only ${diff} away!`;
      color = 0xF39C12;
    } else if (diff <= 20) {
      result = `🌡️ **Warm!** The number was **${secret}**. You were ${diff} away.`;
      color = 0xE67E22;
    } else {
      result = `🧊 **Cold!** The number was **${secret}**. You were ${diff} away.`;
      color = 0x3498DB;
    }

    const hint = guess < secret ? '📈 Too low!' : guess > secret ? '📉 Too high!' : '✅ Spot on!';

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('🔢 Guess the Number')
      .addFields(
        { name: 'Your Guess', value: `${guess}`, inline: true },
        { name: 'Secret Number', value: `${secret}`, inline: true },
        { name: 'Hint', value: hint, inline: true },
        { name: 'Result', value: result, inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
