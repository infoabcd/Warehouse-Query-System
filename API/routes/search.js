const express = require('express');
const router = express.Router();

const db = require('../models');
const { Commodity, Category } = db;
const { Op } = require('sequelize');
const log = require('../lib/logger').createLogger('search');

const LIST_ATTRS = [
    'id',
    'title',
    'description',
    'price',
    'promotion_price',
    'is_on_promotion',
    'discount_amount',
    'stock',
    'image_url',
    'barcode',
];

// GET 统一搜索：标题模糊匹配 或 条形码精确匹配（须放在 /:key 之前）
router.get('/q', async (req, res) => {
    try {
        const raw = req.query.q;
        const q = typeof raw === 'string' ? raw.trim() : '';
        if (!q) {
            return res.status(400).json({ message: '请提供查询参数 q' });
        }

        const page = req.query.page && !isNaN(req.query.page) && parseInt(req.query.page, 10) > 0
            ? parseInt(req.query.page, 10)
            : 1;
        const limit = req.query.limit && !isNaN(req.query.limit) && parseInt(req.query.limit, 10) > 0
            ? parseInt(req.query.limit, 10)
            : 15;
        const offset = (page - 1) * limit;

        const Commodities = await Commodity.findAndCountAll({
            attributes: LIST_ATTRS,
            distinct: true,
            limit,
            offset,
            include: [{
                model: Category,
                as: 'categories',
                through: { attributes: [] },
            }],
            where: {
                [Op.or]: [
                    { barcode: q },
                    { title: { [Op.like]: `%${q}%` } },
                ],
            },
        });

        if (Commodities.count === 0) {
            return res.status(200).json({ message: '未找到对应的商品.' });
        }

        return res.status(200).json(Commodities);
    } catch (error) {
        log.error('统一搜索失败', error.message);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

// GET 搜索功能路由(Title)
router.get('/title/t', async (req, res) => {
    try {
        const title = req.query.title;
        const page = req.query.page && !isNaN(req.query.page) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = req.query.limit && !isNaN(req.query.limit) && parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 15;
        const offset = (page - 1) * limit;

        const Commodities = await Commodity.findAndCountAll({
            attributes: LIST_ATTRS,
            distinct: true,
            limit,
            offset,
            include: [{
                model: Category,
                as: 'categories',
                through: { attributes: [] },
            }],
            where: {
                title: {
                    [Op.like]: `%${title}%`,
                },
            },
        });

        if (title == null || Commodities.count === 0) {
            return res.status(200).json({ message: '未找到对应的商品.' });
        }

        return res.status(200).json(Commodities);
    } catch (error) {
        log.error('标题搜索失败', error.message);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

// GET 分类功能
router.get('/assort/:key', async (req, res) => {
    try {
        const role = req.user?.role;
        const key = req.params.key;
        if (key == null) {
            return res.status(200).json({ message: '未找到分类.' });
        }

        const page = req.query.page && !isNaN(req.query.page) && parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = req.query.limit && !isNaN(req.query.limit) && parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 15;
        const offset = (page - 1) * limit;

        const totalCommodities = await Commodity.count({
            distinct: true,
            include: [{
                model: Category,
                as: 'categories',
                where: { id: key },
                through: { attributes: [] },
            }],
        });

        if (!role) {
            const Commodities = await Commodity.findAll({
                attributes: LIST_ATTRS.filter((a) => a !== 'barcode'),
                limit,
                offset,
                include: [{
                    model: Category,
                    as: 'categories',
                    where: { id: key },
                    through: { attributes: [] },
                }],
            });

            const totalPages = Math.ceil(totalCommodities / limit);

            return res.status(200).json({
                Page: page,
                totalCommodities,
                rows: Commodities,
                totalPages,
            });
        }

        const Commodities = await Commodity.findAll({
            limit,
            offset,
            include: [{
                model: Category,
                as: 'categories',
                where: { id: key },
                through: { attributes: [] },
            }],
        });

        const totalPages = Math.ceil(totalCommodities / limit);

        return res.status(200).json({
            Page: page,
            totalCommodities,
            searchData: Commodities,
            totalPages,
        });
    } catch (error) {
        log.error('分类列表失败', error.message);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

// GET 按主键查单条（放在最后，避免拦截 /q、/title/t 等）
router.get('/:key', async (req, res) => {
    try {
        const key = req.params.key;
        const role = req.user?.role;

        if (!role) {
            const searchData = await Commodity.findByPk(key, {
                attributes: [
                    'id',
                    'title',
                    'description',
                    'price',
                    'promotion_price',
                    'is_on_promotion',
                    'discount_amount',
                    'stock',
                    'image_url',
                ],
                distinct: true,
                include: [{
                    model: Category,
                    as: 'categories',
                    through: { attributes: ['commodity_id'] },
                }],
            });
            return res.status(200).json(searchData);
        }

        const searchData = await Commodity.findByPk(key, {
            distinct: true,
            include: [{
                model: Category,
                as: 'categories',
                through: { attributes: ['commodity_id'] },
            }],
        });
        return res.status(200).json(searchData);
    } catch (error) {
        log.error('按 ID 搜索失败', error.message);
        res.status(500).json({ message: '服务器内部错误.' });
    }
});

module.exports = router;
