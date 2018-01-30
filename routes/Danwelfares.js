var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Danwei-Welfares-Controller');
logger.level = 'All';

var fs = require('fs');
var multiparty = require('multiparty');
var path = require('path');
var excelJS = require('../services/utils/exceljs');

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

router.get('/download', function (req, res, next) {
    if (!req.query.criteria || req.query.criteria === "") {
        logger.error("Query Criteria is mandatory required");
        res.json({
            status: 500,
            message: "Query Criteria is mandatory required",
            data: []
        })
        res.end()
        return
    }


    let criteria = JSON.parse(req.query.criteria);


    DanweiWelfareServices.queryByCriteria(criteria).then((data) => {

        var currDir = path.normalize('files/download'),
            fileName = 'DanweiWelfares' + new Date().getTime() + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.DanweiWelfaresQueryDataToExcel(data.data, currFile).then((excelFilename) => {
            fs.exists(excelFilename, function (exist) {
                if (exist) {
                    res.set({
                        "Content-type": "application/octet-stream",
                        "Content-Disposition": "attachment;filename=" + encodeURI(fileName)
                    });
                    fReadStream = fs.createReadStream(excelFilename);
                    fReadStream.on("data", (chunk) => res.write(chunk, "binary"));
                    fReadStream.on("end", function () {
                        res.end();
                    });
                } else {
                    logger.error("the file do not exist :" + currFile);
                    res.set("Content-type", "text/html");
                    res.send("要下载的文件不存在!");
                    res.end();
                }
            });
        }).catch((err) => {
            logger.error("Transfer Salary Data to Excel file failed")
            logger.error(err);
            res.set("Content-type", "text/html");
            res.send("生成excel文件失败");
            res.end();
        })

    }).catch((err) => {
        logger.error("Err when get Salary Data info: " + err);
        res.set("Content-type", "text/html");
        res.send("不能从数据库获取工资!");
        res.end();
        return;
    })

})
module.exports = router;
