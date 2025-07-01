const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dataSchema = new Schema({
    content: Object, // Trường chứa nội dung của file JSON
});

module.exports = mongoose.model('DataResultUpload', dataSchema);
