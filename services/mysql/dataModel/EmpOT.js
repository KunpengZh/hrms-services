var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('EmpOT', {
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
        workerCategory: {
            type: Sequelize.STRING,
        },
        OTCycle: {
            type: Sequelize.STRING,
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
