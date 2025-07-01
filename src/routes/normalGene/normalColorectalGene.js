const express = require('express');
const router = express.Router();
const normalColorectalGeneController = require('../../app/controllers/normalGene/NormalColorectalController');

router.get('/', normalColorectalGeneController.findAll);

module.exports = router;
