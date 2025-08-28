const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');                       // 密码加密用

const { generateToken } = require('../auth/jwt');       // 生成 Token
const { verifyAdmin, checkLogin } = require('../middleware/verify');      // 验证登陆 Token(管理员) | 验证是否登陆

const db = require('../models');
const { User, Commodity, Category, sequelize } = db;

// GET 判断路由
router.get('/login', checkLogin, async(req, res) => {
    // 因为我们使用 res.cookie 的方法让浏览器托管cookie，并且设置了js无法访问cookie的参数
    // 所以是否已经登陆，就只能抛由 checkLogin 中间件来判断，并告诉前端是否已经登陆了
    // 于是，我们再写一个路由 GET /login
    if (!req.user) {
        console.log('用户未登陆');
        return res.status(403).json({ message: '用户未登陆' });
    }
    if (req.user) {
        console.log('欢迎回来');
        return res.status(200).json({ message: '欢迎回来' });
    }
});

// POST 登陆路由
router.post('/login', checkLogin, async(req, res) => {
    try {
        // 由于是 POST，所以从body里面取得变量
        const username = req.body.username;
        const password = req.body.password;

        // const salt = await bcrypt.genSalt(10);                      // 生成盐
        // const encryptPasswd = await bcrypt.hash(password, salt);    // 加密密码
        // 加盐就是为了即便输入的是正确密码，但是每次加密出来的内容都不相同
        // 如果不相同，那么比对不就是错误的吗？
        // 并非如此，如果两个哈希值完全一致，bcrypt.compare() 就会返回 true，表示密码正确。
        // 通过这种机制，bcrypt 既保证了安全性(因为无法通过反向计算来得到原始密码)，又实现了准确的密码比对。

        const userQuery = await User.findOne({
            // 先定位到用户。密码通过加密储存，所以必须先取出来，之后外部进行匹配。,
            where: {
                username: username
            },
        });
        
        // 查询是否存在这个用户
        if (userQuery == null) {
            return res.status(403).json({ message: '输入的账号或密码有误，请重试' });
        }
        
        // 判断密码是否数据库的密码一样
        // if (bcrypt.compare(password, userQuery.password)) { ... } 是异步操作
        // 如果没有 await 的话，if 判断就不会生效。所以先在外面赋值完，再放入 if 判断。
        const passwordIsValid = await bcrypt.compare(password, userQuery.password);
        if (!passwordIsValid) {
            return res.status(403).json({ message: '输入的账号或密码有误，请重试' });
        }

        // 发送 payload 给 generateToken 来生成 Token
        const token = generateToken({
            id: userQuery.id,
            username: userQuery.username,
            role: userQuery.role
        })

        // 返回 Cookie 到前端
        res.cookie('authToken', token, {
            // expires 设置过期时间
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),        // 24小时后过期
            // httpOnly: true 可以防止客户端脚本（如 XSS 攻击）访问这个 Cookie。前端有写明白。
            httpOnly: true,
            // secure: true 只在 HTTPS 协议下发送 Cookie
            // secure: process.env.NODE_ENV === 'production'
            secure: false
        });
        // 返回 200 给前端
        res.status(200).json({ 
            message: '登陆成功'
        });
    } catch (error) {
        console.error('登陆出现出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    };
});

// POST 创建商品路由
router.post('/create', verifyAdmin, async(req, res) => {
    // sequelize 使用 db 里面定义导出的 db.sequelize
    // 使用 sequelize事务 来确保数据一致性，为了操作分类做准备
    const t = await sequelize.transaction();
    try {
        const {
            title,                      // 标题
            description,                // 商品介绍
            price,                      // 售价
            original_price,             // 进货价
            promotion_price,            // 折扣价
            is_on_promotion,            // 是否折扣
            discount_amount,            // 折扣多少钱
            stock,                      // 库存
            imagePath,                  // 图片名
            categories                  // 新增：从前端获取的分类 ID 数组
        } = req.body;

        // 检查必要字段和分类字段。(目前的逻辑是分类是必须的)
        if (!title || !price || !original_price || !stock || !categories || !Array.isArray(categories)) {
            await t.rollback();
            return res.status(400).json({ message: '缺少必要的商品信息或分类信息.' });
        }

        // 1. 创建新商品
        const newCommodity = await Commodity.create({
            title: title,
            description: description || null,
            price: price,
            original_price: original_price,
            promotion_price: is_on_promotion ? promotion_price : null,
            is_on_promotion: is_on_promotion,
            discount_amount: discount_amount || null,
            stock: stock,
            image_url: imagePath
        }, { transaction: t });

        // 2. 将商品与分类关联
        // 查找所有对应的分类
        const foundCategories = await Category.findAll({
            where: {
                id: categories
            },
            transaction: t
        });

        // 将新商品与找到的分类使用 setCategories方法 进行关联
        await newCommodity.setCategories(foundCategories, { transaction: t });

        // 提交事务
        await t.commit();

        // 返回成功响应
        res.status(201).json({
            message: '商品创建成功！',
            commodity: newCommodity
        });

    } catch (error) {
        // 如果出现错误，回滚事务
        await t.rollback();
        console.error('创建商品出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    };
});

// DELETE 删除商品路由
router.delete('/delete/:id', verifyAdmin, async(req, res) => {
    try {
        const commodityId = req.params.id;
        // 看看这个 id 对应的商品是否存在
        const commodity = await Commodity.findByPk(commodityId);
        
        if (!commodity) {
            res.status(404).json({ message: '你想要删除的商品不存在.' });
        }

        // 走到这条代码，证明查到 id 对应的商品(商品存在)，直接使用 sequelize 提供的 destroy 方法去删除数据。
        await commodity.destroy();
        res.status(200).json({ message: '商品删除成功！' });
    } catch (error) {
        console.error('删除商品出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    };
});

// 新增 PUT 更新商品路由
router.put('/update/:id', verifyAdmin, async(req, res) => {
    // sequelize 使用 db 里面定义导出的 db.sequelize
    // 使用 sequelize事务 来确保数据一致性，为了操作分类做准备
    const t = await sequelize.transaction();
    try {
        const commodityId = req.params.id;
        const {
            title,
            description,
            price,
            original_price,
            promotion_price,
            is_on_promotion,
            discount_amount,
            stock,
            imagePath,
            categories              // 新增：从前端获取的分类 ID 数组
        } = req.body;

        // 检查必要字段和分类字段。(目前的逻辑是分类是必须的)
        if (!title || !price || !original_price || !stock || !categories || !Array.isArray(categories)) {
            await t.rollback();
            return res.status(400).json({ message: '缺少必要的商品信息或分类信息.' });
        }

        // 1. 找到要更新的商品
        const commodity = await Commodity.findByPk(commodityId, { transaction: t });

        if (!commodity) {
            await t.rollback();
            return res.status(404).json({ message: '要更新的商品不存在.' });
        }

        // 2. 更新商品数据
        await commodity.update({
            title,                                                              // 标题
            description: description || null,                                   // 商品介绍
            price,                                                              // 售价
            original_price,                                                     // 进货价
            promotion_price: is_on_promotion ? promotion_price : null,          // 折扣价
            is_on_promotion,                                                    // 是否折扣
            discount_amount: is_on_promotion ? discount_amount : null,          // 折扣了多少钱
            stock,                                                              // 库存
            image_url: imagePath                                                // 图片名
        }, { transaction: t });

        // 3. 更新商品与分类的关联
        // 查找所有对应的分类
        const foundCategories = await Category.findAll({
            where: {
                id: categories
            },
            transaction: t
        });

        // 使用 setCategories 方法来更新关联，它会自动处理添加和移除
        await commodity.setCategories(foundCategories, { transaction: t });

        // 提交事务
        await t.commit();

        res.status(200).json({
            message: '商品更新成功！',
            commodity: commodity
        });
    } catch (error) {
        // 如果出现错误，回滚事务
        await t.rollback();
        console.error('更新商品出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});


// 复用 /search 路由的搜索，通过(全局中间件返回的)role判断是否为管理员，之后决定输出。下面不再需要。

// // GET 列出所有商品路由
// router.get('/commodity', verifyAdmin, async(req, res) => {
//     try {
//         const page = req.query.page && isNaN(req.query.page) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
//         const limit = req.query.limit && isNaN(req.query.limit) && parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 15;
//         const offset = (page - 1) * limit;
        
//         const commodityList = await Commodity.findAndCountAll({
//             distinct: true,
//             limit: limit,
//             offset: offset,
//             include: [{
//                 model: Category,
//                 as: 'categories',
//                 through: {
//                     attributes: ['commodity_id']
//                 }
//             }]
//         });
//         res.status(200).json(commodityList);
//     } catch (error) {
//         console.error('列出所有商品出现问题：', error);
//         res.status(500).json({ message: '服务器内部错误.' });
//     };
// });

module.exports = router;