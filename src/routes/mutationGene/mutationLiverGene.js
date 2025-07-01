const express = require('express');
const router = express.Router();
const mutationLiverGeneController = require('../../app/controllers/mutationGene/MutationLiverGeneController');

router.get('/', mutationLiverGeneController.findAll);
router.get('/top20', mutationLiverGeneController.findAllTop20);

module.exports = router;
