var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('NonRegularSalary', {
        empId: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        department: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        jobRole: {
            type: Sequelize.STRING,
        },
        workAge: {
            type: Sequelize.STRING,
        },
        entryTime: {
            type: Sequelize.STRING,
        },
        gender: {
            type: Sequelize.STRING,
        },
        workerCategory: {
            type: Sequelize.STRING,
        },
        salaryCycle: {
            type: Sequelize.STRING,
        },
        daySalary: {
            type: Sequelize.STRING,
        },
        workDays: {
            type: Sequelize.STRING,
        },
        anquanJiangli: {
            type: Sequelize.STRING,
        },
        wuweizhangJiangli: {
            type: Sequelize.STRING,
        },
        OTJiangjin: {
            type: Sequelize.STRING,
        }
    })
}