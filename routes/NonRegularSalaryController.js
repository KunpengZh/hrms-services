var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-NonRegular-Salary-Controller');
logger.level = 'All';

var fs = require('fs');
var multiparty = require('multiparty');
var path = require('path');

var NonRegularServices = require("../services/NonRegularSalary/NonRegularSalaryService");

var excelJS = require('../services/utils/exceljs');


router.get('/initialNRSalary', function (req, res, next) {
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

    NonRegularServices.InitialWithEmps(salaryCycle).then((salaryData) => {
       
        res.json(salaryData)
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

    NonRegularServices.getNRSSByCycle(salaryCycle).then((salaryData) => {
        res.json(salaryData)
        res.end();
    }).catch((err) => {
        logger.error("Err when get Non Regular Salary Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err when get Data: " + err
        });
        res.end()
    })
});


router.post('/update', function (req, res, next) {
    if (!req.body.data || !(req.body.data instanceof Array) || !req.body.salaryCycle || req.body.salaryCycle === "") {
        logger.error("The posted data format is incorrect,  salaryCycle and data mandaotry required, Data must be an Arrap object");
        res.json({
            status: 500,
            message: "The posted data format is incorrect,  salaryCycle and data mandaotry required, Data must be an Arrap object",
            data: []
        })
        res.end()
        return
    }

    var salaryDataList = req.body.data;
    var salaryCycle = req.body.salaryCycle;

    NonRegularServices.update(salaryCycle, salaryDataList).then((updateres) => {
        if (updateres.status === 200) {
            NonRegularServices.getNRSSByCycle(salaryCycle).then((salaryData) => {
                res.json(salaryData)
                res.end();
            }).catch((err) => {
                logger.error("Err when get Non Regular Salary Data: " + err);
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
                message: updateres.message
            });
            res.end()
        }
    }).catch((err) => {
        logger.error("Err update Non Regurlar Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: err
        })
    });
})



router.get('/download', function (req, res, next) {
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

    NonRegularServices.getNRSSByCycle(salaryCycle).then((salaryData) => {

        var currDir = path.normalize('files/download'),
            fileName = 'nonRegularSalaryData_' + salaryCycle + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.NRDataToExcel(salaryData.data, currFile).then((excelFilename) => {
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
            logger.error("Transfer Non Regular Data to Excel file failed")
            logger.error(err);
            res.set("Content-type", "text/html");
            res.send("生成excel文件失败");
            res.end();
        })

    }).catch((err) => {
        logger.error("Err when get non regular salary data: " + err);
        res.set("Content-type", "text/html");
        res.send("不能从数据库获取信息!");
        res.end();
        return;
    })

})

router.post('/upload', function (req, res, next) {

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
                            excelJS.NRExcelToJSON(dstPath).then((salaryDataLists) => {
                                NonRegularServices.upload(salaryDataLists).then((uploadres) => {
                                    if (uploadres.status === 200) {
                                        res.json(uploadres)
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

    if (!req.body.data || !(req.body.data instanceof Array) || !req.body.salaryCycle || req.body.salaryCycle === "") {
        logger.error("The posted data format is incorrect,  salaryCycle and data mandaotry required, Data must be an Arrap object");
        res.json({
            status: 500,
            message: "The posted data format is incorrect,  salaryCycle and data mandaotry required, Data must be an Arrap object",
            data: []
        })
        res.end()
        return
    }

    var empIds = req.body.data;
    var salaryCycle = req.body.salaryCycle;

    logger.warn("to Delete Non Regular Salary Data for :" + JSON.stringify(empIds));

    NonRegularServices.delete(empIds, salaryCycle).then((result) => {
        if (result.status === 200) {
            NonRegularServices.getNRSSByCycle(salaryCycle).then((salaryData) => {
                res.json(salaryData)
                res.end();
            }).catch((err) => {
                logger.error("Err when get non regulary Salary Data: " + err);
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
        logger.error("Err when delete non regular salary Data: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err uwhen delete non regular salary data: " + err
        })
    });


});

router.post('/querybycriteria',function(req,res,next){
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

    NonRegularServices.queryByCriteria(criteria).then((data) => {
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
