var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('AppUsers', {
        empId: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
            get() {
                return this.getDataValue('empId');
            }
        },
        empName: {
            type: Sequelize.STRING,
            allowNull: false,
            get() {
                return this.getDataValue('empName');
            }
        },
        username: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false,
            get() {
                return this.getDataValue('username');
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            get() {
                return this.getDataValue('password');
            }
        },
        jobRole: {
            type: Sequelize.ENUM,
            values: ['SysAdmin', 'PayrollAdmin', 'HRAdmin', 'EmpAdmin', 'User'],
            allowNull: false,
            get() {
                return this.getDataValue('jobRole');
            }
        }
    })
}
