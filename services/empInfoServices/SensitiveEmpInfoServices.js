var EmpSensitiveTable = require('../mysql/SensitiveEmpInfo');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-SensitiveEmployee-Services');
logger.level = 'All';

var CoryptoEnpSen = require('./CryptoEnpSen');
var SensitiveEmpInfoModel = require('./Model/SensitiveEmpInfo');

var empInfo = require('../mysql/EmpInfo');



var SensitiveEmpService = {};

var DeleteEmpSenWithoutBasicEmpInfo = function () {
    return new Promise(function (rel, rej) {
        logger.info("Start to Clean Sensitive Employee Info table for records without an associated Basic Emp Info record");
        EmpSensitiveTable.findAll().then((employees) => {
            let processed = 0;
            employees.forEach(function (employee) {
                let empId = employee.empId;
                empInfo.findOne({
                    where: {
                        empId: empId
                    }
                }).then((emp) => {

                    if (emp === null) {
                        SensitiveEmpService.delete([empId]).then(() => {
                            processed++;
                            if (processed === employees.length) {
                                logger.info("Clean Sensitive Emp Info without basic employee info completed");
                                rel(true);
                            }
                        })
                    } else {
                        processed++;
                        if (processed === employees.length) {
                            logger.info("Clean Sensitive Emp Info without basic employee info completed");
                            rel(true);
                        }
                    }
                })
            })
        }, (err) => {
            logger.error("Error Location SensitiveEmpService091")
            throw err;
        }).catch((err) => {
            logger.error("Error Location SensitiveEmpService092")
            throw err;
        })
    })
}

SensitiveEmpService.SyncEmpSensitiveInfo = function () {
    return new Promise(function (rel, rej) {
        empInfo.findAll().then((basicemps) => {
            let processed = 0;
            basicemps.forEach(function (basicemp) {
                let empId = basicemp.empId, name = basicemp.name;

                EmpSensitiveTable.findOne({
                    where: {
                        empId: empId
                    }
                }).then((emp) => {
                    if (emp === null) {
                        logger.info("Sync Sensitive Employe: to create new sensitive info for :" + empId + " , name:" + name);
                        SensitiveEmpService.createNewSensitiveEmpInfo(empId, name).then(() => {
                            logger.info("Sensitive Emp Info created: " + empId + " , name: " + name);
                            processed++;
                            if (processed === basicemps.length) {
                                logger.info("SyncEmpSensitiveInfo running completed");
                                DeleteEmpSenWithoutBasicEmpInfo().then(() => {
                                    rel(true)
                                }).catch((err) => {
                                    logger.error("Error Location SensitiveEmpService058")
                                    throw err;
                                })
                            }
                        }).catch((err) => {
                            logger.error("Error Location SensitiveEmpService051")
                            logger.error("Failed to create Employee Sensitive Infor for :" + empId + ", name: " + name);
                            throw err;
                        })
                    } else {
                        logger.info("Sync Sensitive Employe: to Update new sensitive info for :" + empId + " , name:" + name);
                        EmpSensitiveTable.update({
                            name: name
                        }, {
                                where: {
                                    empId: empId
                                }
                            }).then((nemp) => {
                                logger.info("Sensitive Emp Info updated: " + empId + " , name: " + name);
                                processed++;
                                if (processed === basicemps.length) {
                                    logger.info("SyncEmpSensitiveInfo running completed");
                                    DeleteEmpSenWithoutBasicEmpInfo().then(() => {
                                        rel(true)
                                    }).catch((err) => {
                                        logger.error("Error Location SensitiveEmpService058")
                                        throw err;
                                    })
                                }
                            }, (err) => {
                                logger.error("Error Location SensitiveEmpService052")
                                logger.error("Failed to update Employee Sensitive Infor for :" + empId + ", name: " + name);
                                throw err;
                            }).catch(function (err) {
                                logger.error("Error Location SensitiveEmpService053")
                                logger.error("Failed to create Employee Sensitive Infor for :" + empId + ", name: " + name);
                                throw err;
                            })
                    }
                }, (err) => {
                    logger.error("Error Location SensitiveEmpService054")
                    logger.error("Failed to find Employee Sensitive Infor for :" + empId + ", name: " + name);
                    throw err;
                }).catch((err) => {
                    logger.error("Error Location SensitiveEmpService055")
                    logger.error("Failed to find Employee Sensitive Infor for :" + empId + ", name: " + name);
                    throw err;
                })
            });
        }, (err) => {
            logger.error("Error Location SensitiveEmpService056")
            logger.error("Failed to all basic Emmployee info");
            throw err;
        }).catch((err) => {
            logger.error("Error Location SensitiveEmpService057")
            logger.error("Failed to all basic Emmployee info");
            throw err;
        })


    })
}

