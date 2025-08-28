const express = require('express');
const router = express.Router();

const db = require('../models');
const { Commodity, Category } = db;

// 已经全局使用中间件来判断是否登入，role为true则是管理员
// 我们据此决定检索数据库后返回的数据字段是怎么样的，如果是管理员，就返回商品更加详细的数据，如进货价

// GET 搜索功能路由
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

// GET 分类功能
router.get('/assort/:key', async(req, res) => {
    try {
        const role = req.user?.role;

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