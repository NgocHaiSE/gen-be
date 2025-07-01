const express = require('express');
const router = express.Router();
const geneController = require('../app/controllers/GeneController');

router.get('/', geneController.findAll);

module.exports = router;
