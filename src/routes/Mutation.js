const express = require('express');
const router = express.Router();
const mutationController = require('../app/controllers/MutationController');

router.get('/', mutationController.findAll);
router.get('/find/:id', mutationController.findByID);

module.exports = router;
