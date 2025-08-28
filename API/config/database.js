const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('test', 'root', '123456', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');

    } catch(error) {
        console.error('数据库连接失败:', error);
    };
})();

module.exports = sequelize;
