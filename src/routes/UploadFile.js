const express = require('express');
const router = express.Router();
const UploadFile = require('../app/controllers/UploadFile');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.post('/', UploadFile.uploadFile);

module.exports = router;
