const logger = require('../utils/logger');

class DraftService {
  constructor(players) {
    this.players = players;
    this.draftOrder = [];
    this.currentPick = 0;
    this.draftedPlayers = [];
  }

  initializeDraft(numPlayers) {
    this.draftOrder = this.generateRandomOrder(numPlayers);
    logger.info(`Draft initialized with ${numPlayers} players`);
  }

  generateRandomOrder(numPlayers) {
    const order = Array.from({ length: numPlayers }, (_, i) => i + 1);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }

  getCurrentPickPlayer() {
    return this.draftOrder[this.currentPick % this.draftOrder.length];
  }

  draftPlayer(playerIndex) {
    if (playerIndex < 0 || playerIndex >= this.players.length) {
      logger.error(`Invalid player index: ${playerIndex}`);
      throw new Error('Invalid player index');
    }

    const draftedPlayer = this.players.splice(playerIndex, 1)[0];
    this.draftedPlayers.push({
      player: draftedPlayer,
      draftedBy: this.getCurrentPickPlayer(),
    });

    this.currentPick++;
    logger.info(`Player ${draftedPlayer.name} drafted by team ${this.getCurrentPickPlayer()}`);

    return draftedPlayer;
  }

  getRemainingPlayers() {
    return this.players;
  }

  getDraftedPlayers() {
    return this.draftedPlayers;
  }

  isDraftComplete() {
    return this.players.length === 0;
  }
}

module.exports = DraftService;