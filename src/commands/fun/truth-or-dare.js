import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const truths = [
  'What is your biggest fear?',
  'What is the most embarrassing thing you\'ve ever done?',
  'Have you ever lied to get out of trouble?',
  'What is your biggest regret?',
  'What is the weirdest dream you\'ve ever had?',
  'Have you ever cheated on a test?',
  'What is something you\'ve never told anyone?',
  'What is your most embarrassing childhood memory?',
];

const dares = [
  'Do 20 push-ups right now.',
  'Speak in an accent for the next 5 minutes.',
  'Send a silly selfie in this chat.',
  'Tell a joke — it must make someone laugh.',
  'Do your best impression of a celebrity.',
  'Sing the first verse of your favourite song.',
  'Write a poem about the person to your left.',
  'Do the worm dance move.',
];

export default {
  data: new SlashCommandBuilder()
    .setName('truth-or-dare')
    .setDescription('Get a truth or dare prompt')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Truth or dare?')
        .setRequired(true)
        .addChoices(
          { name: '🤔 Truth', value: 'truth' },
          { name: '😈 Dare', value: 'dare' },
        )
    ),

  name: 'truth-or-dare',
  description: 'Get a truth or dare prompt',

  async execute(interaction, client) {
    const type = interaction.options.getString('type');
    const list = type === 'truth' ? truths : dares;
    const prompt = list[Math.floor(Math.random() * list.length)];

    const embed = new EmbedBuilder()
      .setColor(type === 'truth' ? 0x3498DB : 0xE74C3C)
      .setTitle(type === 'truth' ? '🤔 Truth' : '😈 Dare')
      .setDescription(prompt)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
