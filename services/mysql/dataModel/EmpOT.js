var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('EmpOT', {
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
        OTCycle: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        NormalOT:{
            type: Sequelize.STRING,
        },
        WeekendOT:{
            type: Sequelize.STRING,
        },
        HolidayOT:{
            type: Sequelize.STRING,
        },
        kouchu: {
            type: Sequelize.STRING,
        },
        kaohekoukuan: {
            type: Sequelize.STRING,
        },
        yicixingjiangjin: {
            type: Sequelize.STRING,
        },
        gongliBuzhu:{
            type: Sequelize.STRING,
        },
        kaoheJiangjin: {
            type: Sequelize.STRING,
        },
        gudingJiangjin: {
            type: Sequelize.STRING,
        },
        tongxunButie: {
            type: Sequelize.STRING,
        },
        qitaJiangjin:{
            type: Sequelize.STRING,
        },
        xiaxiangBuzhu:{
            type: Sequelize.STRING,
        },
        yingyetingBuzhu:{
            type: Sequelize.STRING,
        },
        buchongyiliaobaoxian:{
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
        }
    })
}
