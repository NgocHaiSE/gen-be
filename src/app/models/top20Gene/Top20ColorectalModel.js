const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const top20ColorectalModel = new Schema({
    gene_name: String,
    value: Number,
    type: String,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('top20_colorectal_genes', top20ColorectalModel);
