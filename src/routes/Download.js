const express = require('express');
const router = express.Router();
const downloadController = require('../app/controllers/DownloadController');

router.use(express.json());
router.get('/', downloadController.download);

module.exports = router;
