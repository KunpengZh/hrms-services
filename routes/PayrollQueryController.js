var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-PayrollQuery-Controller');
logger.level = 'All';

var PayrollQueryService = require("../services/PayrollQuery/PayrollQueryService");
var fs = require('fs');
var multiparty = require('multiparty');
var path = require('path');
var excelJS = require('../services/utils/exceljs');




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

    if (JSON.stringify(criteria) === '{}') {
        logger.error("Query Criteria is mandatory required");
        res.json({
            status: 500,
            message: "Query Criteria is mandatory required",
            data: []
        })
        res.end()
        return
    }

    PayrollQueryService.getDataByCriteria(criteria).then((GongZiData) => {

        var currDir = path.normalize('files/download'),
            fileName = 'SalaryReport' + new Date().getTime() + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.PayrollQueryDataToExcel(GongZiData, currFile).then((excelFilename) => {
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


router.post('/query', function (req, res, next) {
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

    PayrollQueryService.getDataByCriteria(criteria).then((GongZiData) => {
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