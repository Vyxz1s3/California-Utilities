import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const choices = ['rock', 'paper', 'scissors'];
const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };

function getResult(player, bot) {
  if (player === bot) return 'tie';
  if (
    (player === 'rock' && bot === 'scissors') ||
    (player === 'paper' && bot === 'rock') ||
    (player === 'scissors' && bot === 'paper')
  ) return 'win';
  return 'lose';
}

export default {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play rock paper scissors against the bot')
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('Your choice')
        .setRequired(true)
        .addChoices(
          { name: '🪨 Rock', value: 'rock' },
          { name: '📄 Paper', value: 'paper' },
          { name: '✂️ Scissors', value: 'scissors' },
        )
    ),

  name: 'rps',
  description: 'Play rock paper scissors against the bot',

  async execute(interaction, client) {
    const playerChoice = interaction.options.getString('choice');
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const result = getResult(playerChoice, botChoice);

    const colors = { win: 0x2ECC71, lose: 0xE74C3C, tie: 0xF39C12 };
    const titles = { win: '🎉 You Win!', lose: '😔 You Lose!', tie: '🤝 It\'s a Tie!' };

    const embed = new EmbedBuilder()
      .setColor(colors[result])
      .setTitle('🪨📄✂️ Rock Paper Scissors')
      .addFields(
        { name: 'Your Choice', value: `${emojis[playerChoice]} ${playerChoice}`, inline: true },
        { name: 'Bot\'s Choice', value: `${emojis[botChoice]} ${botChoice}`, inline: true },
        { name: 'Result', value: titles[result], inline: false },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
