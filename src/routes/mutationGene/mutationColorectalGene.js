const express = require('express');
const router = express.Router();
const mutationColorectalGeneController = require('../../app/controllers/mutationGene/MutationColorectalGeneController');

router.get('/', mutationColorectalGeneController.findAll);
router.get('/top20', mutationColorectalGeneController.findAllTop20);

module.exports = router;
