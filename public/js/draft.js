const socket = io();

const draftSetup = document.getElementById('draft-setup');
const teamNamingArea = document.getElementById('team-naming-area');
const draftArea = document.getElementById('draft-area');
const draftComplete = document.getElementById('draft-complete');
const startDraftButton = document.getElementById('start-draft');
const numPlayersInput = document.getElementById('num-players');
const teamNameInput = document.getElementById('team-name');
const submitTeamNameButton = document.getElementById('submit-team-name');
const draftOrderElement = document.getElementById('draft-order');
const currentPickElement = document.getElementById('current-pick');
const availablePlayersElement = document.getElementById('player-list');
const draftedPlayersElement = document.getElementById('draft-list');
const finalResultsElement = document.getElementById('final-results');
const notificationElement = document.getElementById('notification');

let myTeamName = '';
let isMyTurn = false;

startDraftButton.addEventListener('click', () => {
  const numPlayers = parseInt(numPlayersInput.value);
  if (numPlayers >= 2 && numPlayers <= 12) {
    socket.emit('start_draft', numPlayers);
  } else {
    alert('Please enter a number of teams between 2 and 12');
  }
});

submitTeamNameButton.addEventListener('click', () => {
  const teamName = teamNameInput.value.trim();
  if (teamName) {
    myTeamName = teamName;
    socket.emit('set_team_name', teamName);
    teamNameInput.value = '';
    submitTeamNameButton.disabled = true;
  } else {
    alert('Please enter a valid team name');
  }
});

socket.on('show_team_naming', () => {
  draftSetup.style.display = 'none';
  teamNamingArea.style.display = 'block';
});

socket.on('team_ready', (teamName) => {
  const teamList = document.getElementById('team-list');
  const teamElement = document.createElement('li');
  teamElement.textContent = teamName;
  teamList.appendChild(teamElement);
});

socket.on('all_teams_ready', ({ teamNames, players, currentTeam }) => {
  teamNamingArea.style.display = 'none';
  draftArea.style.display = 'block';
  
  draftOrderElement.innerHTML = '<h3>Draft Order:</h3>' + 
    teamNames.map(team => `<div class="team-name">${team}</div>`).join('');
  
  updateAvailablePlayers(players);
  updateCurrentPick(currentTeam);
});

socket.on('player_drafted', ({ player, draftedBy, remainingPlayers, nextTeam }) => {
  updateCurrentPick(nextTeam);
  updateAvailablePlayers(remainingPlayers);
  
  const draftedPlayerElement = document.createElement('div');
  draftedPlayerElement.classList.add('player-card');
  draftedPlayerElement.innerHTML = `
    <strong>${player.name}</strong><br>
    Position: ${player.position}<br>
    Drafted by: <span class="team-name">${draftedBy}</span>
  `;
  draftedPlayersElement.appendChild(draftedPlayerElement);

  hideNotification();
  isMyTurn = false;
});

socket.on('draft_complete', (draftedPlayers) => {
  draftArea.style.display = 'none';
  draftComplete.style.display = 'block';
  
  finalResultsElement.innerHTML = draftedPlayers.map(({ player, draftedBy }) => 
    `<div class="player-card">
      <strong>${player.name}</strong><br>
      Position: ${player.position}<br>
      Drafted by: <span class="team-name">${draftedBy}</span>
    </div>`
  ).join('');

  showNotification("Draft completed");
});

socket.on('draft_error', (errorMessage) => {
  alert(`Draft error: ${errorMessage}`);
});

socket.on('your_turn', () => {
  showNotification("Your turn to pick");
  playNotificationSound();
  isMyTurn = true;
});

socket.on('other_turn', (teamName) => {
  hideNotification();
  updateCurrentPick(teamName);
  isMyTurn = false;
});

function draftPlayer(playerIndex) {
  if (isMyTurn) {
    socket.emit('draft_player', playerIndex);
  } else {
    alert('It is not your turn to pick');
  }
}

function updateAvailablePlayers(players) {
  availablePlayersElement.innerHTML = players.map((player, index) => 
    `<div class="player-card ${isMyTurn ? 'clickable' : ''}" onclick="draftPlayer(${index})">
      <strong>${player.name}</strong><br>
      Position: ${player.position}
    </div>`
  ).join('');
}

function updateCurrentPick(currentTeam) {
  currentPickElement.innerHTML = `<h3>Current Pick: <span class="current-team">${currentTeam}</span></h3>`;
}

function showNotification(message) {
  notificationElement.textContent = message;
  notificationElement.style.display = 'block';
}

function hideNotification() {
  notificationElement.style.display = 'none';
}

function playNotificationSound() {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play();
}
