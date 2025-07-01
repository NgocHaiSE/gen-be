const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const drugInformationModel = new Schema({
    level: String,
    gene: String,
    alteration: String,
    alteration_name: String,
    cancer_main_type: String,
    cancer_sub_type: String,
    drug: Array,
    knownEffect: String,
    articles: Array,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('drugs_information', drugInformationModel);
