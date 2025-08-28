const jwt = require('jsonwebtoken');

// 密钥和过期时间
const JWT_SECRET = '70aiuqtehspiBcxp';
const JWT_EXPIRES_IN = '4h';

// 生成 JWT
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// 验证 JWT
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch(error) {
        throw new Error('Invalid or expired token');
    };
};

module.exports = { generateToken, verifyToken };