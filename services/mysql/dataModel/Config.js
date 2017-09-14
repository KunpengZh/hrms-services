var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ConfigDoc', {
        configKey:{
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        configDoc: {
            type: Sequelize.TEXT
        }
    })
}
