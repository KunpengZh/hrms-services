var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-UserManagement-Controller');
logger.level = 'All';

var UserManagementServices = require("../services/passport/UserManagement");

router.get('/', function (req, res, next) {

    UserManagementServices.getAllUsers().then((users) => {
        res.json({
            status: 200,
            data: users,
            message: ''
        })
        res.end();
    }).catch((err) => {
        logger.error("Err when get Application User Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err when get Application User Data: " + err
        });
        res.end()
    })
});


router.post('/create', function (req, res, next) {
    if (!req.body.data) {
        logger.error("The posted data format is incorrect,  User is mandaotry required");
        res.json({
            status: 500,
            message: "The posted data format is incorrect,  User is mandaotry required",
            data: []
        })
        res.end()
        return
    }

    var user = req.body.data;

    UserManagementServices.create(user).then((createres) => {
        if (createres) {
            res.json({
                status: 200,
                data: createres,
                message: '保存成功'
            })
            res.end();
        } else {
            res.json({
                status: 500,
                data: [],
                message: "更新数据失败"
            });
            res.end()
        }
    }, (err) => {
        res.json({
            status: 500,
            data: [],
            message: err.message
        });
        res.end()
    }).catch((err) => {
        logger.error("Err update User Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err update User Data: " + err
        })
    });
})




router.post('/update', function (req, res, next) {
    if (!req.body.data) {
        logger.error("The posted data format is incorrect,  User is mandaotry required");
        res.json({
            status: 500,
            message: "The posted data format is incorrect,  User is mandaotry required",
            data: []
        })
        res.end()
        return
    }

    var user = req.body.data;

    UserManagementServices.update(user).then((updateres) => {
        if (updateres) {
            res.json({
                status: 200,
                data: updateres,
                message: '保存成功'
            })
            res.end();
        } else {
            res.json({
                status: 500,
                data: [],
                message: "更新数据失败"
            });
            res.end()
        }
    }).catch((err) => {
        logger.error("Err update User Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err update User Data: " + err
        })
    });
})





router.get('/delete', function (req, res, next) {

    if (!req.query.username || req.query.username === "") {
        logger.error("username must be provided to delte a user");
        res.json({
            status: 500,
            message: "username must be provided to delte a user",
            data: []
        })
        res.end()
        return
    }

    let username = req.query.username;

    logger.warn("to Delete App User for :" + username);

    UserManagementServices.delete(username).then((result) => {
        if (result) {
            UserManagementServices.getAllUsers().then((users) => {
                res.json({
                    status: 200,
                    data: users,
                    message: ''
                })
                res.end();
            }).catch((err) => {
                logger.error("Err when get Application User Data: " + err);
                res.json({
                    status: 500,
                    data: [],
                    message: "Err when get Application User Data: " + err
                });
                res.end()
            })
        } else {
            res.json({
                status: 500,
                data: [],
                message: "删除失败"
            });
            res.end()
        }
    }, err => {
        console.log(err.message);
        res.json({
            status: 500,
            data: [],
            message: err.message
        });
        res.end()
    }).catch((err) => {
        logger.error("Err when delete application user: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err uwhen delete application user: " + err
        })
    });
});




module.exports = router;
