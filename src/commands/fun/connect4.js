import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

const ROWS = 6;
const COLS = 7;
const EMPTY = '⚫';
const P1 = '🔴';
const P2 = '🟡';

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function dropPiece(board, col, piece) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === EMPTY) {
      board[r][col] = piece;
      return r;
    }
  }
  return -1;
}

function checkWinner(board, piece) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if ([0,1,2,3].every(i => board[r][c+i] === piece)) return true;
    }
  }
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      if ([0,1,2,3].every(i => board[r+i][c] === piece)) return true;
    }
  }
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if ([0,1,2,3].every(i => board[r+i][c+i] === piece)) return true;
    }
  }
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if ([0,1,2,3].every(i => board[r-i][c+i] === piece)) return true;
    }
  }
  return false;
}

function renderBoard(board) {
  return board.map(row => row.join('')).join('\n') + '\n1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
}

function buildColButtons(board, disabled = false) {
  const row1 = new ActionRowBuilder();
  const row2 = new ActionRowBuilder();
  for (let c = 0; c < 4; c++) {
    const full = board[0][c] !== EMPTY;
    row1.addComponents(
      new ButtonBuilder()
        .setCustomId(`c4_${c}`)
        .setLabel(`${c + 1}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled || full),
    );
  }
  for (let c = 4; c < COLS; c++) {
    const full = board[0][c] !== EMPTY;
    row2.addComponents(
      new ButtonBuilder()
        .setCustomId(`c4_${c}`)
        .setLabel(`${c + 1}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled || full),
    );
  }
  return [row1, row2];
}

export default {
  data: new SlashCommandBuilder()
    .setName('connect4')
    .setDescription('Play Connect Four against the bot'),

  name: 'connect4',
  description: 'Play Connect Four against the bot',

  async execute(interaction, client) {
    const board = createBoard();

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🔴🟡 Connect Four')
      .setDescription(`${renderBoard(board)}\n\nYour turn! You are 🔴`)
      .setTimestamp();

    const reply = await interaction.reply({
      embeds: [embed],
      components: buildColButtons(board),
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === interaction.user.id && i.customId.startsWith('c4_'),
      time: 180_000,
    });

    collector.on('collect', async i => {
      const col = parseInt(i.customId.split('_')[1]);
      const row = dropPiece(board, col, P1);
      if (row === -1) return i.deferUpdate();

      let done = false;
      let desc = '';

      if (checkWinner(board, P1)) {
        desc = `${renderBoard(board)}\n\n🎉 **You win!**`;
        done = true;
      } else if (board[0].every(c => c !== EMPTY)) {
        desc = `${renderBoard(board)}\n\n🤝 **It's a draw!**`;
        done = true;
      } else {
        // Bot move — pick random valid column
        const valid = Array.from({ length: COLS }, (_, c) => c).filter(c => board[0][c] === EMPTY);
        const botCol = valid[Math.floor(Math.random() * valid.length)];
        dropPiece(board, botCol, P2);

        if (checkWinner(board, P2)) {
          desc = `${renderBoard(board)}\n\n🤖 **Bot wins!**`;
          done = true;
        } else if (board[0].every(c => c !== EMPTY)) {
          desc = `${renderBoard(board)}\n\n🤝 **It's a draw!**`;
          done = true;
        } else {
          desc = `${renderBoard(board)}\n\nYour turn! You are 🔴`;
        }
      }

      await i.update({
        embeds: [embed.setDescription(desc)],
        components: buildColButtons(board, done),
      });

      if (done) collector.stop();
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        await reply.edit({ components: buildColButtons(board, true) }).catch(() => {});
      }
    });
  },
};
