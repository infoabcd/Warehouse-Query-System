const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {                         // true(1) 为管理员
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    }, {
        tableName: 'users',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = User;