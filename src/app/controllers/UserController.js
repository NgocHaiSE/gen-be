const accountModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
secretKey = process.env.SECRET_KEY;

class userController {
    login = async (req, res) => {
        try {
            const userBody = req.body;
            const user = await accountModel.findOne({
                email: String(userBody.username),
            });

            const hashedPassword = await bcrypt.hash(userBody.password, 10);
            console.log(hashedPassword)

            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'User not found', status: 'error' });
            }

            const isPasswordValid = await bcrypt.compare(
                userBody.password,
                user.password,
            );


            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid password' });
            }

            const token = jwt.sign({ id: user._id }, secretKey, {
                expiresIn: '1h',
            });
            const signStatus = {
                status: 'ok',
                type: 'account',
                currentAuthority: user.access,
            };

            res.json({ token, signStatus });
            console.log(signStatus);
            console.log(token);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred' });
        }
    };

    register = async (req, res) => {
        try {
            const userBody = req.body;

            // Check if the email already exists in the database
            const existingUser = await accountModel.findOne({
                email: userBody.email,
            });
            if (existingUser) {
                return res
                    .status(409)
                    .json({ message: 'Email already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(userBody.password, 10);

            // Create a new user object with hashed password
            const newUser = new accountModel({
                email: userBody.email,
                password: hashedPassword,
                access: userBody.access,
                name: userBody.name,
                phone: userBody.phone,
                avatar: userBody.avatar,
                address: userBody.address,
            });

            // Save the new user to the database
            const savedUser = await newUser.save();

            res.status(201).json({
                message: 'User registered successfully',
                user: savedUser,
            });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({
                error: 'Failed to register user',
                status: 'error',
            });
        }
    };

    findUser = async (req, res) => {
        try {
            const userBody = req.body;
            console.log(userBody);
            const user = await accountModel.findOne({
                email: String(userBody.username),
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({
                name: user.name,
                access: user.access,
                avatar: user.avatar,
                userid: user._id,
                phone: user.phone,
                email: user.email,
                address: user.address,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred' });
        }
    };

    getAllUser(req, res) {
        accountModel.find({}, function (err, accountModel) {
            if (!err) {
                res.json(accountModel);
            } else {
                res.status(500).json({ error: 'Error!!!' });
            }
        });
    }

    findUserByToken = async (req, res) => {
        try {
            const token = req.body;
            const decodedToken = jwt.verify(token.token, secretKey);
            const user = await accountModel.findOne({
                _id: String(decodedToken.id),
            });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json({
                name: user.name,
                access: user.access,
                avatar: user.avatar,
                userid: user._id,
                phone: user.phone,
                email: user.email,
                address: user.address,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred' });
        }
    };

    updateUser = async (req, res) => {
        const userBody = req.body;
        console.log(userBody.password);
        const user = await accountModel.findOne({
            email: String(userBody.email),
        });
        let newPassword;
        if (userBody.password != undefined || userBody.password == '') {
            newPassword = await bcrypt.hash(userBody.password, 10);
        } else {
            newPassword = user.password;
        }

        const updatedUserInfor = {
            email: String(userBody?.email),
            password: newPassword,
            name: String(userBody?.name),
            access: String(userBody?.access),
        };

        // Xác thực JWT
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.log('false');
            return res.sendStatus(401);
        }

        jwt.verify(token, 'secret', (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            accountModel
                .findOneAndUpdate({ email: userBody.email }, updatedUserInfor, {
                    new: true,
                })
                .then((user) => {
                    if (user) {
                        console.log('Updated User in the database:', user);
                        res.status(200).json({
                            message: 'User updated successfully',
                            user,
                        });
                    } else {
                        console.log('User not found');
                        res.status(404).json({ error: 'User not found' });
                    }
                })
                .catch((err) => {
                    console.error('Error updating User in the database:', err);
                    res.status(500).json({
                        error: 'Failed to update User',
                    });
                });
        });
    };

    delete(req, res, next) {
        accountModel
            .deleteOne({ _id: req.params.id })
            .then(() => res.redirect('back'))
            .catch(next);
    }
}

module.exports = new userController();
