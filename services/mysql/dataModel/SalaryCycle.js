var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('SalaryCycle', {
        salaryCycle: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        status: {
            type: Sequelize.STRING,
        }
    })
}
