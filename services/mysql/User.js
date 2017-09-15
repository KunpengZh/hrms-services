var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-User');
logger.level = 'All';
var sequelize = require('./hrmsdb');
const User = sequelize.import("./dataModel/User.js");

var bcrypt = require('bcrypt-nodejs')

User.sync();
User.findOrCreate({
    where: {
        username: 'HRMSAdmin'
    },
    defaults: {
        empId: 10000,
        empName: 'HRMS System Administrator',
        username: 'HRMSAdmin',
        password: bcrypt.hashSync("zaq12wsx", bcrypt.genSaltSync(5), null),
        jobRole: 'SysAdmin'
    }
});



module.exports = {
    User: User,
    validPassword: function (inputPassword, oriPassword) {
        try {
            return bcrypt.compareSync(inputPassword, oriPassword);
        } catch (e) {
            logger.error(e);
            return false;
        }
    },
    encryptPassword: function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
    }
};