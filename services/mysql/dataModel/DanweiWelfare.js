var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('danweiwelfares', {
        welfareName: {
            type: Sequelize.STRING,
        },
        salaryCycle: {
            type: Sequelize.STRING,
        },
        Shitangjingfei: {
            type: Sequelize.STRING,
        },
        CompanyQitafuli: {
            type: Sequelize.STRING,
        }
    })
}
