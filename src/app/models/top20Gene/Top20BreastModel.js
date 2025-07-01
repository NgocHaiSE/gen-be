const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const top20BreastModel = new Schema({
    gene_name: String,
    value: Number,
    type: String,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('top20_breast_genes', top20BreastModel);
