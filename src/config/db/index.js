const mongoose = require('mongoose');
const URL = process.env.DATABASE;

const connect = async () => {
    try {
        await mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to mongoDB');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = { connect };
