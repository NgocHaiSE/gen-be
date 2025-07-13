const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountModel = new Schema({
    email: { type: String, require: true },
    password: { type: String, require: true },
    name: String,
    access: String,
    phone: String,
    avatar: String,
    address: String,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('account_informations', accountModel);
