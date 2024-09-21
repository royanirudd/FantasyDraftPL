const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { parseCsv } = require('../services/csvParser');
const DraftService = require('../services/draftService');

let draftService;

router.get('/', async (req, res) => {
  try {
    if (!draftService) {
      const players = await parseCsv('players.csv');
      draftService = new DraftService(players);
    }
    logger.info('Rendering home page');
    res.render('index', { title: 'Fantasy Draft PL' });
  } catch (error) {
    logger.error('Error initializing draft:', error);
    res.status(500).send('Error initializing draft');
  }
});

module.exports = router;
