const jwt = require('jsonwebtoken');
const accountModel = require('../../models/UserModel');
const secretKey = process.env.SECRET_KEY;

const authenticateToken = async (authHeader) => {
    try {
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            throw new Error('Token not found');
        }

        const decodedToken = jwt.verify(token, secretKey);
        const userData = await accountModel.findOne({
            _id: String(decodedToken.id),
        });

        if (!userData) {
            throw new Error('User not found');
        }

        if (userData.access === 'admin' || userData.access === 'doctor') {
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        throw new Error('Authentication failed');
    }
};

module.exports = authenticateToken;
