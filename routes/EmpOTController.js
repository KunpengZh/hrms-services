var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Employee-OT-Controller');
logger.level = 'All';

var fs = require('fs');
var multiparty = require('multiparty');
var path = require('path');

var EmpOTServices = require("../services/EmpOTServices/EmpOTServices");

var excelJS = require('../services/utils/exceljs');


router.get('/initialOT', function (req, res, next) {
    if (!req.query.OTCycle || req.query.OTCycle === "") {
        logger.error("OTCycle is mandatory required");
        res.json({
            status: 500,
            message: "OTCycle is mandatory required",
            data: []
        })
        res.end()
        return
    }

    let OTCycle = req.query.OTCycle;

    EmpOTServices.InitialWithEmps(OTCycle).then((OTData) => {
        res.json({
            status: 200,
            data: OTData,
            message: '同步完成'
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
    if (!req.query.OTCycle || req.query.OTCycle === "") {
        logger.error("OTCycle is mandatory required");
        res.json({
            status: 500,
            message: "OTCycle is mandatory required",
            data: []
        })
        res.end()
        return
    }

    let OTCycle = req.query.OTCycle;

    EmpOTServices.getOTByCycle(OTCycle).then((OTData) => {
        res.json({
            status: 200,
            data: OTData,
            message: ''
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
    if (!req.body.data || !(req.body.data instanceof Array) || !req.body.OTCycle || req.body.OTCycle === "") {
        logger.error("The posted data format is incorrect,  OTCycle and data mandaotry required, Data must be an Arrap object");
        res.json({
            status: 500,
            message: "The posted data format is incorrect,  OTCycle and data mandaotry required, Data must be an Arrap object",
            data: []
        })
        res.end()
        return
    }

    var OTDataList = req.body.data;
    var OTCycle = req.body.OTCycle;

    EmpOTServices.update(OTCycle, OTDataList).then((updateres) => {
        if (updateres) {
            EmpOTServices.getOTByCycle(OTCycle).then((OTData) => {
                res.json({
                    status: 200,
                    data: OTData,
                    message: '保存成功'
                })
                res.end();
            }).catch((err) => {
                logger.error("Err when get OT Data: " + err);
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



router.get('/downloadot', function (req, res, next) {
    if (!req.query.OTCycle || req.query.OTCycle === "") {
        logger.error("OTCycle is mandatory required");
        res.json({
            status: 500,
            message: "OTCycle is mandatory required",
            data: ''
        })
        res.end()
        return
    }

    let OTCycle = req.query.OTCycle;

    EmpOTServices.getOTByCycle(OTCycle).then((OTData) => {

        var currDir = path.normalize('files/download'),
            fileName = 'OTData_' + OTCycle + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.OTDataToExcel(OTData, currFile).then((excelFilename) => {
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
            logger.error("Transfer OT Data to Excel file failed")
            logger.error(err);
            res.set("Content-type", "text/html");
            res.send("生成excel文件失败");
            res.end();
        })

    }).catch((err) => {
        logger.error("Err when get all emp sensitive info: " + err);
        res.set("Content-type", "text/html");
        res.send("不能从数据库获取加班信息!");
        res.end();
        return;
    })

})

router.post('/uploadot', function (req, res, next) {

    logger.info('uploading Employee OT Data.....');

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
                            excelJS.OTExcelToJSON(dstPath).then((OTDataLists) => {
                                EmpOTServices.upload(OTDataLists).then((uploadres) => {
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

router.post('/delete', function (req, res, next) {

    if (!req.body.data || !(req.body.data instanceof Array) || !req.body.OTCycle || req.body.OTCycle === "") {
        logger.error("The posted data format is incorrect,  OTCycle and data mandaotry required, Data must be an Arrap object");
        res.json({
            status: 500,
            message: "The posted data format is incorrect,  OTCycle and data mandaotry required, Data must be an Arrap object",
            data: []
        })
        res.end()
        return
    }

    var empIds = req.body.data;
    var OTCycle = req.body.OTCycle;

    logger.warn("to Delete OT Data for :" + JSON.stringify(empIds));

    EmpOTServices.delete(empIds, OTCycle).then((result) => {
        if (result) {
            EmpOTServices.getOTByCycle(OTCycle).then((OTData) => {
                res.json({
                    status: 200,
                    data: OTData,
                    message: '删除成功'
                })
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




module.exports = router;
