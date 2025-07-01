const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const geneModel = new Schema({
    hugoSymbol: String,
    entrezGeneID: String,
    GRCh37_Isoform: String,
    GRCh37_RefSeq: String,
    GRCh38_Isoform: String,
    GRCh38_RefSeq: String,
    occurrenceWithinResources: Number,
    oncoKBAnnotated: Boolean,
    isOncogene: Boolean,
    isTumorSuppressorGene: Boolean,
    MSK_IMPACT: Boolean,
    MSK_HEME: Boolean,
    foundationOne: Boolean,
    foundationOneHEME: Boolean,
    vogelstein: Boolean,
    sangerCGC: Boolean,
    geneAliases: String,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('genes', geneModel);
