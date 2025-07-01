const express = require('express');
const router = express.Router();
const normalLiverGeneControllor = require('../../app/controllers/normalGene/NormalLiverGeneController');

router.get('/', normalLiverGeneControllor.findAll);

module.exports = router;
