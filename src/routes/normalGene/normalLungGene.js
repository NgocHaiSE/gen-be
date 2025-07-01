const express = require('express');
const router = express.Router();
const normalLungGeneController = require('../../app/controllers/normalGene/NormalLungGeneController');

router.get('/', normalLungGeneController.findAll);

module.exports = router;
