const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const Player = require('../models/Player');
const logger = require('../utils/logger');

function parseCsv(filename) {
  return new Promise((resolve, reject) => {
    const players = [];
    fs.createReadStream(path.join(__dirname, '..', '..', 'data', filename))
      .pipe(csv())
      .on('data', (row) => {
        const player = new Player(row.Name, row.Position);
        players.push(player);
      })
      .on('end', () => {
        logger.info(`CSV file successfully processed, ${players.length} players loaded`);
        resolve(players);
      })
      .on('error', (error) => {
        logger.error('Error parsing CSV:', error);
        reject(error);
      });
  });
}

module.exports = { parseCsv };
