var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('UnicID', {
        configKey: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        unicID: {
            type: Sequelize.INTEGER
        }
    })
}
