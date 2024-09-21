# Fantasy Premier League Draft Application

This is a web-based Fantasy Premier League Draft application that allows users to conduct a live draft for their fantasy league. The application uses Node.js for the backend, Socket.IO for real-time communication, and vanilla JavaScript for the frontend.

## Features

- Live draft functionality
- Support for multiple teams
- Real-time updates for all connected users
- Player drafting with automatic turn rotation
- Case-insensitive player search
- CSV parsing for player data
- Responsive design

## Installation

<details>
<summary>Click to expand installation instructions</summary>

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14 or later)
- npm (usually comes with Node.js)

### Steps

1. Clone the repository:

git clone https://github.com/royanirudd/FantasyDraftPL.git
cd FantasyDraftPL


2. Install the dependencies:

npm install


3. Place your `players.csv` file in the `data` directory. Ensure it has at least the following columns:
- Name
- Position

</details>

## Usage

1. Start the server:

npm start
sql_more


2. Open a web browser and navigate to `http://localhost:3000` (or the port you've configured).

3. Enter the number of teams and team names to start the draft.

4. Use the search bar to find specific players.

5. Click on a player to draft them.

## File Structure

- `app.js`: Main application file
- `src/services/csvParser.js`: CSV parsing service
- `src/services/draftService.js`: Draft logic service
- `src/models/Player.js`: Player model
- `src/utils/logger.js`: Logging utility
- `public/index.html`: Main HTML file
- `public/script.js`: Client-side JavaScript
- `public/styles.css`: CSS styles

## Contributing

Contributions to the Fantasy Premier League Draft Application are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Anirudh Roy - royanirudd@gmail.com

Project Link: [https://github.com/royanirudd/FantasyDraftPL](https://github.com/royanirudd/FantasyDraftPL)

