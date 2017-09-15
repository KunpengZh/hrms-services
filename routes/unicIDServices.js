var express = require('express');
var router = express.Router();
var UnicID = require('../services/mysql/UnicID');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-UnicID-Controller');
logger.level = 'All';

router.get('/', function (req, res, next) {

    if (!req.query.key || req.query.key === "") {
        logger.info("Do not have key specified");
        res.json({
            status: 500,
            message: "key is mandatory requried"
        })
        res.end()
        return
    }

    let key = req.query.key;
    logger.info("To get unic Key for :" + key);
    UnicID.findOne({
        where: {
            configKey: key
        }
    }).then((qres) => {
        if (qres === null) {
            logger.info("The give Key not exist in database")
            res.json({
                status: 200,
                data: null,
                message: 'The Key you request do not exist in database'
            });
            res.end();
        } else {
            let nKey=qres.get("unicID")
            nKey=nKey+1;
            UnicID.update({
                unicID: nKey
            }, {
                    where: {
                        configKey: key
                    }
                }).then((ures) => {
                    logger.info("To return unic Key: " + nKey);
                    res.json({
                        status: 200,
                        data: nKey+'',
                        message: ''
                    });
                    res.end();
                })
        }
    })
});
module.exports = router;
