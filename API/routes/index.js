const express = require('express');
const router = express.Router();

const { checkLogin } = require('../middleware/verify');      // 验证是否登陆

const db = require('../models');
const { Commodity, Category } = db;

// 已经全局使用中间件来判断是否登入，role为true则是管理员
// 我们据此决定检索数据库后返回的数据字段是怎么样的，如果是管理员，就返回商品更加详细的数据，如进货价

// GET 主页路由
router.get('/', checkLogin, async(req, res) => {
    // checkLogin 判断是否登陆，方便管理员后台列出所有商品
    
    try {
        // 从全局中间件里获得数据，中间件已经将数据赋予给了 req.user
        // 不加 "?" 会报错，因为假如未登陆，中间件就不会成功赋值给 req.user
        // 那么 req.user.role 也就理所当然不存在，undefined 赋值会导致代码报错
        const role = req.user?.role;

        // const { limit = 15, offset = 0 } = req.query;           // 分页功能 - 记得使用默认值，防止参数缺失报错。
        // console.log(typeof(limit))  // limit 类型需要是 number，但是 req.query 赋值到的是 string，从而导致了错误。

        // 方案 1
        // const limit = parseInt(req.query.limit, 10) || 15;         // 接受 req.query 的 limit，10位 "str"，转换为 int。没有接收到就默认 15
        // const offset = parseInt(req.query.offset, 10) || 0;        // 接受 req.query 的 offset，10位 "str"，转换为 int。没有接收到就默认 0

        // 方案 2 - 带计算
        const page = req.query.page && !isNaN(req.query.page) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = req.query.limit && !isNaN(req.query.limit) && parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 15;
        const offset = ( page - 1 ) * limit;

        if (!role) {
            // const products = await Commodity.findAll();          // 查询这个表的所有数据，但没设置分页功能
            const products = await Commodity.findAndCountAll({
                // 决定输出的字段，默认全部输出。返回id是为了让前端可以 key=id
                attributes: [
                    'id',
                    'title',
                    'description',
                    'price',
                    'promotion_price',
                    'is_on_promotion',
                    'discount_amount',
                    'stock',
                    'image_url'
                ],

                // 修正 findAndCountAll 的 count 行为，否则可能会计算结联表数据，那么统计出来的数据将会不精准。
                // 比如说 结联表 数据是 商品ID-对应-分区ID。而一个商品可能有多个分区ID，那么可能就有三四行数据，这些数据会被统计，之后使得 count 不精准
                distinct: true,
                // col 并非必须，但它明确告诉 Sequelize，要去重计数的列是 Commodity 表的 ID
                // 但它在以下两种情况下是强烈推荐和几乎必要的：1.使用了 include 联结查询时.   2.需要确保计数结果绝对精准时.
                // col: 'Commodity.id',

                // 一般 limit 和 offset 都是从 req.query(URL../?limit=15&offset=0) 里获取，而不是 req.params，每个页面标签就 +15，从而实现分页功能。
                // req.query 能够让我们以 `?limit=15&offset=0` 这样的形式在 URL 中传递参数。
                // 或者想要固定，不要用户修改一次返回内容的多少，可以直接写死 limit，只接受 offset 。
                limit: limit,                                          // 一次展示多少条数据
                offset: offset,                                        // 从第几条开始展示
                
                include: [{
                    model: Category,
                    as: 'categories',

                    // through 选项是可选的，意在联结表中选取属性展示。如果你不添加 through 选项，Sequelize 会默认不返回联结表中的任何字段，这也是最常见的做法。
                    // 既然是可选的，那么为什么没有 through 会报错？:Error: Unknown column 'categories->commodity_categories.createdAt' in 'SELECT'
                    // 这是因为默认行为去查询了联结表内不存在的 createdAt 字段，所以就需要 through 选项才不会报错，也可以直接 through: { attributes: [] }
                    // 更加具体的解释：Commodity 和 Category 模型默认启用了 timestamps: true（即包含 createdAt 和 updatedAt 字段）。
                    // 所以当我们进行多对多联结查询时，Sequelize 会自动假设联结表 commodity_categories 也应该有这些时间戳字段。
                    // through: { attributes: [] } 之所以能解决问题，是因为它强制 Sequelize 忽略所有联结表字段，从而避开了那个不存在的 createdAt 字段。
                    //
                    // 下面我们需要通过 through 选项来指定要返回的联结表字段，用作之后 前端的逻辑判断。
                    // 我们在 Commodity 里面定义了 commodity_id 和 category_id，所以 attributes 只能从中选择，或者「全部」attributes: ['commodity_id', 'category_id']。
                    //
                    // models/Commodity.js
                    // Commodity.belongsToMany(models.Category, {
                    //     through: 'commodity_categories',
                    //     foreignKey: 'commodity_id',         // 数据库中联结表的列名
                    //     otherKey: 'category_id',            // 数据库中联结表的另一列名
                    //     as: 'categories'
                    // });
                    through: {
                        attributes: ['commodity_id']           // 只返回 commodity_id 这个属性
                    }

                    // through 去掉会报错，因为即便省略了 through 选项，Sequelize 依然会默认尝试查询这些字段，认为它们是联结表的一部分。
                    // 当使用 belongsToMany 建立多对多关系时，Sequelize 会自动在联结表上添加 createdAt 和 updatedAt 这两个时间戳字段。
                    // 有两个解决方案： 1.修改 Sequelize 模型，禁用联结表的时间戳。      2.修改数据库表结构，添加时间戳
                    // 
                    // models/Commodity.js
                    // Commodity.belongsToMany(models.Category, {
                    //     through: {
                    //         model: 'commodity_categories',
                    //         timestamps: false              // 显式禁用联结表的时间戳
                    //     },
                    //     foreignKey: 'commodity_id',        // 数据库中联结表的列名
                    //     otherKey: 'category_id',           // 数据库中联结表的另一列名
                    //     as: 'categories'
                    // });
                }]
            });
            return res.status(200).json(products);          // return 结束返回，防止代码继续执行
        } else {
            const products = await Commodity.findAndCountAll({
                // 在models/Commodity.js里的belongsToMany作了修改(修复)
                distinct: true,
                limit: limit,
                offset: offset,
                
                include: [{
                    model: Category,
                    as: 'categories',
                }]
            })
            return res.status(200).json(products);
        }
    } catch(error) {
        console.error('获取商品列表失败：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

// GET 详细商品路由
router.get('/products/:id', checkLogin, async(req, res) => {
    try {
        const id = req.params.id;
        const role = req.user?.role;
        
        if (!role) {
            const productsData = await Commodity.findByPk(id, {     // findByPk 提供从 主键 中查询，所以提供 主键ID 就行。
                attributes: [
                    'id',
                    'title',
                    'description',
                    'price',
                    'promotion_price',
                    'is_on_promotion',
                    'discount_amount',
                    'stock',
                    'image_url'
                ],
                include: [{
                    model: Category,
                    as: 'categories',
                    through: {
                        attributes: ['commodity_id']
                    }
                }]
            })
            if (productsData == null) {
                return res.status(200).json( {message: '没有找到对应的商品.' })
            } else {
                return res.status(200).json(productsData)
            };
        } else {
            const productsData = await Commodity.findByPk(id, {
                include: [{
                    model: Category,
                    as: 'categories',
                    through: {
                        attributes: ['commodity_id']
                    }
                }]
            })
            if (productsData == null) {
                return res.status(200).json( {message: '没有找到对应的商品.' })
            } else {
                return res.status(200).json(productsData)
            };
        }
    } catch(error) {
        console.log('获取具体商品信息失败：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

// 导出路由器实例，以便在主应用文件 (app.js) 中使用
module.exports = router;