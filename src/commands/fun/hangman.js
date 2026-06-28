import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

const words = ['javascript', 'discord', 'programming', 'computer', 'keyboard', 'monitor', 'database', 'network', 'algorithm', 'function'];

const hangmanStages = [
  '```\n  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========```',
  '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========```',
];

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default {
  data: new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('Play a game of hangman'),

  name: 'hangman',
  description: 'Play a game of hangman',

  async execute(interaction, client) {
    const word = words[Math.floor(Math.random() * words.length)];
    const guessed = new Set();
    let wrong = 0;

    function getDisplay() {
      return word.split('').map(l => (guessed.has(l) ? l : '_')).join(' ');
    }

    function buildEmbed() {
      const display = getDisplay();
      const won = word.split('').every(l => guessed.has(l));
      const lost = wrong >= 6;
      return new EmbedBuilder()
        .setColor(lost ? 0xE74C3C : won ? 0x2ECC71 : 0x5865F2)
        .setTitle('🪢 Hangman')
        .setDescription(hangmanStages[wrong])
        .addFields(
          { name: 'Word', value: `\`${display}\``, inline: true },
          { name: 'Wrong Guesses', value: `${wrong}/6`, inline: true },
          { name: 'Guessed Letters', value: guessed.size > 0 ? [...guessed].join(', ') : 'None', inline: false },
        )
        .setFooter({ text: won ? '🎉 You won!' : lost ? `💀 You lost! The word was: ${word}` : 'Click a letter to guess!' })
        .setTimestamp();
    }

    function buildRows(disabled = false) {
      const rows = [];
      for (let r = 0; r < 3; r++) {
        const row = new ActionRowBuilder();
        const slice = ALPHABET.slice(r * 9, r * 9 + (r === 2 ? 8 : 9));
        for (const letter of slice) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`hm_${letter}`)
              .setLabel(letter.toUpperCase())
              .setStyle(guessed.has(letter) ? (word.includes(letter) ? ButtonStyle.Success : ButtonStyle.Danger) : ButtonStyle.Secondary)
              .setDisabled(disabled || guessed.has(letter))
          );
        }
        rows.push(row);
      }
      return rows;
    }

    const reply = await interaction.reply({
      embeds: [buildEmbed()],
      components: buildRows(),
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === interaction.user.id && i.customId.startsWith('hm_'),
      time: 300_000,
    });

    collector.on('collect', async i => {
      const letter = i.customId.split('_')[1];
      guessed.add(letter);
      if (!word.includes(letter)) wrong++;

      const won = word.split('').every(l => guessed.has(l));
      const lost = wrong >= 6;
      const done = won || lost;

      await i.update({ embeds: [buildEmbed()], components: buildRows(done) });
      if (done) collector.stop();
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        await reply.edit({ components: buildRows(true) }).catch(() => {});
      }
    });
  },
};
