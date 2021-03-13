var CryptoJS = require('../utils/cryptojs');
var secret = require('../Config/AppConfig.json').EncSecret;

const columns = ['idCard', 'birthday', 'bankAccount'];

exports.EncrypteEmps = function (emps) {
    if (!(emps instanceof Array)) {
        columns.forEach(function (item) {
            emps[item] = CryptoJS.getEncAse192(emps[item] ? emps[item] : '', secret)
        })

        return emps;

    } else {

        emps = emps.map(function (emp, index) {
            columns.forEach(function (item) {
                emp[item] = CryptoJS.getEncAse192(emp[item] ? emp[item] : '', secret)
            })
            return emp;
        })

        return emps
    }

}

exports.DeEncrypteEmps = function (emps) {
    if (!(emps instanceof Array)) {
        columns.forEach(function (item) {
            emps[item] = CryptoJS.getEncAse192(emps[item], secret)
        })

        return emps;

    } else {
        emps = emps.map(function (emp, index) {
            columns.forEach(function (item) {
                emp[item] = CryptoJS.getDecAse192(emp[item], secret)
            })
            return emp;
        })

        return emps;
    }
}