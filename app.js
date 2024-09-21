const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const logger = require('./src/utils/logger');
const { parseCsv } = require('./src/services/csvParser');
const DraftService = require('./src/services/draftService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

let draftService;
let players;

// Routes
const indexRouter = require('./src/routes/index');
app.use('/', indexRouter);

// Initialize players data
async function initializePlayers() {
  try {
    players = await parseCsv('players.csv');
    logger.info(`Loaded ${players.length} players from CSV`);
  } catch (error) {
    logger.error('Error loading players from CSV:', error);
  }
}

// WebSocket connection
io.on('connection', (socket) => {
  logger.info('A user connected');

  socket.on('start_draft', async (numPlayers) => {
    try {
      if (!players) {
        await initializePlayers();
      }
      draftService = new DraftService([...players]); // Create a new instance with a copy of players
      draftService.initializeDraft(numPlayers);
      io.emit('draft_started', draftService.draftOrder);
      io.emit('player_drafted', {
        draftedBy: draftService.getCurrentPickPlayer(),
        remainingPlayers: draftService.getRemainingPlayers(),
      });
    } catch (error) {
      logger.error('Error starting draft:', error);
      socket.emit('draft_error', 'Error starting draft');
    }
  });

  socket.on('draft_player', (playerIndex) => {
    if (draftService) {
      try {
        const draftedPlayer = draftService.draftPlayer(playerIndex);
        io.emit('player_drafted', {
          player: draftedPlayer,
          draftedBy: draftService.getCurrentPickPlayer(),
          remainingPlayers: draftService.getRemainingPlayers(),
        });

        if (draftService.isDraftComplete()) {
          io.emit('draft_complete', draftService.getDraftedPlayers());
          draftService = null; // Reset draftService after completion
        }
      } catch (error) {
        logger.error('Error drafting player:', error);
        socket.emit('draft_error', error.message);
      }
    } else {
      socket.emit('draft_error', 'Draft has not been started');
    }
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected');
  });
});

// Error handling
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: app.get('env') === 'development' ? err : {},
  });
});

// Start server
const port = process.env.PORT || 3000;
server.listen(port, async () => {
  logger.info(`Server running on port ${port}`);
  await initializePlayers();
});

module.exports = app;
