var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('EmpWelfare', {
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
        Yiliaofeiyong:{
            type: Sequelize.STRING,
        },
        Liaoyangfeiyong:{
            type: Sequelize.STRING,
        },
        Gongnuanbutie:{
            type: Sequelize.STRING,
        },
        Dushengzinv: {
            type: Sequelize.STRING,
        },
        Sangzangbuzhu: {
            type: Sequelize.STRING,
        },
        Fuxufei: {
            type: Sequelize.STRING,
        },
        Fangshujiangwen:{
            type: Sequelize.STRING,
        },
        Shitangjingfei: {
            type: Sequelize.STRING,
        },
        Personalqitafuli: {
            type: Sequelize.STRING,
        },
        CompanyQitafuli: {
            type: Sequelize.STRING,
        }
    })
}
