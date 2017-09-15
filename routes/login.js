var express = require('express');
var router = express.Router();
var passport = require('../services/passport/passport');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-LOGIN-Controller');
logger.level = 'All';

/* GET users listing. */

router.post('/', function (req, res, next) {
  passport.authenticate('local.login', function (err, user, info) {

    if (err) {
      return next(err);
    }

    if (!user) {
      logger.error(info);
      res.json(info);
      res.end();
    } else {

      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        res.json({
          "username": user.get('username'),
          "isAuthenticated": true,
          "jobRole": user.get('jobRole'),
          "empId": user.get('empId'),
          "empName": user.get('empName')
        });

        res.end();
      });
    }

  })(req, res, next);
});
router.get('/isAuthenticated', function (req, res, next) {
  if (req.isAuthenticated()) {
    res.json({
      "username": req.user.username,
      "isAuthenticated": true,
      "jobRole": req.user.jobRole,
      "empId": req.user.empId,
      "empName": req.user.empName
    });
    res.end();
  } else {
    res.json({
      isAuthenticated: false
    });
    res.end();
  }

});

module.exports = router;
