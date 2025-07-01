const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleModel = new Schema({
    Index2: String,
    PMID: String,
    Article_citation: String,
    Heading_title: String,
    Authors: String,
    Affiliation: String,
    Identifiers: String,
    Abstract: String,
    Category: String,
});

module.exports = mongoose.model('articles', articleModel);
// module.exports = mongoose.model('articles_lung', articleLungModel);
// module.exports = mongoose.model('articles_breast', articleBreastModel);
// module.exports = mongoose.model('articles_thyroid', articleThyroidModel);
