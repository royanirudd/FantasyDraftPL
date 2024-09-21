const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./src/routes/index');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const DraftService = require('./src/services/draftService');
const { parseCsv } = require('./src/services/csvParser');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

let draftService;
let players;
let expectedTeamCount = 0;
let teamNames = [];
let socketToTeam = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('start_draft', async (numPlayers) => {
    try {
      if (!players) {
        players = await parseCsv('players.csv');
      }
      expectedTeamCount = numPlayers;
      teamNames = [];
      socketToTeam.clear();
      io.emit('show_team_naming');
    } catch (error) {
      console.error('Error starting draft:', error);
      socket.emit('draft_error', 'Error starting draft');
    }
  });

  socket.on('set_team_name', (teamName) => {
    if (teamNames.includes(teamName)) {
      socket.emit('team_name_error', 'This team name is already taken. Please choose a different name.');
      return;
    }

    teamNames.push(teamName);
    socket.teamName = teamName;
    socketToTeam.set(socket.id, teamName);
    io.emit('team_ready', teamName);
    
    if (teamNames.length === expectedTeamCount) {
      draftService = new DraftService([...players]);
      draftService.initializeDraft(expectedTeamCount, teamNames);
      io.emit('all_teams_ready', {
        teamNames: teamNames,
        players: draftService.getRemainingPlayers(),
        currentTeam: draftService.getCurrentPickTeam()
      });
      notifyCurrentTeam();
    }
  });

  socket.on('draft_player', (playerIndex) => {
    try {
      const draftedPlayer = draftService.draftPlayer(playerIndex);
      const currentTeam = draftService.getCurrentPickTeam();
      const remainingPlayers = draftService.getRemainingPlayers();
      
      io.emit('player_drafted', {
        player: draftedPlayer,
        draftedBy: currentTeam,
        remainingPlayers: remainingPlayers,
        nextTeam: draftService.getCurrentPickTeam()
      });

      if (draftService.isDraftComplete()) {
        io.emit('draft_complete');
        for (const [socketId, teamName] of socketToTeam.entries()) {
          const teamPlayers = draftService.getTeamPlayers(teamName);
          io.to(socketId).emit('team_results', teamPlayers);
        }
      } else {
        notifyCurrentTeam();
      }
    } catch (error) {
      console.error('Error drafting player:', error);
      socket.emit('draft_error', 'Error drafting player');
    }
  });

  socket.on('chat_message', (message) => {
    io.emit('chat_message', {
      teamName: socket.teamName,
      message: message
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    socketToTeam.delete(socket.id);
  });
});

function notifyCurrentTeam() {
  const currentTeam = draftService.getCurrentPickTeam();
  for (const [socketId, teamName] of socketToTeam.entries()) {
    if (teamName === currentTeam) {
      io.to(socketId).emit('your_turn');
    } else {
      io.to(socketId).emit('other_turn', currentTeam);
    }
  }
}

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
