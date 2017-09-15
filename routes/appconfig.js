var express = require('express');
var router = express.Router();
var ConfigDoc = require('../services/mysql/ConfigDoc');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-AppConfig-Controller');
logger.level = 'All';

router.get('/', function (req, res, next) {

    if (!req.query.configKey || req.query.configKey === "") {
        logger.error("configKey is mandatory requried")
        res.json({
            status: 500,
            message: "configKey is mandatory requried"
        })
        res.end()
        return
    }

    let configKey = req.query.configKey;

    ConfigDoc.findOne({
        where: {
            configKey: configKey
        }
    }).then((qres) => {
        if (qres === null) {
            res.json({
                status: 200,
                data: {
                    Department: [],
                    JobRole: [],
                    WorkerCategory: []
                },
                message: 'Do not have Config Data'
            });
            res.end();
        } else {
            try {
                res.json({
                    status: 200,
                    data: JSON.parse(qres.get('configDoc')),
                    message: ''
                });
                res.end();
            } catch (e) {
                logger.error(e);
                res.json({
                    status: 500,
                    data: {
                        Department: [],
                        JobRole: [],
                        WorkerCategory: []
                    },
                    message: 'Error when parse JSON: ' + qres
                });
                res.end();
            }

        }
    })
});

router.post('/save', function (req, res, next) {
    if (!req.body.configKey || !req.body.data) {
        res.json({
            status: 500,
            message: "configKey and data is mandatory requried"
        })
        res.end()
        return
    }

    var configKey = req.body.configKey;
    var configDoc = req.body.data;
    ConfigDoc.findOne({
        where: {
            configKey: configKey
        }
    }).then((qres) => {
        if (qres === null) {
            ConfigDoc.create({
                configKey: configKey,
                configDoc: JSON.stringify(configDoc)
            }).then((cres) => {
                res.json({
                    status: 200,
                    message: cres
                })
            })
        } else {
            ConfigDoc.update({
                configDoc: JSON.stringify(configDoc)
            }, {
                    where: {
                        configKey: configKey
                    }
                }).then((ures) => {
                    res.json({
                        status: 200,
                        message: ures
                    })
                })
        }
    })
})

module.exports = router;
