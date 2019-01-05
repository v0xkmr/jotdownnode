const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
        res.status(401).send('Access denied.');
        return;
    }
    try {
        const decoded = jwt.verify(token, 'jwtsecret');
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).send('Invalid token.');
    }
}

module.exports = auth;