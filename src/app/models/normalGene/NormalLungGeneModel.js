const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const normalLungGeneModel = new Schema({
    geneName: String,
    mutatedSamples: Number,
    samplesTested: Number,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('normal_lung_genes', normalLungGeneModel);
