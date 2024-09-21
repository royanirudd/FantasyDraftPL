const socket = io();

const draftSetup = document.getElementById('draft-setup');
const draftArea = document.getElementById('draft-area');
const draftComplete = document.getElementById('draft-complete');
const startDraftButton = document.getElementById('start-draft');
const numPlayersInput = document.getElementById('num-players');
const draftOrderElement = document.getElementById('draft-order');
const currentPickElement = document.getElementById('current-pick');
const availablePlayersElement = document.getElementById('available-players');
const draftedPlayersElement = document.getElementById('drafted-players');
const finalResultsElement = document.getElementById('final-results');

startDraftButton.addEventListener('click', () => {
  const numPlayers = parseInt(numPlayersInput.value);
  if (numPlayers >= 2 && numPlayers <= 7) {
    socket.emit('start_draft', numPlayers);
  } else {
    alert('Please enter a number of players between 2 and 7');
  }
});

socket.on('draft_started', (draftOrder) => {
  draftSetup.style.display = 'none';
  draftArea.style.display = 'block';
  
  draftOrderElement.innerHTML = '<h3>Draft Order:</h3>' + draftOrder.map(player => `<div>Team ${player}</div>`).join('');
});

socket.on('player_drafted', ({ player, draftedBy, remainingPlayers }) => {
  currentPickElement.innerHTML = `<h3>Current Pick: Team ${draftedBy}</h3>`;
  
  availablePlayersElement.innerHTML = '<h3>Available Players:</h3>' + remainingPlayers.map((player, index) => 
    `<div class="player-card" onclick="draftPlayer(${index})">${player.name} (${player.position})</div>`
  ).join('');
  
  const draftedPlayerElement = document.createElement('div');
  draftedPlayerElement.classList.add('player-card');
  draftedPlayerElement.textContent = `Team ${draftedBy}: ${player.name} (${player.position})`;
  draftedPlayersElement.appendChild(draftedPlayerElement);
});

socket.on('draft_complete', (draftedPlayers) => {
  draftArea.style.display = 'none';
  draftComplete.style.display = 'block';
  
  finalResultsElement.innerHTML = draftedPlayers.map(({ player, draftedBy }) => 
    `<div>Team ${draftedBy}: ${player.name} (${player.position})</div>`
  ).join('');
});

socket.on('draft_error', (errorMessage) => {
  alert(`Draft error: ${errorMessage}`);
});

function draftPlayer(playerIndex) {
  socket.emit('draft_player', playerIndex);
}
