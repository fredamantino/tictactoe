# Real-Time Multiplayer Tic Tac Toe

This project is a real-time multiplayer Tic Tac Toe game built with Node.js, Express, and Socket.io. It allows two players to connect via a web browser, join a game room, and play a classic game of Tic Tac Toe with live updates.

## Features

- **Real-Time Gameplay:** Uses Socket.io to handle real-time communication between players.
- **Multiple Game Rooms:** Automatically assigns players to available rooms.
- **Turn-Based Logic:** Enforces turn-based moves and validates each play.
- **Win/Draw Detection:** Automatically detects winning moves and draws.
- **Theme Support:** Switch between dark and light themes.
- **Responsive UI:** Built with Bootstrap, Font Awesome, and custom CSS for an engaging user experience.

## Technologies Used

- **Node.js**
- **Express**
- **Socket.io**
- **HTML/CSS**
- **JavaScript**
- **Bootstrap**
- **Font Awesome**

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/real-time-multiplayer-tic-tac-toe.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd real-time-multiplayer-tic-tac-toe
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

## Usage

1. **Start the server:**

   ```bash
   node server.js
   ```
      ```bash
   npm start
   ```

2. **Open your browser and go to:**

   ```
   http://localhost:3000
   ```

3. **Play the Game:**

   - Open multiple browser tabs or windows to simulate multiple players.
   - Enjoy the real-time multiplayer experience!

## Project Structure

- **server.js**  
  Contains the server code, including Express and Socket.io configuration, room management, and game logic.

- **public/**
  - **index.html**  
    The main HTML file for the game interface.
  - **style.css**  
    Contains the styles for the game, including theme settings.
  - **main.js**  
    Handles the client-side logic, events, and real-time communication.

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- [Socket.io](https://socket.io/) for the real-time communication framework.
- [Bootstrap](https://getbootstrap.com/) for the responsive design.
- [Font Awesome](https://fontawesome.com/) for the icons.
