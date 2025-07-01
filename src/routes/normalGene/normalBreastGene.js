const express = require('express');
const router = express.Router();
const normalBreastGeneController = require('../../app/controllers/normalGene/NormalBreastGeneController');

router.get('/', normalBreastGeneController.findAll);

module.exports = router;
