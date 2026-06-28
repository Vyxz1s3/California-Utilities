import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const lines = [
  'Are you a keyboard? Because you\'re just my type.',
  'Do you have a map? I keep getting lost in your eyes.',
  'Are you a magician? Because whenever I look at you, everyone else disappears.',
  'Is your name Google? Because you have everything I\'ve been searching for.',
  'Are you a parking ticket? Because you\'ve got "fine" written all over you.',
  'Do you believe in love at first sight, or should I walk by again?',
  'Are you a bank loan? Because you have my interest.',
  'Is your name Wi-Fi? Because I\'m feeling a connection.',
  'Are you a camera? Because every time I look at you, I smile.',
  'Do you have a Band-Aid? Because I just scraped my knee falling for you.',
];

export default {
  data: new SlashCommandBuilder()
    .setName('pickup-line')
    .setDescription('Get a random pickup line'),

  name: 'pickup-line',
  description: 'Get a random pickup line',

  async execute(interaction, client) {
    const line = lines[Math.floor(Math.random() * lines.length)];

    const embed = new EmbedBuilder()
      .setColor(0xFF69B4)
      .setTitle('💘 Pickup Line')
      .setDescription(`*"${line}"*`)
      .setFooter({ text: 'Use responsibly 😄' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
