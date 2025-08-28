const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Commodity = sequelize.define('Commodity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {                                    // 出售价格
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    original_price: {                           // 进货价格
        type: DataTypes.DECIMAL(10, 2)
    },
    promotion_price: {                          // 促销价格
        type: DataTypes.DECIMAL(10, 2)
    },
    is_on_promotion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    image_url: {
        type: DataTypes.STRING(255)
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
    }, {
    tableName: 'commodities',       // 确保模型名称与数据库表名匹配
    // timestamps: true             // 默认行为
    // 由于 SQL 脚本中 timestamp 列名是 created_at 和 updated_at，
    // Sequelize 会自动识别。如果不是默认名，可以这样配置：
    createdAt: 'created_at',
    updatedAt: 'updated_at'
    });

    Commodity.associate = function(models) {
    // 一个商品可以属于多个分类 (多对多关系)
    // through: 'commodity_categories' 指定了联结表的名称
    // foreignKey: 'commodityId' 是 Commodity 在联结表中的外键
    // otherKey: 'categoryId' 是 Category 在联结表中的外键
    // as: 'categories' 是在 Commodity 模型中查询关联分类时使用的(JSON)别名
    Commodity.belongsToMany(models.Category, {
        through: 'commodity_categories',
        foreignKey: 'commodity_id',         // 数据库中联结表的列名
        otherKey: 'category_id',            // 数据库中联结表的另一列名
        as: 'categories',
        timestamps: false // <-- 修复: 明确禁用联结表的时间戳
        // 上面的修复是因为后期发现了一个问题，在管理员页面查询所有文章报错
        // parent: Error: Unknown column 'categories->commodity_categories.createdAt' in 'SELECT'
        // 记得在 Category 的 belongsToMany 也增加这一行，否则报错仍旧继续
    });

    // 查询结果不返回 commodity_categories 的原因
    // 在 Sequelize 的多对多关系查询中，默认行为确实是不返回联结表 (commodity_categories) 本身的字段。
    // 我们查询的目的是获取商品及其关联的分类，而联结表的作用只是连接这两个模型，它的数据（commodity_id 和 category_id）通常不是我们最终需要的业务数据。
};

module.exports = Commodity;