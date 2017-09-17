var empInfo = require('../mysql/EmpInfo');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-BasicEmployee-Services');
logger.level = 'All';
var EmpBasicService = {};
var UnicID = require('../mysql/UnicID');
var SenEmpServices = require('./SensitiveEmpInfoServices');

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

/**
 * This functions is for data coming from UI , it will update exist employee info and create new employee records
 */

EmpBasicService.updatedBasicEmpInfo = function (emps) {
    return new Promise(function (rel, rej) {
        var processed = 0;

        for (let i = 0; i < emps.length; i++) {
            let empId = emps[i]["empId"];
            if (empId === null || empId === undefined || empId === '') {
                logger.error("Employee ID is not provided , will skip emp: " + JSON.stringify(emps[i]));
                continue;
            }
            empInfo.findOne({
                where: {
                    empId: empId
                }
            }).then((emp) => {
                if (emp === null) {
                    logger.info("To Create new Employee : " + JSON.stringify(emps[i]));
                    if (emps[i].name === null || emps[i].name === undefined || emps[i].name === '') {
                        logger.error("New Employee(without empID) name is not provided, will skip emp: " + empId);
                    } else {
                        empInfo.create(emps[i]).then((nemp) => {
                            logger.info("new Employee Created :" + empId);
                        }, (err) => {
                            logger.error("Error Location EmpBasicService004")
                            throw err;
                        }).then(() => {
                            logger.info("To create new Sensitive Emp Info for :" + emps[i].empId);
                            SenEmpServices.createNewSensitiveEmpInfo(empId, emps[i].name).then((cres) => {
                                logger.info("Sensitive Emp Info created: " + empId);
                                logger.info("Sensitive Emp Info response: " + cres);
                            }).catch(function (err) {
                                logger.error("Error Location EmpBasicService032")
                                logger.error("failed to create Sensitive EmpInfo, will delete the exist employee basic info");
                                EmpBasicService.delete([empId]).then((delres) => {
                                    logger.info("Basic Employee Info deleted for :" + empId)
                                }).catch((derr) => {
                                    logger.error("Error Location EmpBasicService033")
                                    throw derr;
                                })
                                throw (err);
                            })
                            processed++;
                            if (processed === emps.length) {
                                EmpBasicService.getAllBasicEmpInfo().then((employees) => {
                                    rel(employees);
                                }).catch((err) => {
                                    logger.error("Error Location EmpBasicService003")
                                    throw err;
                                })
                            }
                        }).catch(function (err) {
                            logger.error("Error Location EmpBasicService005")
                            throw err;
                        })
                    }
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
        logger.info("To delete Basic Employee Info.....")
        sequelize.query("DELETE FROM EmpInfos WHERE empId IN(:empIds) ", { replacements: { empIds: empIds }, type: sequelize.QueryTypes.DELETE })
            .then((delres) => {
                logger.info("Basic Emp Info deleted for :" + JSON.stringify(empIds));
                logger.info("Deletion Response: " + delres);

            }).then(() => {
                logger.info("To delete Sensitive Employee Info......")
                sequelize.query("DELETE FROM SensitiveEmpInfo WHERE empId IN(:empIds) ", { replacements: { empIds: empIds }, type: sequelize.QueryTypes.DELETE })
            }).then((delres) => {
                logger.info("Sensitive Emp Info deleted for :" + JSON.stringify(empIds));
                logger.info("Deletion Response: " + delres);
            }).catch((err) => {
                logger.error("Error Location EmpBasicService011")
                throw err;
            });
        // sequelize.query('DELETE FROM EmpInfos WHERE empId IN(:empIds) ',
        //     { replacements: { empIds: empIds } }
        // ).spread((results, metadata) => {
        //     rel(results);
        // }).catch((err) => {
        //     logger.error("Error Location EmpBasicService011")
        //     throw err;
        // });
    })
}


/**
 * The data come from excel, possible to include new employees which do not have a empId assigned
 */


EmpBasicService.uploadEmpInfoFromExcel = function (emps) {
    return new Promise(function (rel, rej) {
        UnicID.findOne({
            where: {
                configKey: 'EmpID'
            }
        }).then((EmpUnicIDDoc) => {
            let oriEmpUnicKey = EmpUnicIDDoc.get("unicID");
            let EmpUnicKey = oriEmpUnicKey;
            for (let i = 0; i < emps.length; i++) {
                if (!emps[i].empId || emps[i].empId.trim() === "") {
                    EmpUnicKey = EmpUnicKey + 1;
                    emps[i].empId = EmpUnicKey;
                }
            }
            if (EmpUnicKey !== oriEmpUnicKey) {
                UnicID.update({
                    unicID: EmpUnicKey
                }, {
                        where: {
                            configKey: 'EmpID'
                        }
                    }).then((ures) => {
                        logger.info("Employee Unic ID updated back to database : " + EmpUnicKey);
                    }, (err) => {
                        logger.error("Error Location EmpBasicService012")
                        throw err;
                    }).catch(function (err) {
                        logger.error("Error Location EmpBasicService013")
                        throw err;
                    })
            }
            EmpBasicService.updatedBasicEmpInfo(emps).then((employees) => {
                rel({
                    status: 200,
                    message: "上传保存到数据库成功"
                })
            }).catch((err) => {
                logger.error("Error Location EmpBasicService014")
                throw err;
            });
        }, (err) => {
            logger.error("Error Location EmpBasicService015")
            throw err;
        }).catch(function (err) {
            logger.error("Error Location EmpBasicService016")
            throw err;
        })
    })
}


module.exports = EmpBasicService;