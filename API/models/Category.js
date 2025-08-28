const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    }
    }, {
        tableName: 'categories',    // 确保模型名称与数据库表名匹配
        timestamps: false           // 设定 categories 表是否有 created_at/updated_at
    });

    Category.associate = function(models) {
    // 一个分类可以包含多个商品 (多对多关系)
    // through: 'commodity_categories' 指定了联结表的名称
    // foreignKey: 'categoryId' 是 Category 在联结表中的外键
    // otherKey: 'commodityId' 是 Commodity 在联结表中的外键
    // as: 'commodities' 是在 Category 模型中查询关联商品时使用的(JSON)别名
    Category.belongsToMany(models.Commodity, {
        through: 'commodity_categories',
        foreignKey: 'category_id',          // 数据库中联结表的列名
        otherKey: 'commodity_id',           // 数据库中联结表的另一列名
        as: 'commodities',
        timestamps: false // <-- 修复: 明确禁用联结表的时间戳
    });
};

module.exports = Category;