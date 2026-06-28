import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const roasts = [
  'You\'re the reason they put instructions on shampoo bottles.',
  'I\'d agree with you, but then we\'d both be wrong.',
  'You\'re not stupid; you just have bad luck thinking.',
  'I\'d call you a tool, but even tools are useful.',
  'You\'re like a cloud — when you disappear, it\'s a beautiful day.',
  'I\'d roast you harder, but my mom said I\'m not allowed to burn trash.',
  'You\'re proof that even evolution makes mistakes.',
  'If laughter is the best medicine, your face must be curing diseases.',
  'You\'re not the dumbest person in the world, but you\'d better hope they don\'t die.',
  'I\'d explain it to you, but I left my crayons at home.',
];

export default {
  data: new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Roast a user (all in good fun!)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to roast')
        .setRequired(false)
    ),

  name: 'roast',
  description: 'Roast a user (all in good fun!)',

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;
    const roast = roasts[Math.floor(Math.random() * roasts.length)];

    const embed = new EmbedBuilder()
      .setColor(0xFF4500)
      .setTitle('🔥 Roast')
      .setDescription(`${target}, ${roast}`)
      .setFooter({ text: 'All in good fun! 😄' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
