const express = require('express');
const router = express.Router();
const normalThyroidGeneController = require('../../app/controllers/normalGene/NormalThyroidGeneController');

router.get('/', normalThyroidGeneController.findAll);

module.exports = router;
