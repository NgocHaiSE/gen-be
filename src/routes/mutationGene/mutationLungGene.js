const express = require('express');
const router = express.Router();
const mutationLungGeneController = require('../../app/controllers/mutationGene/MutationLungGeneController');

router.get('/', mutationLungGeneController.findAll);
router.get('/top20', mutationLungGeneController.findAllTop20);

module.exports = router;
