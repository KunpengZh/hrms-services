var moment = require('moment');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Util');
logger.level = 'All';


exports.getBrithdayFromUUID = function (uuid) {
    var birthdayStr;
    console.log(uuid.length);
    if (uuid.length === 18) {
        birthdayStr = uuid.substring(6, 14)
    } else if (uuid.length === 15) {
        birthdayStr = uuid.substring(6, 12)
        birthdayStr = "19" + birthdayStr
    } else {
        logger.error("错误的身份证号码，请核对！");
        return false;
    }
    var birthday = birthdayStr.substring(0, 4) + "-" + birthdayStr.substring(4, 6) + "-" + birthdayStr.substring(6, 8)
    return birthday
}

exports.getAgeFromUUID = function (uuid) {
    var birthdayYear, birthdayMonth, birthdayDay;
    var bitthdayStr;
    if (uuid.length === 18) {
        birthdayStr = uuid.substring(6, 14)
    } else if (uuid.length === 15) {
        birthdayStr = uuid.substring(6, 12)
        birthdayStr = "19" + birthdayStr
    } else {
        logger.error("错误的身份证号码，请核对！");
        return false;
    }
    birthdayYear = birthdayStr.substring(0, 4);
    birthdayMonth = birthdayStr.substring(4, 6);
    birthdayDay = birthdayStr.substring(6, 8);

    var dateNow = new Date();
    var month = dateNow.getMonth() + 1;
    var day = dateNow.getDate();
    var year = dateNow.getFullYear();

    var age = year - birthdayYear - 1;
    if (birthdayMonth < month || birthdayMonth == month && birthdayDay <= day) {
        age++;
    }
    return age;
}

exports.getWorkAge = function (entryTime) {
    entryTime = moment(entryTime);
    if (entryTime.isValid()) {
        var entryYear = entryTime.get('year');
        var entryMonth = entryTime.get('month');
        var entryDay = entryTime.get('date');
        var dateNow = moment();
        var month = dateNow.get('month');
        var day = dateNow.get('date');
        var year = dateNow.get('year');
        var workage = year - entryYear - 1;
        if (entryMonth < month || entryMonth == month && entryDay <= day) {
            workage++;
        }
        return workage;
    } else {
        return false;
    }

}
