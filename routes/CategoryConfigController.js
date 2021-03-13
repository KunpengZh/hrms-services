var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-CategoryConfig-Controller');
logger.level = 'All';


var CategoryConfigServices = require("../services/CategoryConfig/CategoryConfig");


router.get('/', function (req, res, next) {
    CategoryConfigServices.getAllCategoryConfig().then((configs) => {
        res.json({
            status: 200,
            data: configs,
            message: ''
        })
        res.end();
    }).catch((err) => {
        logger.error("Err when get all worker category: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err when get all worker category: " + err
        });
        res.end()
    })
});


router.post('/update', function (req, res, next) {
    if (!req.body.data || !(req.body.data instanceof Array)) {
        logger.error("The posted data format is incorrect,  Arrap expected");
        res.json({
            status: 500,
            message: "The posted data format is incorrect,  Arrap expected",
            data: ''
        })
        res.end()
        return
    }

    var configs = req.body.data;

    CategoryConfigServices.updatedCategoryConfig(configs).then((workerCategories) => {
        res.json({
            status: 200,
            data: workerCategories,
            message: '保存成功'
        });
        res.end();
    }).catch((err) => {
        logger.error("Err update or create worker category document: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err update or create worker category document: " + err
        })
    });
})

router.post('/delete', function (req, res, next) {

    if (!req.body.data || !(req.body.data instanceof Array)) {
        logger.error("The posted data format is incorrect,  Arrap expected");
        res.json({
            status: 500,
            message: "The posted data format is incorrect,  Arrap expected",
            data: ''
        })
        res.end()
        return
    }

    var configKeys = req.body.data;

    logger.warn("to Delete Worker Categories for :" + JSON.stringify(configKeys));

    CategoryConfigServices.delete(configKeys).then((result) => {
        res.json({
            status: 200,
            message: "删除成功",
            data: []
        });
        res.end();
    }).catch((err) => {
        logger.error("Err when delete  Worker Categories: " + err);
        res.json({
            status: 500,
            data: [],
            message: "Err when delete  Worker Categories: " + err
        })
    });


});


module.exports = router;
