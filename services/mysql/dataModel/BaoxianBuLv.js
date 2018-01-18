var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('BaoxianBulv', {
        empId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        department: {
            type: Sequelize.STRING,
        },
        jobRole: {
            type: Sequelize.STRING,
        },
        workerCategory: {
            type: Sequelize.STRING,
        },
        salaryCycle: {
            type: Sequelize.STRING,
        },
        nianjin: {
            type: Sequelize.STRING,
        },
        qiyeNianjin: {
            type: Sequelize.STRING,
        },
        yanglaobaoxian: {
            type: Sequelize.STRING,
        },
        qiyeYanglaobaoxian: {
            type: Sequelize.STRING,
        },
        shiyebaoxian: {
            type: Sequelize.STRING,
        },
        qiyeShiyebaoxian: {
            type: Sequelize.STRING,
        },
        zhufanggongjijin: {
            type: Sequelize.STRING,
        },
        qiyeZhufanggongjijin: {
            type: Sequelize.STRING,
        },
        yiliaobaoxian: {
            type: Sequelize.STRING,
        },
        qiyeYiliaobaoxian: {
            type: Sequelize.STRING,
        },
        buchongyiliaobaoxian: {
            type: Sequelize.STRING,
        },
        shengyubaoxian: {
            type: Sequelize.STRING,
        },
        gongshangbaoxian: {
            type: Sequelize.STRING,
        }
    })
}
