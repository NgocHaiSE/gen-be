const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const colorectalDrugModel = new Schema({
    gene: String,
    position: String,
    aa_mutation: String,
    mutation: String,
    nomenclature: String,
    cds: String,
    drug: String,
    disease: String,
    priority: Number,
    responsive: String,
    description: String,
    documents: String,
    source_db: String,
});

module.exports = mongoose.model('colorectal_drugs', colorectalDrugModel);