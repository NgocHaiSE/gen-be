const express = require('express');
const router = express.Router();
const mutationBreastGeneController = require('../../app/controllers/mutationGene/MutationBreastGeneController');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.get('/', mutationBreastGeneController.findAll);
router.get('/top20', mutationBreastGeneController.findAllTop20);
// router.get('/findByName', mutationBreastGeneController.findByGeneName);
// router.post('/findByName', mutationBreastGeneController.findByGeneName);

module.exports = router;
