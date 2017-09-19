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
        }
    })
}
