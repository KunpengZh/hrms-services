var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Services-App');
logger.level = 'All';
var validator = require('express-validator');

var passport = require('passport');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var dbconfig = require('./services/mysql/dbconfig.json');
var options = {
  host: dbconfig.hostname,
  port: 3306,
  user: dbconfig.username,
  password: dbconfig.password,
  database: dbconfig.database
};

var sessionStore = new MySQLStore(options);;

var login = require('./routes/login');
var empController = require('./routes/employee');
var appconfig = require('./routes/appconfig');
var unicKey = require('./routes/unicIDServices');
var SensitiveEmployeeInfoController = require('./routes/EmpSensitiveInfoController');
var CategoryConfigController = require('./routes/CategoryConfigController');
var OTController = require('./routes/EmpOTController');
var SalaryDetailsController = require('./routes/SalaryDetailsController');
var GongziDanController = require("./routes/GongZidanController");
var UserManagementController = require('./routes/UserManagementController');
var NonRegularSalayController = require('./routes/NonRegularSalaryController');
var DanweiJitiController = require('./routes/DanweiJitiController');
var PayrollQueryController = require('./routes/PayrollQueryController');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(validator());

app.use(session({
  key: 'session_cookie_name',
  secret: 'sessioncookiesecret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 180 * 60 * 1000 } //store保存时间
}));

//对session操作的模块，应在session实例下面

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));


app.use('/login', login);



app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.json({ "message": "Please Login first", status: 401 });
    res.end();
    return;
  }
})

app.use('/emp', empController);
app.use('/getUnicKey', unicKey);
app.use('/AppConfig', appconfig);
app.use('/nonregular', NonRegularSalayController);


app.use('/empsen', checkIsHRAdmin)
app.use('/empsen', SensitiveEmployeeInfoController);


app.use('/ot', checkIsHRAdmin);
app.use('/ot', OTController);



app.use('/categoryConfig', checkIsPayrollAdmin);
app.use('/categoryConfig', CategoryConfigController);

app.use('/sdd', checkIsPayrollAdmin);
app.use('/sdd', SalaryDetailsController);

app.use('/gongzidan', checkIsPayrollAdmin);
app.use('/gongzidan', GongziDanController);

app.use('/danweijiti', checkIsPayrollAdmin);
app.use('/danweijiti', DanweiJitiController);

app.use('/payrollquery', checkIsPayrollAdmin);
app.use('/payrollquery', PayrollQueryController);

app.use('/appuser', checkIsSysAdmin);
app.use('/appuser', UserManagementController);



app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});


function checkIsHRAdmin(req, res, next) {
  if (req.user.jobRole === 'SysAdmin' || req.user.jobRole === "HRAdmin") {
    return next()
  } else {
    logger.error("你没有权限访问此模块, HRAdmin")
    res.json({
      status: 401,
      message: "你没有权限访问此模块",
      data: []
    })
  }
}

function checkIsPayrollAdmin(req, res, next) {
  if (req.user.jobRole === 'SysAdmin' || req.user.jobRole === "PayrollAdmin") {
    return next()
  } else {
    logger.error("你没有权限访问此模块, PayrollAdmin")
    res.json({
      status: 401,
      message: "你没有权限访问此模块",
      data: []
    })
  }
}

function checkIsSysAdmin(req, res, next) {
  if (req.user.jobRole === 'SysAdmin') {
    return next()
  } else {
    logger.error("你没有权限访问此模块, SysAdmin")
    res.json({
      status: 401,
      message: "你没有权限访问此模块",
      data: []
    })
  }
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.json({ status: 500, message: err.message });
  res.end();
});

module.exports = app;
