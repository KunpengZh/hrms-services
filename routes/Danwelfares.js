var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Danwei-Welfares-Controller');
logger.level = 'All';



var DanweiWelfareServices = require("../services/DanweiWelfares/DanweiWelfareServices");





router.get('/', function (req, res, next) {
    DanweiWelfareServices.getAllData().then((weData) => {
        res.json(weData)
        res.end();
    }).catch((err) => {
        logger.error("Err when get Welfares Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err when get Welfares Data: " + err
        });
        res.end()
    })
});

router.get('/queryByCycle', function (req, res, next) {
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

    DanweiWelfareServices.getWelfareByCycle(salaryCycle).then((weData) => {
        res.json(weData)
        res.end();
    }).catch((err) => {
        logger.error("Err when get Welfares Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err when get Welfares Data: " + err
        });
        res.end()
    })
});


router.post('/update', function (req, res, next) {
    if (!req.body.data || !(req.body.data instanceof Array)) {
        logger.error("The posted data format is incorrect,   data mandaotry required, Data must be an Arrap object");
        res.json({
            status: 500,
            message: "The posted data format is incorrect,  data mandaotry required, Data must be an Arrap object",
            data: []
        })
        res.end()
        return
    }

    var WeDataList = req.body.data;

    DanweiWelfareServices.update(WeDataList).then((updateres) => {
        if (updateres.status === 200) {
            DanweiWelfareServices.getAllData().then((weData) => {
                res.json(weData)
                res.end();
            }).catch((err) => {
                logger.error("Err when get Welfares Data: " + err);
                res.json({
                    status: 500,
                    data: [],
                    message: "更新成功，但获取新数据失败: " + err
                });
                res.end()
            })
        } else {
            res.json({
                status: 500,
                data: [],
                message: "更新数据失败"
            });
            res.end()
        }
    }).catch((err) => {
        logger.error("Err update OT Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err update OT Data: " + err
        })
    });
})





router.post('/delete', function (req, res, next) {

    if (!req.body.data || !(req.body.data instanceof Array)) {
        logger.error("The posted data format is incorrect,  data mandaotry required, Data must be an Arrap object");
        res.json({
            status: 500,
            message: "The posted data format is incorrect,   data mandaotry required, Data must be an Arrap object",
            data: []
        })
        res.end()
        return
    }

    var docIds = req.body.data;


    logger.warn("to Delete Welfares Data for :" + JSON.stringify(docIds));

    DanweiWelfareServices.delete(docIds).then((result) => {
        if (result.status === 200) {
            DanweiWelfareServices.getAllData().then((wedata) => {
                res.json(wedata)
                res.end();
            }).catch((err) => {
                logger.error("Err when get OT Data: " + err);
                res.json({
                    status: 500,
                    data: [],
                    message: "删除成功，但获取新数据失败: " + err
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
    }).catch((err) => {
        logger.error("Err when delete OT Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err uwhen delete Ot data: " + err
        })
    });


});

router.post('/querybycriteria', function (req, res, next) {

    if (!req.body.data || req.body.data === "") {
        logger.error("Query Criteria is mandatory required");
        res.json({
            status: 500,
            message: "Query Criteria is mandatory required",
            data: []
        })
        res.end()
        return
    }

    let criteria = req.body.data;

    DanweiWelfareServices.queryByCriteria(criteria).then((data) => {
        res.json(data)
        res.end();
    }, (err) => {
        logger.error(err);
        res.json(err)
        res.end();
    }).catch((err) => {
        logger.error(err);
        res.json(err)
        res.end();
    })
})
module.exports = router;
