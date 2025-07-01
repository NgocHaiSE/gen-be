const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mutationModel = new Schema({
    variant: {},
    mutationEffect: String,
    mutationEffectPmids: [],
    mutationEffectAbstracts: [],
    oncogenic: String,
    oncogenicPmids: [],
    oncogenicAbstracts: [],
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('mutations', mutationModel);
