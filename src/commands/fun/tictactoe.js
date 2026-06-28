import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

function createBoard() {
  return Array(9).fill(null);
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function buildRows(board, disabled = false) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const val = board[idx];
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`ttt_${idx}`)
          .setLabel(val || '‎')
          .setStyle(val === 'X' ? ButtonStyle.Danger : val === 'O' ? ButtonStyle.Primary : ButtonStyle.Secondary)
          .setDisabled(disabled || !!val),
      );
    }
    rows.push(row);
  }
  return rows;
}

export default {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Play tic tac toe against the bot'),

  name: 'tictactoe',
  description: 'Play tic tac toe against the bot',

  async execute(interaction, client) {
    const board = createBoard();
    let currentTurn = 'X'; // Player is X, bot is O

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('❌⭕ Tic Tac Toe')
      .setDescription(`Your turn! You are **X**`)
      .setTimestamp();

    const reply = await interaction.reply({
      embeds: [embed],
      components: buildRows(board),
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === interaction.user.id && i.customId.startsWith('ttt_'),
      time: 120_000,
    });

    collector.on('collect', async i => {
      const idx = parseInt(i.customId.split('_')[1]);
      if (board[idx]) return i.deferUpdate();

      board[idx] = 'X';
      let winner = checkWinner(board);
      let isDraw = !winner && board.every(Boolean);

      if (!winner && !isDraw) {
        // Bot move
        const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
        const botIdx = empty[Math.floor(Math.random() * empty.length)];
        board[botIdx] = 'O';
        winner = checkWinner(board);
        isDraw = !winner && board.every(Boolean);
      }

      const done = winner || isDraw;
      const desc = winner
        ? winner === 'X' ? '🎉 You win!' : '🤖 Bot wins!'
        : isDraw ? '🤝 It\'s a draw!' : `Your turn! You are **X**`;

      const color = winner === 'X' ? 0x2ECC71 : winner === 'O' ? 0xE74C3C : isDraw ? 0xF39C12 : 0x5865F2;

      await i.update({
        embeds: [embed.setDescription(desc).setColor(color)],
        components: buildRows(board, done),
      });

      if (done) collector.stop();
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        await reply.edit({ components: buildRows(board, true) }).catch(() => {});
      }
    });
  },
};
