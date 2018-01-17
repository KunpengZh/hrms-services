var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Salary-Details-Controller');
logger.level = 'All';

var fs = require('fs');
var multiparty = require('multiparty');
var path = require('path');

var SDServices = require("../services/SalaryDetails/SalaryDetails");

var excelJS = require('../services/utils/exceljs');

var deleteSenData = function (obj) {
    if (!(obj instanceof Array)) {
        delete obj.idCard;
        delete obj.bankAccount;
        delete obj.birthday;
    } else {

        for (let i = 0; i < obj.length; i++) {
            delete obj[i].idCard;
            delete obj[i].bankAccount;
            delete obj[i].birthday;
        }
    }

    return obj;
}

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

    SDServices.getDataByCycle(salaryCycle).then((SDData) => {
        SDData = deleteSenData(SDData);
        res.json({
            status: 200,
            data: SDData,
            message: ''
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
        logger.error("Err when get SD Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err when get SD Data: " + err
        });
        res.end()
    })
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

    SDServices.queryByCriteria(criteria).then((data) => {
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

router.get('/downloadtable', function (req, res, next) {
    if (!req.query.salaryCycle || req.query.salaryCycle === "") {
        logger.error("salaryCycle is mandatory required");
        res.json({
            status: 500,
            message: "salaryCycle is mandatory required",
            data: ''
        })
        res.end()
        return
    }

    let salaryCycle = req.query.salaryCycle;

    SDServices.getDataByCycle(salaryCycle).then((SDData) => {

        var currDir = path.normalize('files/download'),
            fileName = 'SDTableData_' + salaryCycle + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.SDTableDataToExcel(SDData, currFile).then((excelFilename) => {
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
        res.send("不能从数据库获取加班信息!");
        res.end();
        return;
    })

})

router.get('/getAllAvailableCycles', function (req, res, next) {
    SDServices.getAllAvailableCycles().then(resdata => {
        res.json(resdata);
    })
})



module.exports = router;
