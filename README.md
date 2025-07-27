# Multiplayer Chess Game

A real-time multiplayer chess game using Turborepo, Next.js, WebSockets, Redis, WebRTC, and Chess.js.

## Features

- **Real-Time Gameplay**: Instant communication via WebSockets.
- **Peer-to-Peer Communication**: Videocall usigng WebRTC for direct player interaction.
- **Modern Frontend**: Built with Next.js for a smooth user experience.
- **Efficient State Management**: Redis for real-time updates and caching.
- **Robust Game Logic**: Chess.js for accurate game rule enforcement.

## Technologies

- **Turborepo**: Manages the monorepo and optimizes builds.
- **Next.js**: Framework for the frontend.
- **WebSockets**: Enables real-time, bi-directional communication.
- **Redis**: In-memory database for state management.(Under development)
- **WebRTC**: Facilitates Video conferencing between players.
- **Coturn**: TURN server for video conferencing between two players.
- **Mediasoup**: Enables spactators to view a game.
- **Chess.js**: Provides comprehensive chess game logic.
- **Stockfish**: Provide ability to play against computer.

## Setup

### Prerequisites

- Node.js
- Redis Server
- Docker(not necessary)

### Installation Steps

1. **Clone the Repository**:
    ```sh
    git clone https://github.com/yourusername/multiplayer-chess-game.git
    cd multiplayer-chess-game
    ```

2. **Install Dependencies**:
    ```sh
    npm install
    ```

3. **Setup Environment Variables**:
    Fill all `.env.local` file in the root directory as well as in apps and packages and configure your environment variables as required (e.g., Redis connection details).

4. **Start Redis and Postgres**:
    Ensure your Redis and postgres is running.
   ```sh
    docker compose up
    ```

6. **Migrate your database**:
    ```sh
    cd packages/db
    npx prisma migrate dev
    ```
5. **Run the Development Server in the root folder**:
    ```sh
    npm run dev
    ```

## Project Structure

- `apps/`: Contains the Next.js and Websocket applications.
  - `web/`: Main frontend application built with Next.js with the backend http server.
  - `websocket/`: WebSocket server for real-time communication.
  - `chess-engine/`: Stockfish powered chess engine help in game reviews and plaing against bot.
- `packages/`: Shared packages and libraries.
  - `Typescript-config/`: Types used over different apps.
  - `db/`: Database schema and singleton prisma client.
  - `UI/`: UI Components which are common.
  - `lib/`: Contains all the objects and types using in apps.
  - `redis/`: Contains singleton redis client.
  

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Ensure that your code follows the project's coding standards and passes all tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contact

For any questions or feedback, please open an issue or contact [kushalbhana2050@gmail.com].
