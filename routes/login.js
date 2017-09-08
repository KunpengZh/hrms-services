var express = require('express');
var router = express.Router();
var passport = require('../services/passport/passport');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Services-App');
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

module.exports = router;
