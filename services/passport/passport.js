var passport = require('passport');
var UserModel = require('../mysql/User');
var localStategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    UserModel.User.findOne({ where: { id: id } }).then(user => {
        if (null !== user) {
            done(null, user);
        } else {
            done("User does not exist", null)
        }
    })
});

passport.use('local.signup', new localStategy({
    passReqToCallback: true  //此处为true，下面函数的参数才能有req
}, function (req, username, password, done) {
    req.checkBody('username', '您输入的username无效').notEmpty().isLength({ min: 4 });
    req.checkBody('password', "您输入了无效密码").notEmpty().isLength({ min: 8 });

    var errors = req.getValidationResult();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, messages);
    }

    UserModel.User.findOne({
        where: { username: username },
    }).then(user => {
        if (user) {
            return done(null, false, "此用户名已经被注册");
        }

        UserModel.User.create(
            {
                username: username,
                empId: 'HRMSAdmin',
                empName: 'HRMS System Administrator',
                username: 'HRMSAdmin',
                password: 'mypassword',
                jobRole: 'SysAdmin'
            }).then((newUser) => {
                return done(null, newUser);
            })
    })
}));

passport.use('local.login', new localStategy({
    passReqToCallback: true
}, function (req, username, password, done) {

    req.checkBody('username', '您输入的username无效').notEmpty();
    req.checkBody('password', "您输入了无效密码").notEmpty();

    req.getValidationResult().then((validateRes) => {
        var errors = validateRes.array();

        if (errors && errors.length > 0) {
            var messages = [];
            errors.forEach(function (error) {
                messages.push(error.msg);
            });
            return done(null, false, messages);
        }
        
        UserModel.User.findOne({
            where: { username: username },
        }).then(user => {
            if (!user) {
                return done(null, false, "用户名错误!");
            }
            if (!UserModel.validPassword(password, user.get('password'))) {
                return done(null, false, "密码错误!");
            }
            return done(null, user);
        })
    });
}));

module.exports = passport;