SensitiveEmpService.getAllSensitiveEmpInfo = function () {
    return new Promise(function (rel, rej) {
        EmpSensitiveTable.findAll().then((employees) => {

            rel(CoryptoEnpSen.DeEncrypteEmps(employees));

        }, (err) => {
            logger.error("Error Location SensitiveEmpService001")
            throw err;
        }).catch((err) => {
            logger.error("Error Location SensitiveEmpService002")
            throw err;
        })
    })
}
SensitiveEmpService.createNewSensitiveEmpInfo = function (empId, name) {
    return new Promise(function (rel, rej) {

        if (null === empId || empId === undefined || empId === '' || null === name || name === undefined || name === '') {
            logger.error("Employee ID and Employee Name is mandatory required");
            rel(false);
        }

        EmpSensitiveTable.findOne({
            where: {
                empId: empId
            }
        }).then((emp) => {
            if (emp === null) {
                logger.info("To Create new Sensitive Employee : " + empId);
                let newEmp = CoryptoEnpSen.EncrypteEmps(SensitiveEmpInfoModel(empId, name));
                EmpSensitiveTable.create(newEmp).then((nemp) => {
                    logger.info("new Sensitive Emp Info be created");
                    rel(true);
                }, (err) => {
                    logger.error("Error Location SensitiveEmpService021")
                    throw err;
                }).catch(function (err) {
                    logger.error("Error Location SensitiveEmpService022")
                    throw err;
                })
            } else {
                logger.error("Error Location SensitiveEmpService023")
                logger.error("The give Emp ID already exist :" + empId);
                rel(false)
            }
        }, (err) => {
            logger.error("Error Location SensitiveEmpService024")
            throw err;
        }).catch(function (err) {
            logger.error("Error Location SensitiveEmpService025")
            throw err;
        })
    })
}


SensitiveEmpService.updatedSensitiveEmpInfo = function (emps) {
    return new Promise(function (rel, rej) {
        rel(updatedSensitiveEmpInfo(CoryptoEnpSen.EncrypteEmps(emps)));
    }).catch(function (err) {
        logger.error("Error Location SensitiveEmpService012")
        throw err;
    })
}

updatedSensitiveEmpInfo = function (emps) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < emps.length; i++) {
            let empId = emps[i].empId;
            delete emps[i].name;
            logger.info("To Update Employee : " + empId);
            if (empId === null || empId === undefined || empId === '') {
                logger.error("The give empID is null,will skip");
                processed++;
                continue;
            }
            EmpSensitiveTable.update(emps[i], {
                where: {
                    empId: empId
                }
            }).then((nemp) => {
                processed++;
                if (processed === emps.length) {
                    logger.info("Update Sensitive Employee Info running completed");
                    rel(true)
                }
            }, (err) => {
                logger.error("Error Location SensitiveEmpService007")
                throw err;
            }).catch(function (err) {
                logger.error("Error Location SensitiveEmpService008")
                throw err;
            })
        }
    })
}
SensitiveEmpService.delete = function (empIds) {
    return new Promise(function (rel, rej) {
        sequelize.query('DELETE FROM SensitiveEmpInfos WHERE empId IN(:empIds) ',
            { replacements: { empIds: empIds } }
        ).spread((results, metadata) => {
            rel(results);
        }).catch((err) => {
            logger.error("Error Location SensitiveEmpService011")
            throw err;
        });
    })
}




// SensitiveEmpService.xxx = function () {
//     return new Promise(function (rel, rej) {

//     })
// }


module.exports = SensitiveEmpService;