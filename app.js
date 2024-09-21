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

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('start_draft', async (numPlayers) => {
    try {
      if (!players) {
        players = await parseCsv('players.csv');
      }
      expectedTeamCount = numPlayers;
      teamNames = [];
      io.emit('show_team_naming');
    } catch (error) {
      console.error('Error starting draft:', error);
      socket.emit('draft_error', 'Error starting draft');
    }
  });

  socket.on('set_team_name', (teamName) => {
    teamNames.push(teamName);
    io.emit('team_ready', teamName);
    
    if (teamNames.length === expectedTeamCount) {
      draftService = new DraftService([...players]);
      draftService.initializeDraft(expectedTeamCount, teamNames);
      io.emit('all_teams_ready', {
        teamNames: teamNames,
        players: draftService.getRemainingPlayers(),
        currentTeam: draftService.getCurrentPickTeam()
      });
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
        io.emit('draft_complete', draftService.getDraftedPlayers());
      }
    } catch (error) {
      console.error('Error drafting player:', error);
      socket.emit('draft_error', 'Error drafting player');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
