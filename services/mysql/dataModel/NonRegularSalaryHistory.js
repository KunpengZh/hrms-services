var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('NonRegularSalaryHistory', {
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
        },
        yiliaobaoxian:{
            type: Sequelize.STRING,
        },
        qiyeYiliaobaoxian:{
            type: Sequelize.STRING,
        },
        shengyubaoxian: {
            type: Sequelize.STRING,
        },
        gongshangbaoxian: {
            type: Sequelize.STRING,
        },nianjinJishu:{
            type: Sequelize.STRING,
        },
        yanglaobaoxianJishu:{
            type: Sequelize.STRING,
        },
        shiyebaoxianJishu:{
            type: Sequelize.STRING,
        },
        zhufanggongjijinJishu:{
            type: Sequelize.STRING,
        }
    })
}
