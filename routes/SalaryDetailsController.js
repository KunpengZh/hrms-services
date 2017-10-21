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

router.get('/syncdata', function (req, res, next) {
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

    SDServices.SyncWithEmps(salaryCycle).then((SDData) => {
        SDData = deleteSenData(SDData);
        res.json({
            status: 200,
            data: SDData,
            message: '同步化完成'
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

router.get('/initialSD', function (req, res, next) {
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

    SDServices.InitialWithEmps(salaryCycle).then((SDData) => {
        SDData = deleteSenData(SDData);
        res.json({
            status: 200,
            data: SDData,
            message: '初始化完成'
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
router.get('/recalculate', function (req, res, next) {
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

    SDServices.ReCalculateSalaryDetails(salaryCycle).then((SDData) => {
        SDData = deleteSenData(SDData);
        res.json({
            status: 200,
            data: SDData,
            message: '初始化完成'
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
        logger.error("Err when get OT Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err when get OT Data: " + err
        });
        res.end()
    })
});


router.post('/update', function (req, res, next) {
    if (!req.body.data || !(req.body.data instanceof Array) || !req.body.salaryCycle || req.body.salaryCycle === "") {
        logger.error("The posted data format is incorrect,  salaryCycle and data mandaotry required, Data must be an Array object");
        res.json({
            status: 500,
            message: "The posted data format is incorrect,  salaryCycle and data mandaotry required, Data must be an Array object",
            data: []
        })
        res.end()
        return
    }

    var SDDataList = req.body.data;
    var salaryCycle = req.body.salaryCycle;

    SDServices.update(salaryCycle, SDDataList).then((updateres) => {
        if (updateres) {
            SDServices.getDataByCycle(salaryCycle).then((SDData) => {
                SDData = deleteSenData(SDData);
                res.json({
                    status: 200,
                    data: SDData,
                    message: '保存成功'
                })
                res.end();
            }).catch((err) => {
                logger.error("Err when get SD Data: " + err);
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
        logger.error("Err update Salary Details Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err update Salary Details Data: " + err
        })
    });
})



router.get('/downloadot', function (req, res, next) {
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
            fileName = 'SDData_' + salaryCycle + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.SDDataToExcel(SDData, currFile).then((excelFilename) => {
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

router.post('/uploadot', function (req, res, next) {

    logger.info('uploading Employee Salary Data.....');

    var form = new multiparty.Form({
        encoding: 'utf-8',
        uploadDir: 'files/upload/'
    });

    form.parse(req, function (err, fields, files) {
        if (err) {
            logger.error('parse error: ' + err);
            res.json({
                status: 200,
                message: err
            })
            res.end();
            return;
        } else {
            logger.info("To move files into files/upload diretory.......");
            var inputFile = files.file[0];
            var uploadedPath = inputFile.path;
            var dstPath = 'files/upload/' + inputFile.originalFilename;
            fs.rename(uploadedPath, dstPath, function (err) {
                if (err) {
                    logger.error('rename error: ' + err);
                    res.json({
                        status: 200,
                        message: err
                    })
                    res.end();
                    return;
                } else {
                    fs.exists(dstPath, function (isFileExist) {
                        if (isFileExist) {
                            logger.info("To transfer excel to JSON .......")
                            excelJS.SDExcelToJSON(dstPath).then((SDDataLists) => {
                                SDServices.upload(SDDataLists).then((uploadres) => {
                                    if (uploadres) {
                                        res.json({
                                            status: 200,
                                            data: [],
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
                                }).catch(function (err) {
                                    res.json({
                                        status: 500,
                                        message: "上传文件到数据库失败" + err,
                                        data: []
                                    })
                                    res.end();
                                })
                            }).catch(function (err) {
                                logger.error(err);
                                res.json({
                                    status: 500,
                                    message: "Transfer excel file to database failed"
                                })
                                res.end();
                            })
                        } else {
                            res.json({ message: "文件不存在", status: 500 });
                            res.end()
                        }
                    })
                }
            });
        }
    });
});

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



module.exports = router;
