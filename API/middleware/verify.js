const { verifyToken } = require('../auth/jwt');

const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : req.cookies?.authToken;

    if (!token) {
        console.warn('verifyAdmin: 未找到认证令牌。');          // 如果没有 Token，直接返回 404，不暴露是权限问题
        return res.status(404).send('Page Not Found');       // 或 res.status(404).json({ message: 'Page Not Found' });
    }

    try {
        const decoded = verifyToken(token);
        // 检查 token 中是否存在 role 字段，并且 role 必须为 true (1)
        // 这里的 decoded 由 登陆路由 传递Payload到generateToken 生成的，我指定了一个role的Payload。
        if (!decoded || !decoded.role) {                                                    // 这里的 role 对应 User 模型中的 role: DataTypes.BOOLEAN
            console.warn('verifyAdmin: 令牌无效或用户无管理员权限 (role: false)。', decoded);
            return res.status(404).send('Page Not Found');
        }

        // 如果验证通过且是管理员，将解码后的信息放入 req.user
        req.user = decoded;
        next();
    } catch (error) {
        // Token 验证失败 (如过期、篡改)
        console.error('verifyAdmin: Token 验证失败:', error.message);
        return res.status(404).send('Page Not Found');
    }
};

const checkLogin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : req.cookies?.authToken;

    // next() 前面有无 return 的区别和导致的问题。
    // 如果没有 return 的话，那么next()完毕后，代码依旧会继续执行
    // 会导致一些类似，"Headers already sent" 的错误，如果没有 Token，可能会执行到下面的错误捕捉：认证错误。
    // 而 return 使得代码，在此处(中间件)返回后，就不再执行下面内容。确保了函数在发送响应或传递控制权后立即停止。
    if (!token) {
        console.warn('未登陆');
        return next();
    }

    try {
        const decoded = verifyToken(token)
        if (!decoded || !decoded.role) {
            console.warn('不合法的token');
            return next();
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.log('认证错误:', error.message);
        next();
    }
};

module.exports = { verifyAdmin, checkLogin };