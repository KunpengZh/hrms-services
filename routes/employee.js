var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Employee-Controller');
logger.level = 'All';

var EmpServices = require("../services/empInfoServices/empBasicServices");


/* GET home page. */
router.get('/', function (req, res, next) {
  EmpServices.getAllBasicEmpInfo().then((emps) => {
    res.json({
      status: 200,
      data: emps,
      message: ''
    })
    res.end();
  }).catch((err) => {
    logger.error("Err when get all emp info: " + err);
    res.json({
      status: 500,
      data: [],
      message: "Err when get all emp info: " + err
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

  var emps = req.body.data;

  EmpServices.updatedBasicEmpInfo(emps).then((employees) => {
    res.json({
      status: 200,
      data: employees,
      message: '保存成功'
    });
    res.end();
  }).catch((err) => {
    logger.error("Err update or create employee basic information: " + err);
    res.json({
      status: 500,
      data: [],
      message: "Err update or create employee basic information: " + err
    })
  });
})

router.post('/delete', function (req, res, next) {
  console.log(req.body.data);
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

  var empIds = req.body.data;
  logger.warn("to Delete Empyees for :" + JSON.stringify(empIds));

  EmpServices.delete(empIds).then((result) => {
    res.json({
      status: 200,
      message: "删除成功",
      data: []
    });
    res.end();
  }).catch((err) => {
    logger.error("Err when delete employee basic information: " + err);
    res.json({
      status: 500,
      data: [],
      message: "Err uwhen delete employee basic information: " + err
    })
  });


})




module.exports = router;
