const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mutationColorectalGeneModel = new Schema({
    geneName: String,
    mutatedSamples: Number,
    samplesTested: Number,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
    'mutation_colorectal_genes',
    mutationColorectalGeneModel,
);
