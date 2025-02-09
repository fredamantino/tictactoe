const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Encontrar ou criar sala
    let roomId = Object.keys(rooms).find(id => rooms[id].players.length < 2);
    if (!roomId) {
        roomId = `room_${socket.id}`;
        rooms[roomId] = {
            players: [],
            gameBoard: Array(9).fill(''),
            currentPlayerIndex: Math.floor(Math.random() * 2),
            playerData: [
                { id: null, name: 'Jogador 1', symbol: 'X', victories: 0, icon: '<i class="fas fa-times"></i>' },
                { id: null, name: 'Jogador 2', symbol: 'O', victories: 0, icon: '<i class="fas fa-circle" style="font-size:80%;"></i>' }
            ],
            currentSymbol: ''
        };
    }

    socket.join(roomId);
    const room = rooms[roomId];
    const playerIndex = room.players.length;
    room.players.push(socket.id);
    room.playerData[playerIndex].id = socket.id;

    socket.emit('player-assigned', room.playerData[playerIndex].name);

    // Iniciar jogo quando a sala estiver cheia
    if (room.players.length === 2) {
        room.currentSymbol = room.currentPlayerIndex === 0 ? 'X' : 'O';
        io.to(roomId).emit('update-player-info', {
            player1: room.playerData[0],
            player2: room.playerData[1]
        });
        startNewGame(roomId);
    }

    // Lógica de movimento
    socket.on('make-move', (index) => {
        if (
            room.players.includes(socket.id) &&
            room.gameBoard[index] === '' &&
            socket.id === room.playerData[room.currentPlayerIndex].id
        ) {
            room.gameBoard[index] = room.currentSymbol;
            room.currentPlayerIndex = 1 - room.currentPlayerIndex;
            room.currentSymbol = room.currentSymbol === 'X' ? 'O' : 'X';

            io.to(roomId).emit('update-board', {
                board: room.gameBoard,
                message: `Vez do ${room.currentSymbol === 'X' ? 'Jogador 1' : 'Jogador 2'}`,
                currentPlayer: room.currentSymbol
            });

            const winner = checkWinner(room.gameBoard);
            if (winner) {
                const winningPlayer = room.playerData.find(p => p.symbol === winner.symbol);
                winningPlayer.victories++;
                io.to(roomId).emit('game-over', {
                    winner: winner.symbol,
                    winningCells: winner.cells
                });
                io.to(roomId).emit('update-player-info', {
                    player1: room.playerData[0],
                    player2: room.playerData[1]
                });
                resetGame(roomId);
            } else if (room.gameBoard.every(cell => cell !== '')) {
                io.to(roomId).emit('game-over', { winner: 'Draw' });
                resetGame(roomId);
            }
        }
    });

    // Reiniciar jogo
    socket.on('reset-game', () => {
        const room = rooms[roomId];
        // Verifica se a sala existe e possui exatamente 2 jogadores
        if (room && room.players.length === 2) {
            startNewGame(roomId);
        } else {
            // Se houver menos de 2 jogadores, emite um evento informando que a sala ainda não está completa
            socket.emit('update-board', {
                board: room ? room.gameBoard : Array(9).fill(''),
                message: 'Aguardando outro jogador para reiniciar o jogo.',
                currentPlayer: room ? room.currentSymbol : ''
            });
        }
    });

    // Tratar desconexão
    socket.on('disconnect', () => {
        room.players = room.players.filter(id => id !== socket.id);
        const playerDataIndex = room.playerData.findIndex(p => p.id === socket.id);
        if (playerDataIndex !== -1) room.playerData[playerDataIndex].id = null;

        if (room.players.length < 2) {
            io.to(roomId).emit('player-disconnected');
            resetGame(roomId);
        }
        if (room.players.length === 0) delete rooms[roomId];
    });
});

// Funções auxiliares
const checkWinner = (board) => {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
        [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
    ];
    for (const [a, b, c] of winConditions) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { symbol: board[a], cells: [a, b, c] };
        }
    }
    return null;
};

const startNewGame = (roomId) => {
    const room = rooms[roomId];
    room.gameBoard = Array(9).fill('');
    room.currentSymbol = room.currentPlayerIndex === 0 ? 'X' : 'O';
    io.to(roomId).emit('game-start', {
        board: room.gameBoard,
        startingPlayer: room.currentSymbol
    });
};

const resetGame = (roomId) => {
    const room = rooms[roomId];
    room.gameBoard = Array(9).fill('');
    room.currentSymbol = room.currentPlayerIndex === 0 ? 'X' : 'O';
};

server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));