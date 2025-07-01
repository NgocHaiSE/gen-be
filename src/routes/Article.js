const express = require('express');
const router = express.Router();
const ArticleController = require('../app/controllers/ArticleController');

router.use(express.json());
router.get('/', ArticleController.getArticle);

module.exports = router;
