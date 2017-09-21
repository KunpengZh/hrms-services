var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-GongZiDan-Controller');
logger.level = 'All';

var GongZidanServices = require("../services/GongZiDan/GongZidanServices");

router.get('/', function (req, res, next) {
    if (!req.query.salaryCycle || req.query.salaryCycle === "") {
        logger.error("salaryCycle is mandatory required");
        res.json({
            status: 500,
            message: "salaryCycle is mandatory required",
            data: []
        })
        res.end()
        return
    }

    let salaryCycle = req.query.salaryCycle;

    GongZidanServices.getDataByCycle(salaryCycle).then((GongZiData) => {
        res.json({
            status: 200,
            data: GongZiData,
            message: '成功'
        })
        res.end();

    }, (err) => {
        logger.error(err);
        res.json({
            status: 500,
            message: err,
            data: []
        })
        res.end();
    }).catch((err) => {
        logger.error(err);
        res.json({
            status: 500,
            message: err,
            data: []
        })
        res.end();
    })
})
module.exports = router;