var empInfo = require('../mysql/EmpInfo');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-BasicEmployee-Services');
logger.level = 'All';
var EmpBasicService = {};
//var Promise = require('bluebird');

EmpBasicService.getAllBasicEmpInfo = function () {
    return new Promise(function (rel, rej) {
        empInfo.findAll().then((employees) => {
            rel(employees);
        }, (err) => {
            logger.error("Error Location EmpBasicService001")
            throw err;
        }).catch((err) => {
            logger.error("Error Location EmpBasicService002")
            throw err;
        })
    })
}

EmpBasicService.updatedBasicEmpInfo = function (emps) {
    return new Promise(function (rel, rej) {
        var processed = 0;

        for (let i = 0; i < emps.length; i++) {
            let empId = emps[i]["empId"];
            empInfo.findOne({
                where: {
                    empId: empId
                }
            }).then((emp) => {
                if (emp === null) {
                    logger.info("To Create new Employee : " + JSON.stringify(emps[i]));
                    empInfo.create(emps[i]).then((nemp) => {
                        processed++;
                        if (processed === emps.length) {
                            EmpBasicService.getAllBasicEmpInfo().then((employees) => {
                                rel(employees);
                            }).catch((err) => {
                                logger.error("Error Location EmpBasicService003")
                                throw err;
                            })
                        }
                    }, (err) => {
                        logger.error("Error Location EmpBasicService004")
                        throw err;
                    }).catch(function (err) {
                        logger.error("Error Location EmpBasicService005")
                        throw err;
                    })
                } else {
                    logger.info("To Update Employee : " + JSON.stringify(emps[i]));
                    empInfo.update(emps[i], {
                        where: {
                            empId: empId
                        }
                    }).then((nemp) => {
                        processed++;
                        if (processed === emps.length) {
                            EmpBasicService.getAllBasicEmpInfo().then((employees) => {
                                rel(employees);
                            }).catch((err) => {
                                logger.error("Error Location EmpBasicService006")
                                throw err;
                            })
                        }

                    }, (err) => {
                        logger.error("Error Location EmpBasicService007")
                        throw err;
                    }).catch(function (err) {
                        logger.error("Error Location EmpBasicService008")
                        throw err;
                    })
                }
            }, (err) => {
                logger.error("Error Location EmpBasicService009")
                throw err;
            }).catch(function (err) {
                logger.error("Error Location EmpBasicService010")
                throw err;
            })
        }
    })
}
EmpBasicService.delete = function (empIds) {
    return new Promise(function (rel, rej) {
        sequelize.query('DELETE FROM EmpInfos WHERE empId IN(:empIds) ',
            { replacements: { empIds: empIds }}
        ).spread((results, metadata) => {
            rel(results);
        }).catch((err) => {
            logger.error("Error Location EmpBasicService011")
            throw err;
        });
    })
}




// EmpBasicService.xxx = function () {
//     return new Promise(function (rel, rej) {

//     })
// }


module.exports = EmpBasicService;