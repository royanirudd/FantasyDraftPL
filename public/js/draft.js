const socket = io();

const draftSetup = document.getElementById('draft-setup');
const draftArea = document.getElementById('draft-area');
const draftComplete = document.getElementById('draft-complete');
const startDraftButton = document.getElementById('start-draft');
const numPlayersInput = document.getElementById('num-players');
const draftOrderElement = document.getElementById('draft-order');
const currentPickElement = document.getElementById('current-pick');
const availablePlayersElement = document.getElementById('player-list');
const draftedPlayersElement = document.getElementById('draft-list');
const finalResultsElement = document.getElementById('final-results');

startDraftButton.addEventListener('click', () => {
  const numPlayers = parseInt(numPlayersInput.value);
  if (numPlayers >= 2 && numPlayers <= 12) {
    socket.emit('start_draft', numPlayers);
  } else {
    alert('Please enter a number of teams between 2 and 12');
  }
});

socket.on('draft_started', (draftOrder) => {
  draftSetup.style.display = 'none';
  draftArea.style.display = 'block';
  
  draftOrderElement.innerHTML = '<h3>Draft Order:</h3>' + 
    draftOrder.map(player => `<div class="team-name">Team ${player}</div>`).join('');
});

socket.on('player_drafted', ({ player, draftedBy, remainingPlayers }) => {
  currentPickElement.innerHTML = `<h3>Current Pick: <span class="current-team">Team ${draftedBy}</span></h3>`;
  
  availablePlayersElement.innerHTML = remainingPlayers.map((player, index) => 
    `<div class="player-card" onclick="draftPlayer(${index})">
      <strong>${player.name}</strong><br>
      Position: ${player.position}<br>
      Team: ${player.team}
    </div>`
  ).join('');
  
  if (player) {
    const draftedPlayerElement = document.createElement('div');
    draftedPlayerElement.classList.add('player-card');
    draftedPlayerElement.innerHTML = `
      <strong>${player.name}</strong><br>
      Position: ${player.position}<br>
      Team: ${player.team}<br>
      Drafted by: <span class="team-name">Team ${draftedBy}</span>
    `;
    draftedPlayersElement.appendChild(draftedPlayerElement);
  }
});

socket.on('draft_complete', (draftedPlayers) => {
  draftArea.style.display = 'none';
  draftComplete.style.display = 'block';
  
  finalResultsElement.innerHTML = draftedPlayers.map(({ player, draftedBy }) => 
    `<div class="player-card">
      <strong>${player.name}</strong><br>
      Position: ${player.position}<br>
      Team: ${player.team}<br>
      Drafted by: <span class="team-name">Team ${draftedBy}</span>
    </div>`
  ).join('');
});

socket.on('draft_error', (errorMessage) => {
  alert(`Draft error: ${errorMessage}`);
});

function draftPlayer(playerIndex) {
  socket.emit('draft_player', playerIndex);
}
