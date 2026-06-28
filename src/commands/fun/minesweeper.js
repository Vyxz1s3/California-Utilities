import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const NUMBERS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
const MINE = '💣';

export default {
  data: new SlashCommandBuilder()
    .setName('minesweeper')
    .setDescription('Generate a minesweeper board')
    .addStringOption(option =>
      option.setName('difficulty')
        .setDescription('Difficulty level')
        .setRequired(false)
        .addChoices(
          { name: 'Easy (5x5, 5 mines)', value: 'easy' },
          { name: 'Medium (7x7, 10 mines)', value: 'medium' },
          { name: 'Hard (9x9, 20 mines)', value: 'hard' },
        )
    ),

  name: 'minesweeper',
  description: 'Generate a minesweeper board',

  async execute(interaction, client) {
    const difficulty = interaction.options.getString('difficulty') || 'easy';
    const configs = {
      easy: { rows: 5, cols: 5, mines: 5 },
      medium: { rows: 7, cols: 7, mines: 10 },
      hard: { rows: 9, cols: 9, mines: 20 },
    };
    const { rows, cols, mines } = configs[difficulty];

    const board = Array.from({ length: rows }, () => Array(cols).fill(0));
    const mineSet = new Set();

    while (mineSet.size < mines) {
      mineSet.add(Math.floor(Math.random() * rows * cols));
    }

    for (const pos of mineSet) {
      const r = Math.floor(pos / cols);
      const c = pos % cols;
      board[r][c] = -1;
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c] === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] === -1) count++;
          }
        }
        board[r][c] = count;
      }
    }

    const rendered = board.map(row =>
      row.map(cell => `||${cell === -1 ? MINE : NUMBERS[cell]}||`).join('')
    ).join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('💣 Minesweeper')
      .setDescription(`**Difficulty:** ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} | **Mines:** ${mines}\n\n${rendered}`)
      .setFooter({ text: 'Click the spoilers to reveal cells. Avoid the bombs!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
