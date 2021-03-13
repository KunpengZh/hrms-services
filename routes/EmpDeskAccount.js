var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-EmpDeskAccount-Controller');
logger.level = 'All';

var EmpDeskAccountServices = require("../services/GongZiDan/EmpDeskAccountServices");
var fs = require('fs');
var multiparty = require('multiparty');
var path = require('path');
var excelJS = require('../services/utils/exceljs');


router.get('/getAvailableCalendarYear', function (req, res, next) {
    EmpDeskAccountServices.getAvailableCalendarYear().then(calendarys => {
        res.json(calendarys)
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


router.get("/getEmpDeskAccountByYear", function (req, res, next) {
    if (!req.query.calendarYear || req.query.calendarYear === "") {
        logger.error("calendarYear is mandatory required");
        res.json({
            status: 500,
            message: "calendarYear is mandatory required",
            data: []
        })
        res.end()
        return
    }

    let calendarYear = JSON.parse(req.query.calendarYear);


    EmpDeskAccountServices.getEmpDeskAccountByYear(calendarYear).then((accountData) => {
        res.json(accountData)
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

router.get("/downloadEmpDeskAccountByYear", function (req, res, next) {
    if (!req.query.calendarYear || req.query.calendarYear === "") {
        logger.error("calendarYear is mandatory required");
        res.json({
            status: 500,
            message: "calendarYear is mandatory required",
            data: []
        })
        res.end()
        return
    }

    let calendarYear = JSON.parse(req.query.calendarYear);


    EmpDeskAccountServices.getEmpDeskAccountByYear(calendarYear).then((accountData) => {
        var currDir = path.normalize('files/download'),
            fileName = 'EmpDeskAccount_' + calendarYear + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.EmpDeskAccountToExcel(accountData.data, currFile,calendarYear).then((excelFilename) => {
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