var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('EmpInfo', {
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
        entryTime:{
            type: Sequelize.STRING,
        },
        gender: {
            type: Sequelize.STRING,
        },
        workerCategory: {
            type: Sequelize.STRING,
        },
        comment: {
            type: Sequelize.STRING,
        },
        empStatus:{
            type: Sequelize.STRING,
        },
        unEmpDate:{
            type: Sequelize.STRING,
        }
    })
}
