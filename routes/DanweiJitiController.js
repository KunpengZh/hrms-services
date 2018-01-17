var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-DanweiJiti-Controller');
logger.level = 'All';

var DanweiJitiService = require("../services/GongZiDan/DanweiJitiServices");
var fs = require('fs');
var multiparty = require('multiparty');
var path = require('path');
var excelJS = require('../services/utils/exceljs');

router.get("/yanglaobaoxian", function (req, res, next) {
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

    DanweiJitiService.Yanglaobaoxian(criteria).then((danweiJitiData) => {

        res.json(danweiJitiData)
        res.end();
    }, (rejObj) => {
        logger.error(rejObj.message);
        res.json(rejObj)
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

router.get("/shiyebaoxian", function (req, res, next) {
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

    DanweiJitiService.Shiyebaoxian(criteria).then((danweiJitiData) => {
        res.json(danweiJitiData)
        res.end();
    }, (rejObj) => {
        logger.error(rejObj.message);
        res.json(rejObj)
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

router.get("/yiliaobaoxian", function (req, res, next) {
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

    DanweiJitiService.Yiliaobaoxian(criteria).then((danweiJitiData) => {
        res.json(danweiJitiData)
        res.end();
    }, (rejObj) => {
        logger.error(rejObj.message);
        res.json(rejObj)
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

router.get("/zhufanggongjijin", function (req, res, next) {
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

    DanweiJitiService.Zhufanggongjijin(criteria).then((danweiJitiData) => {
        res.json(danweiJitiData)
        res.end();
    }, (rejObj) => {
        logger.error(rejObj.message);
        res.json(rejObj)
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

router.get("/nianjin", function (req, res, next) {
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

    DanweiJitiService.Nianjin(criteria).then((danweiJitiData) => {
        res.json(danweiJitiData)
        res.end();
    }, (rejObj) => {
        logger.error(rejObj.message);
        res.json(rejObj)
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

router.get("/shengyubaoxian", function (req, res, next) {
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

    DanweiJitiService.Shengyubaoxian(criteria).then((danweiJitiData) => {
        res.json(danweiJitiData)
        res.end();
    }, (rejObj) => {
        logger.error(rejObj.message);
        res.json(rejObj)
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

router.get("/Gongshangbaoxian", function (req, res, next) {
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

    DanweiJitiService.Gongshangbaoxian(criteria).then((danweiJitiData) => {
        res.json(danweiJitiData)
        res.end();
    }, (rejObj) => {
        logger.error(rejObj.message);
        res.json(rejObj)
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

let downloadExcel = function (filename, danweiJitiData, res, category, criteria) {
    var currDir = path.normalize('files/download'),
        fileName = filename,
        currFile = path.join(currDir, fileName),
        fReadStream;


    excelJS.DanweiJitiToExcel(danweiJitiData, currFile, category, criteria).then((excelFilename) => {
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
}

router.get("/downloadyanglaobaoxian", function (req, res, next) {
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

    DanweiJitiService.Yanglaobaoxian(criteria).then((danweiJitiData) => {
        if (danweiJitiData.status === 200) {
            danweiJitiData = danweiJitiData.data;
            let filename = 'Yanglaobaoxian' + new Date().getTime() + '.xlsx';
            downloadExcel(filename, danweiJitiData, res, 'yanglaobaoxian', criteria);
        } else {
            logger.error("Err when get Data info: " + err);
            res.set("Content-type", "text/html");
            res.send(danweiJitiData.message);
            res.end();
            return;
        }
    }, (rejObj) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send(rejObj.message);
        res.end();
        return;
    }).catch((err) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send("不能从数据库获取工资数据!");
        res.end();
        return;
    })
})

router.get("/downloadshiyebaoxian", function (req, res, next) {
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

    DanweiJitiService.Shiyebaoxian(criteria).then((danweiJitiData) => {
        if (danweiJitiData.status === 200) {
            danweiJitiData = danweiJitiData.data;
            let filename = 'Shiyebaoxian' + new Date().getTime() + '.xlsx';
            downloadExcel(filename, danweiJitiData, res, 'shiyebaoxian', criteria);
        } else {
            logger.error("Err when get Data info: " + err);
            res.set("Content-type", "text/html");
            res.send(danweiJitiData.message);
            res.end();
            return;
        }
    }, (rejObj) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send(rejObj.message);
        res.end();
        return;
    }).catch((err) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send("不能从数据库获取工资数据!");
        res.end();
        return;
    })
})

router.get("/downloadyiliaobaoxian", function (req, res, next) {
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

    DanweiJitiService.Yiliaobaoxian(criteria).then((danweiJitiData) => {
        if (danweiJitiData.status === 200) {
            danweiJitiData = danweiJitiData.data;
            let filename = 'Yiliaobaoxian' + new Date().getTime() + '.xlsx';
            downloadExcel(filename, danweiJitiData, res, 'yiliaobaoxian', criteria);
        } else {
            logger.error("Err when get Data info: " + err);
            res.set("Content-type", "text/html");
            res.send(danweiJitiData.message);
            res.end();
            return;
        }
    }, (rejObj) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send(rejObj.message);
        res.end();
        return;
    }).catch((err) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send("不能从数据库获取工资数据!");
        res.end();
        return;
    })
})

router.get("/downloadzhufanggongjijin", function (req, res, next) {
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

    DanweiJitiService.Zhufanggongjijin(criteria).then((danweiJitiData) => {
        if (danweiJitiData.status === 200) {
            danweiJitiData = danweiJitiData.data;
            let filename = 'Zhufanggongjijin' + new Date().getTime() + '.xlsx';
            downloadExcel(filename, danweiJitiData, res, 'zhufanggongjijin', criteria);
        } else {
            logger.error("Err when get Data info: " + err);
            res.set("Content-type", "text/html");
            res.send(danweiJitiData.message);
            res.end();
            return;
        }
    }, (rejObj) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send(rejObj.message);
        res.end();
        return;
    }).catch((err) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send("不能从数据库获取工资数据!");
        res.end();
        return;
    })
})

router.get("/downloadnianjin", function (req, res, next) {
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

    DanweiJitiService.Nianjin(criteria).then((danweiJitiData) => {
        if (danweiJitiData.status === 200) {
            danweiJitiData = danweiJitiData.data;
            let filename = 'Nianjin' + new Date().getTime() + '.xlsx';
            downloadExcel(filename, danweiJitiData, res, 'nianjin', criteria);
        } else {
            logger.error("Err when get Data info: " + err);
            res.set("Content-type", "text/html");
            res.send(danweiJitiData.message);
            res.end();
            return;
        }
    }, (rejObj) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send(rejObj.message);
        res.end();
        return;
    }).catch((err) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send("不能从数据库获取工资数据!");
        res.end();
        return;
    })
})

router.get("/downloadshengyubaoxian", function (req, res, next) {
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

    DanweiJitiService.Shengyubaoxian(criteria).then((danweiJitiData) => {
        if (danweiJitiData.status === 200) {
            danweiJitiData = danweiJitiData.data;
            let filename = 'Shengyubaoxian' + new Date().getTime() + '.xlsx';
            downloadExcel(filename, danweiJitiData, res, 'shengyubaoxian', criteria);
        } else {
            logger.error("Err when get Data info: " + err);
            res.set("Content-type", "text/html");
            res.send(danweiJitiData.message);
            res.end();
            return;
        }
    }, (rejObj) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send(rejObj.message);
        res.end();
        return;
    }).catch((err) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send("不能从数据库获取工资数据!");
        res.end();
        return;
    })
})

router.get("/downloadgongshangbaoxian", function (req, res, next) {
    console.log("hereee");
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

    DanweiJitiService.Gongshangbaoxian(criteria).then((danweiJitiData) => {
        if (danweiJitiData.status === 200) {
            danweiJitiData = danweiJitiData.data;
            let filename = 'Gongshangbaoxian' + new Date().getTime() + '.xlsx';
            downloadExcel(filename, danweiJitiData, res, 'gongshangbaoxian', criteria);
        } else {
            logger.error("Err when get Data info: " + err);
            res.set("Content-type", "text/html");
            res.send(danweiJitiData.message);
            res.end();
            return;
        }
    }, (rejObj) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send(rejObj.message);
        res.end();
        return;
    }).catch((err) => {
        logger.error("Err when get Data info: " + err);
        res.set("Content-type", "text/html");
        res.send("不能从数据库获取工资数据!");
        res.end();
        return;
    })
})

module.exports = router;