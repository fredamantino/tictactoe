document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const cells = document.querySelectorAll('.cell');
  const resetButton = document.getElementById('reset');
  const toggleThemeSwitch = document.getElementById('toggle-theme');
  const messageElement = document.getElementById('message');
  let currentPlayer = '';
  let currentSymbol = '';
  let gameBoard = ['', '', '', '', '', '', '', '', ''];
  let isGameActive = false;
  let isDarkMode = true;

  socket.on('player-assigned', (player) => {
    currentPlayer = player;
    displayMessage(`Você é o ${player}`);
  });

  socket.on('update-player-info', ({ player1, player2 }) => {
    updatePlayerInfo('player1', player1);
    updatePlayerInfo('player2', player2);
  });

  function updatePlayerInfo(playerId, playerInfo) {
    const playerInfoElement = document.getElementById(playerId + '-info');
    playerInfoElement.innerHTML = `
          ${playerInfo.icon}
          <span>${playerInfo.name}</span>
          <span class="victory-count">${playerInfo.victories}</span>
      `;
  }

  socket.on('game-start', ({ board, startingPlayer }) => {
    gameBoard = board;
    isGameActive = true;
    currentSymbol = startingPlayer;
    displayMessage(`O jogo começou! ${startingPlayer} começa.`);
    updateBoard();
  });

  socket.on('update-board', ({ board, message, currentPlayer }) => {
    gameBoard = board;
    currentSymbol = currentPlayer;
    displayMessage(message);
    updateBoard();
  });

  socket.on('game-over', ({ winner, winningCells }) => {
    isGameActive = false;
    if (winner === 'Draw') {
      displayMessage('Empate!');
      cells.forEach(cell => {
        const icon = cell.querySelector('i');
        if (icon) icon.style.color = 'var(--color-draw)';
      });
    } else {
      displayMessage(`${winner} venceu!`);
      winningCells.forEach(index => {
        const icon = cells[index].querySelector('i');
        if (icon) icon.style.color = 'var(--color-win)';
      });
    }
  });

  socket.on('player-disconnected', () => {
    isGameActive = false;
    displayMessage('O outro jogador desconectou. Esperando um novo jogador...');
  });

  cells.forEach(cell => {
    cell.addEventListener('mouseover', handleCellHover);
    cell.addEventListener('mouseout', handleCellMouseOut);
    cell.addEventListener('click', handleCellClick);
  });

  function handleCellHover(event) {
    const cell = event.currentTarget;
    const index = parseInt(cell.getAttribute('data-index'));
    if (gameBoard[index] !== '' || !isGameActive) return;
    cell.innerHTML = currentSymbol === 'X' ?
      '<i class="fas fa-times" style="opacity: 0.3; pointer-events: none;"></i>' :
      '<i class="fas fa-circle" style="opacity: 0.3; pointer-events: none; font-size: 80%;"></i>';
  }

  function handleCellMouseOut(event) {
    const cell = event.currentTarget;
    const index = parseInt(cell.getAttribute('data-index'));
    if (gameBoard[index] !== '' || !isGameActive) return;
    cell.innerHTML = '';
  }

  function handleCellClick(event) {
    const cell = event.currentTarget;
    const index = parseInt(cell.getAttribute('data-index'));
    if (gameBoard[index] !== '' || !isGameActive) return;
    socket.emit('make-move', index);
  }

  function updateBoard() {
    cells.forEach((cell, index) => {
      cell.innerHTML = gameBoard[index] === 'X' ? '<i class="fas fa-times"></i>' : gameBoard[index] === 'O' ? '<i class="fas fa-circle" style="font-size: 80%;"></i>' : '';
    });
  }

  function displayMessage(message) {
    messageElement.textContent = message;
  }

  resetButton.addEventListener('click', () => {
    socket.emit('reset-game');
  });

  function toggleTheme() {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    isDarkMode = !isDarkMode;
  }

  toggleThemeSwitch.addEventListener('change', toggleTheme);
});
