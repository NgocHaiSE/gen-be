const express = require('express');
const router = express.Router();
const mutationThyroidGeneController = require('../../app/controllers/mutationGene/MutationThyroidGeneController');

router.get('/', mutationThyroidGeneController.findAll);
router.get('/top20', mutationThyroidGeneController.findAllTop20);

module.exports = router;
