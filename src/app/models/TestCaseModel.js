const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const testCaseModel = new Schema({
    patientID: String,
    patientName: String,
    testName: String,
    primaryTissue: String,
    avaliable: Boolean,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('test_cases', testCaseModel);
