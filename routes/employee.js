var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Employee-Controller');
logger.level = 'All';

var empInfo = require('../services/mysql/EmpInfo');

/* GET home page. */
router.get('/', function (req, res, next) {
  empInfo.findAll().then(employees => {
    res.json({
      status: 200,
      data: employees
    });
    res.end();
  })
});


module.exports = router;
