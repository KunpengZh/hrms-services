var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Employee-Welfares-Controller');
logger.level = 'All';

var fs = require('fs');
var multiparty = require('multiparty');
var path = require('path');

var WelfareServices = require("../services/Welfares/WelfaresServices");

var excelJS = require('../services/utils/exceljs');


router.get('/initialwe', function (req, res, next) {
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

    WelfareServices.InitialWithEmps(salaryCycle).then((weData) => {
        res.json(weData)
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

    WelfareServices.getWelfareByCycle(salaryCycle).then((weData) => {
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

    var WeDataList = req.body.data;
    var salaryCycle = req.body.salaryCycle;

    WelfareServices.update(salaryCycle, WeDataList).then((updateres) => {
        if (updateres.status === 200) {
            WelfareServices.getWelfareByCycle(salaryCycle).then((weData) => {
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



router.get('/downloadwelfares', function (req, res, next) {
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

    WelfareServices.getWelfareByCycle(salaryCycle).then((WeData) => {

        var currDir = path.normalize('files/download'),
            fileName = 'Welfares_' + salaryCycle + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.WEDataToExcel(WeData.data, currFile).then((excelFilename) => {
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

    logger.info('uploading Employee Welfares Data.....');

    var form = new multiparty.Form({
        encoding: 'utf-8',
        uploadDir: 'files/upload/'
    });

    form.parse(req, function (err, fields, files) {
        if (err) {
            logger.error('parse error: ' + err);
            res.json({
                status: 500,
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
                        status: 500,
                        message: err
                    })
                    res.end();
                    return;
                } else {
                    fs.exists(dstPath, function (isFileExist) {
                        if (isFileExist) {
                            logger.info("To transfer excel to JSON .......")
                            excelJS.WEExcelToJSON(dstPath).then((WEDataLists) => {
                                WelfareServices.upload(WEDataLists).then((uploadres) => {
                                    if (uploadres.status === 200) {
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

    logger.warn("to Delete Welfares Data for :" + JSON.stringify(empIds));

    WelfareServices.delete(empIds, salaryCycle).then((result) => {
        if (result.status === 200) {
            WelfareServices.getWelfareByCycle(salaryCycle).then((wedata) => {
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

    WelfareServices.queryByCriteria(criteria).then((data) => {
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


router.get("/byworkercategory", function (req, res, next) {
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
    WelfareServices.tongJiByCategory(criteria).then((WelData) => {
        res.json(WelData)
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

router.get("/bydepartment", function (req, res, next) {
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
    WelfareServices.tongJiByDepartment(criteria).then((WelData) => {
        res.json(WelData)
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
router.get("/byemp", function (req, res, next) {
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
    WelfareServices.tongJiByEmp(criteria).then((WelData) => {
        res.json(WelData)
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

router.get("/tongjidetails", function (req, res, next) {
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
    WelfareServices.tongJiDetails(criteria).then((WelData) => {
        res.json(WelData)
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

router.get('/downloadbywokercategory', function (req, res, next) {
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
    WelfareServices.tongJiByCategory(criteria).then((WelData) => {
        var currDir = path.normalize('files/download'),
            fileName = 'WelfaresByCategory' + new Date().getTime() + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.WelfaresToExcelByWorkerCategory(WelData.data, currFile).then((excelFilename) => {
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

router.get('/downloadbydepartment', function (req, res, next) {
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
    WelfareServices.tongJiByDepartment(criteria).then((WelData) => {
        var currDir = path.normalize('files/download'),
            fileName = 'WelfaresByDepartment' + new Date().getTime() + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.WelfaresToExcelByDepartment(WelData.data, currFile).then((excelFilename) => {
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

router.get('/downloadbyemp', function (req, res, next) {
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
    WelfareServices.tongJiByEmp(criteria).then((WelData) => {
        var currDir = path.normalize('files/download'),
            fileName = 'WelfaresByEmp' + new Date().getTime() + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.WelfaresToExcelByEmp(WelData.data, currFile).then((excelFilename) => {
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

router.get('/downloaddetails', function (req, res, next) {
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
    WelfareServices.tongJiDetails(criteria).then((WelData) => {
        var currDir = path.normalize('files/download'),
            fileName = 'WelfaresDetails' + new Date().getTime() + '.xlsx',
            currFile = path.join(currDir, fileName),
            fReadStream;


        excelJS.WelfaresToExcelDetails(WelData.data, currFile).then((excelFilename) => {
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
