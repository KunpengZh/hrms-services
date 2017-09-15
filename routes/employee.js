var express = require('express');
var router = express.Router();
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Employee-Controller');
logger.level = 'All';

var fs = require('fs');
var multiparty = require('multiparty');
var path = require('path');

var EmpServices = require("../services/empInfoServices/empBasicServices");

var excelJS = require('../services/utils/exceljs');


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


});

router.get('/downloadempbasicinfo', function (req, res, next) {

  EmpServices.getAllBasicEmpInfo().then((emps) => {

    var currDir = path.normalize('files/download'),
      fileName = 'EmployeeBasicInfo_' + Date.parse(new Date()) + '.xlsx',
      currFile = path.join(currDir, fileName),
      fReadStream;
    

    excelJS.EmpBasicInfoToExcel(emps, currFile).then((excelFilename) => {
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
      logger.error("Transfer Employee Information to Excel file failed")
      logger.error(err);
      res.set("Content-type", "text/html");
      res.send("生成excel文件失败");
      res.end();
    })

  }).catch((err) => {
    logger.error("Err when get all emp info: " + err);
    res.set("Content-type", "text/html");
    res.send("不能从数据库获取基本员工信息!");
    res.end();
    return;
  })

})

router.post('/uploadempbasicinfo', function (req, res, next) {

  logger.info('uploading Employee Basic Information');

  logger.info("To Parse Form.....")
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
              logger.info("To transfer excel to JSON and save to database.......")
              excelJS.EmpInfoToJSON(dstPath).then((ures) => {
                res.json({
                  status: 200,
                  message: "upload successed"
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




module.exports = router;
