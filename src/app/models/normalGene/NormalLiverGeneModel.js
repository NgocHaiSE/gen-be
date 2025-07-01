const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const normalLiverGeneModel = new Schema({
    geneName: String,
    mutatedSamples: Number,
    samplesTested: Number,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('normal_liver_genes', normalLiverGeneModel);
