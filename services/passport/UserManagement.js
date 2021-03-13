var UserModel = require('../mysql/User');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-UserManagement-Services');
logger.level = 'All';

var UserManagementServices = {};

UserManagementServices.getAllUsers = function () {
    return new Promise(function (rel, rej) {
        UserModel.User.findAll().then((users) => {
            users = JSON.parse(JSON.stringify(users));
            for (let i = 0; i < users.length; i++) {
                delete users[i].password;
            }
            rel(users);
        }, (err) => {
            logger.error("Error Location UserManagementServices001")
            throw err;
        }).catch((err) => {
            logger.error("Error Location UserManagementServices002")
            throw err;
        })
    })
}
UserManagementServices.create = function (user) {
    return new Promise(function (rel, rej) {
        if (!user.username || user.username.length < 2) {
            logger.error("没有输入用户名，或是用户名太短");
            logger.error("Error Location UserManagementServices003");
            throw new Error("没有输入用户名，或是用户名太短");
            return;
        }
        if (!user.password || user.password.length < 6) {
            logger.error("所输入的密码不能小于6位");
            logger.error("Error Location UserManagementServices004");
            throw new Error("所输入的密码不能小于6位");
            return;
        }

        UserModel.User.findOne({
            where: { username: user.username },
        }).then(existuser => {
            if (existuser) {
                logger.error("此用户名已经被注册");
                logger.error("Error Location UserManagementServices005");
                throw new Error("此用户名已经被注册");
            } else {
                UserModel.User.create(
                    {
                        username: user.username,
                        empName: user.empName,
                        password: UserModel.encryptPassword(user.password),
                        jobRole: user.jobRole
                    }).then((newUser) => {
                        UserManagementServices.getAllUsers().then(allusers => {
                            rel(allusers);
                        }).catch((err) => {
                            logger.error("Error Location UserManagementServices006")
                            throw err;
                        })
                    }).catch((err) => {
                        logger.error("Error Location UserManagementServices007")
                        throw err;
                    })
            }
        }).catch((err) => {
            logger.error("Error Location UserManagementServices008")
            rej(err);
        })
    })
}

UserManagementServices.update = function (user) {
    return new Promise(function (rel, rej) {
        if (!user.username || user.username.length < 6) {
            logger.error("没有输入用户名，或是用户名太短");
            logger.error("Error Location UserManagementServices009");
            throw new Error("没有输入用户名，或是用户名太短");
        }

        if (user.password && user.password.length < 8) {
            logger.error("所输入的密码不能小于6位");
            logger.error("Error Location UserManagementServices010");
            throw new Error("所输入的密码不能小于6位");
        }

        UserModel.User.findOne({
            where: { username: user.username },
        }).then(existuser => {
            if (!existuser) {
                logger.error("用户不存在");
                logger.error("Error Location UserManagementServices011");
                throw new Error("用户不存在");
                return;
            } else {
                existuser = JSON.parse(JSON.stringify(existuser));
                if (user.password) existuser.password = UserModel.encryptPassword(user.password);
                //if (user.empId) existuser.empId = user.empId;
                if (user.empName) existuser.empName = user.empName;
                if (user.jobRole) existuser.jobRole = user.jobRole;

                UserModel.User.update(existuser, {
                    where: {
                        id: existuser.id
                    }
                }).then(updateres => {
                    logger.info(updateres);
                    UserManagementServices.getAllUsers().then(allusers => {
                        rel(allusers);
                    }).catch(err => {
                        logger.error("Error Location UserManagementServices012");
                        throw err;
                    })

                }).catch(err => {
                    logger.error("Error Location UserManagementServices013");
                    throw err;
                })
            }
        }).catch((err) => {
            logger.error("Error Location UserManagementServices014")
            throw err;
        })
    })
}




UserManagementServices.delete = function (username) {
    return new Promise(function (rel, rej) {
        if (username === "HRMSAdmin") {
            rej(new Error("HRMSAdmin不能被删除"));
            return;
        }
        
        sequelize.query('DELETE FROM AppUsers WHERE username=:username',
            { replacements: { username: username } }
        ).spread((results, metadata) => {
            rel(true);
        }).catch((err) => {
            logger.error("Error Location UserManagementServices015")
            throw err;
        });
    })
}

module.exports = UserManagementServices;