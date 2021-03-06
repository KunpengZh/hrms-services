var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('CategoryConfig', {
        WorkerCategory:{
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
        },
        jinengGongzi:{
            type: Sequelize.STRING,
        },
        gangweiGongzi:{
            type: Sequelize.STRING,
        },
        jichuButie:{
            type: Sequelize.STRING,
        },
        xilifei:{
            type: Sequelize.STRING,
        },
        gonglingGongzi:{
            type: Sequelize.STRING,
        },
        zhiwuJintie:{
            type: Sequelize.STRING,
        },
        gongliBuzhu:{
            type: Sequelize.STRING,
        },
        kaoheJiangjin: {
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
        nianjin:{
            type: Sequelize.STRING,
        },
        qiyeNianjin: {
            type: Sequelize.STRING,
        },
        yanglaobaoxian:{
            type: Sequelize.STRING,
        },
        shiyebaoxian:{
            type: Sequelize.STRING,
        },
        zhufanggongjijin: {
            type: Sequelize.STRING,
        },
        yiliaobaoxian:{
            type: Sequelize.STRING,
        },
        buchongyiliaobaoxian:{
            type: Sequelize.STRING,
        },
        tax:{
            type: Sequelize.STRING,
        },
        yicixingJiangjin:{
            type: Sequelize.STRING,
        }
    })
}
