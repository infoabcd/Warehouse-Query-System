const express = require('express');
const router = express.Router();

const db = require('../models');
const { Commodity, Category } = db;

const { Op } = require('sequelize'); // 模糊匹配用(Operators)，记得sequelize和Sequelize有本质区别的

// 已经全局使用中间件来判断是否登入，role为true则是管理员
// 我们据此决定检索数据库后返回的数据字段是怎么样的，如果是管理员，就返回商品更加详细的数据，如进货价

// GET 搜索功能路由(ID)
router.get('/:key', async(req, res) => {
    try {
        const key = req.params.key;

        // 从全局中间件里获得数据，中间件已经将数据赋予给了 req.user
        // 不加 "?" 会报错，因为假如未登陆，中间件就不会成功赋值给 req.user
        // 那么 req.user.role 也就理所当然不存在，undefined 赋值会导致代码报错
        const role = req.user?.role;
        if (!role) {
            const searchData = await Commodity.findByPk(key, {
                attributes: [               // 限制返回的字段，默认全部输出
                    'id',                   // 返回id是为了让前端可以 key=id
                    'title',
                    'description',
                    'price',
                    'promotion_price',
                    'is_on_promotion',
                    'discount_amount',
                    'stock',
                    'image_url'
                ],
                distinct: true,
                include: [{
                    model: Category,
                    as: 'categories',
                    through: {
                        attributes: ['commodity_id']
                    }
                }]
            })
            return res.status(200).json(searchData);        // return 返回结束，避免代码继续执行
        } else {
            const searchData = await Commodity.findByPk(key, {
                distinct: true,
                include: [{
                    model: Category,
                    as: 'categories',
                    through: {
                        attributes: ['commodity_id']
                    }
                }]
            })
            return res.status(200).json(searchData);
        }
    } catch(error) {
        console.error('搜索商品的Key出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

// GET 搜索功能路由(Title) - v1.0.2增加
// router.get('/title', async(req, res) => {
router.get('/title/t', async(req, res) => {
    // /title/:title 这种方式在搜索功能中是很怪的代码实践，所以我们使用query，也就是 ==>> /title?title=xxx
    // 路由的顺序其实很重要，上面的路由 /:key，而此处是/title，/title?title=xxx会命中到 /:key 的路由
    // 但是由于这是个学习项目，我们保留这种顺序错误，并提供一个解决方法，也就是/title后面增加一个/t
    // 此时，路由就变成了 http://localhost:3000/search/title/t?title=xxx   成功匹配上
    try {
        const title = req.query.title;

        // 我们采用模糊匹配可以最大程度匹配到商品
        // 所以即便在整体数据不多的情况下，也可能命中很多数据
        // 所以我们依旧需要制作一个分页功能
        // 分页功能 query ====>>> ?title=xx&page=xx&limit=xx
        const page = req.query.page && !isNaN(req.query.page) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = req.query.limit && !isNaN(req.query.limit) && parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 15;
        const offset = ( page - 1 ) * limit;

        const Commodities = await Commodity.findAndCountAll({
            attributes: [           // 不管你是否是管理员了，搜索直接返回有限数据吧。(v1.0.2)
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
            distinct: true,
            limit: limit,
            offset: offset,

            include: [{
                model: Category,
                as: 'categories',
            }],

            // 模糊匹配 title字段内包含title变量的数据
            // 如果 % 只有一个，并在后面，就是匹配以title变量开头的数据。(通配符)
            where: {
                title: {
                    [Op.like]: `%${title}%`
                }
            }
        })

        if (title == null || Commodities.count == 0) {
            // 记得使用 return 来返回 res.status
            // res.status(200).json({ message: '未找到对应的商品.' });
            // 判断成立，上面代码执行完，因为没有 return 依旧会继续执行下去，直到下面的 return
            // 之后报错 - Cannot set headers after they are sent to the client
            return res.status(200).json({ message: '未找到对应的商品.' });
        }

        return res.status(200).json(Commodities);

    } catch (error) {
        console.error('搜索商品标题时出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    }
})

// GET 分类功能
router.get('/assort/:key', async(req, res) => {
    try {
        // 这个是开头实用全局中间件鉴权的时候使用的，但是发现除了商品详细页，其他根本不需要输出那么详细
        // 而输出依靠着role来决定。如今，全局中间件已经在app.js取消，但是下面这个代码依旧保留下来了
        // 下面role与其判断对代码运行没有实质性的影响，也不想随意地改动了
        const role = req.user?.role;    // 在 v1.0.1 弃用

        // 分类功能 params
        const key = req.params.key;
        if (key == null) {
            res.status(200).json({ message: '未找到分类.' });
        };
        
        // 分页功能 query
        const page = req.query.page && !isNaN(req.query.page) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = req.query.limit && !isNaN(req.query.limit) && parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 15;
        const offset = ( page - 1 ) * limit;

        // const searchData = await Category.findAndCountAll({      // 无论如何，count 就是不对，这是一个 Sequelize 的局限，但我们可以通过其他方式解决。
        //     distinct: true,
        //     // where: {                                  // rows 返回了所有数据，但是 count依旧是 1。因为 rows(.name) 里面是分类，数据在 rows.commodities[]
        //     //     id: key
        //     // },
        //     include: [{
        //         model: Commodity,
        //         as: 'commodities',
        //         through: {                                // 想要 where category_id 的话 where 就得放在 include-through 块里面，因为 category_id 属于结联表的字段(列)，category和commodity里面都没有这个字段。
        //             attributes: ['commodity_id'],         // 只返回 commodity_id 这个属性就好
        //             // where: {                           // 但是 —— 在这里的 where 有问题，findAndCountAll返回了所有数据
        //             //     category_id: key               // 不过由于 where 限制，只能在 where 处出现数据，count 就统计了 Category(categories) 表的数据，故无论如何都是错误的 7. 
        //             // },
        //             // limit: limit,           // 将分页参数应用于关联模型
        //             // offset: offset,
        //         },
        //     }]
        // })
        // res.status(200).json(searchData);

        // 解决方法：使用两次查询来解决
        // 解决思路：分页功能，无非就是limit和offset，但是我们使用findAndCountAll方法，它是会自动统计并返回count的。
        // 而如今，我们count怎么返回都不准确，我们就难以依靠这个count来计算，计算到底多少页才对 page = count / limit。
        // 所以，我们就把步骤分为，1.先计算出这个表有多少条数据。2.正常使用limit和offset，但是配合findAll方法查询。
        // 之后我们就得出了 Count 和 SearchData，之后整合，发给前端，前端就可以依照 Count 去计算页数了。也就是：page = count /limit。
        // 
        // 1.查询该分类(key)下，商品的总数
        const totalCommodities = await Commodity.count({
            distinct: true,
            include: [{
                model: Category,
                as: 'categories',
                where: {
                    id: key
                },
                through: { attributes: [] }
            }]
        });

        // 2.查询分页后的商品列表
        if (!role) {
            const Commodities = await Commodity.findAll({
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
                limit: limit,
                offset: offset,
                include: [{
                    model: Category,
                    as: 'categories',
                    where: {
                        id: key
                    },
                    through: { attributes: [] }
                }]
            });

            // 计算总页数 - Math.ceil() 用于将一个数字向上取整到最接近的整数
            const totalPages = Math.ceil(totalCommodities / limit);

            // 我们希望数据更加详细可观，容易挂载
            // res.status(200).json(totalPages);
            // 所以
            // return res.status(200).json({
            //     Page: page,
            //     totalCommodities: totalCommodities,
            //     searchData: Commodities,
            //     totalPages: totalPages,
            // })  写前端时候发现了问题，jsx不好写逻辑，获取 / (所有数据)时，数据返回在rows，而如今，却在searchData。于是出现获取 / 就报错。
            //      或者设置了 rows，之后获取分区就报错

            return res.status(200).json({
                Page: page,
                totalCommodities: totalCommodities,
                rows: Commodities,                      // 我们直接在这里统一一下写法
                totalPages: totalPages,
            });
        } else {
            const Commodities = await Commodity.findAll({
                limit: limit,
                offset: offset,
                include: [{
                    model: Category,
                    as: 'categories',
                    where: {
                        id: key
                    },
                    through: { attributes: [] }
                }]
            });

            // 计算总页数
            const totalPages = Math.ceil(totalCommodities / limit);

            return res.status(200).json({
                Page: page,
                totalCommodities: totalCommodities,
                searchData: Commodities,
                totalPages: totalPages,
            })
        }
        
    } catch(error) {
        console.error('搜索商品的分区出现问题：', error);
        res.status(500).json({ message: '服务器内部错误.' });
    };
});

// 特价功能 通过返回的 布尔值，在前端渲染，通过更新状态来只显示特价商品

module.exports = router;
