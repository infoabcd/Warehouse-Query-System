const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 模型文件
const Category = require('./Category');
const Commodity = require('./Commodity');
const User = require('./User');

// 创建一个 db 对象来存储所有模型，以便它们可以相互引用
const db = {};                  // 初始化一个空对象 db。这个 db 对象将成为所有的 Sequelize 模型和 sequelize 实例的中心容器。

db.sequelize = sequelize;       // 将数据库连接实例 sequelize 自身也添加到 db 对象中。这使得你可以在其他地方（如路由文件）通过 db.sequelize 访问它，进行数据库同步等操作。
db.Sequelize = Sequelize;       // 将 Sequelize 类本身也添加到 db 对象中。这对于在 associate 方法中可能需要引用 Sequelize 类的情况非常有用，尽管不常用，但保持了一致性。

db.Category = Category;
db.Commodity = Commodity;

// 遍历 db 对象中的所有模型，并调用它们的 associate 方法
// 确保所有模型都已加载到 db 对象中，然后才能调用 associate
Object.keys(db).forEach(modelName => {          // 建立模型之间关系的核心逻辑
  // Object.keys(db) 返回 db 对象中所有属性的键名数组（例如 ['sequelize', 'Sequelize', 'Category', 'Commodity']）。
  // forEach 循环遍历这些键名。
  if (db[modelName].associate) {
    // 对于每个键名，它首先检查 db[modelName]（即对应的模型实例）是否有一个名为 associate 的方法。
    // 只有 Sequelize 模型（如 Category 和 Commodity）会定义这个方法，而 sequelize 和 Sequelize 属性则没有。
    // 这个条件判断确保我们只对模型对象执行关联操作。

    db[modelName].associate(db);        // 将整个 db 对象作为参数传入，让模型可以引用其他模型
    // 如果模型定义了 associate 方法，就调用它。
    // 最重要的是，它将整个 db 对象作为参数传递给 associate 方法。
    // 为什么这样做？ 因为模型之间的关系定义（如 belongsToMany(models.Commodity)）需要引用其他模型。
    // 通过将包含所有模型的 db 对象传递进去，Category 模型在它的 associate 方法中就可以通过 models.Commodity 来访问 Commodity 模型，反之亦然。
    // 从而正确地建立多对多关系。这种模式有效地解决了模型之间可能存在的循环依赖问题。
  }
});

// 用户路由
db.User = User;

module.exports = db;