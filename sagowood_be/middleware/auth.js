const jwt = require('jsonwebtoken');
const User = require('../models/userSchema'); // Ensure this path is correct

const authenticate = async (req, res, next) => {
    try {
        const { authorization = '' } = req.headers;
        const [bearer, token] = authorization.split(' ');

        if (bearer !== 'Bearer' || !token) {
            return res.status(401).send('Invalid Token');
        }

        const verifyToken = jwt.verify(token, 'THIS_IS_THE_SECRET_KEY_OF_JWT');
        const user = await User.findById(verifyToken.id);

        if (!user) {
            return res.status(401).send('User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error in authentication:', error);
        res.status(500).send(error.message);
    }
};

module.exports = authenticate;
