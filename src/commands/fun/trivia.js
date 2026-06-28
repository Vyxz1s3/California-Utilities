import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

const questions = [
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    answer: 2,
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    answer: 1,
  },
  {
    question: 'What is 2 + 2 × 2?',
    options: ['6', '8', '4', '10'],
    answer: 0,
  },
  {
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    answer: 1,
  },
  {
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    answer: 3,
  },
  {
    question: 'How many sides does a hexagon have?',
    options: ['5', '6', '7', '8'],
    answer: 1,
  },
  {
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    answer: 2,
  },
  {
    question: 'Which country invented pizza?',
    options: ['France', 'Greece', 'Italy', 'Spain'],
    answer: 2,
  },
];

const labels = ['A', 'B', 'C', 'D'];

export default {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Answer a random trivia question'),

  name: 'trivia',
  description: 'Answer a random trivia question',

  async execute(interaction, client) {
    const q = questions[Math.floor(Math.random() * questions.length)];

    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('🧠 Trivia Question')
      .setDescription(q.question)
      .addFields(q.options.map((opt, i) => ({ name: `${labels[i]}.`, value: opt, inline: true })))
      .setFooter({ text: 'You have 30 seconds to answer!' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      q.options.map((_, i) =>
        new ButtonBuilder()
          .setCustomId(`trivia_${i}`)
          .setLabel(labels[i])
          .setStyle(ButtonStyle.Primary)
      )
    );

    const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === interaction.user.id && i.customId.startsWith('trivia_'),
      time: 30_000,
      max: 1,
    });

    collector.on('collect', async i => {
      const chosen = parseInt(i.customId.split('_')[1]);
      const correct = chosen === q.answer;

      const resultEmbed = new EmbedBuilder()
        .setColor(correct ? 0x2ECC71 : 0xE74C3C)
        .setTitle(correct ? '✅ Correct!' : '❌ Wrong!')
        .setDescription(q.question)
        .addFields(
          { name: 'Your Answer', value: `${labels[chosen]}. ${q.options[chosen]}`, inline: true },
          { name: 'Correct Answer', value: `${labels[q.answer]}. ${q.options[q.answer]}`, inline: true },
        )
        .setTimestamp();

      const disabledRow = new ActionRowBuilder().addComponents(
        q.options.map((_, idx) =>
          new ButtonBuilder()
            .setCustomId(`trivia_${idx}`)
            .setLabel(labels[idx])
            .setStyle(idx === q.answer ? ButtonStyle.Success : idx === chosen ? ButtonStyle.Danger : ButtonStyle.Secondary)
            .setDisabled(true)
        )
      );

      await i.update({ embeds: [resultEmbed], components: [disabledRow] });
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time' && collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0xF39C12)
          .setTitle('⏰ Time\'s Up!')
          .setDescription(`The correct answer was: **${labels[q.answer]}. ${q.options[q.answer]}**`)
          .setTimestamp();
        await reply.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
      }
    });
  },
};
