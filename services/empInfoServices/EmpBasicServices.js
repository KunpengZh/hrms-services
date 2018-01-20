var empInfo = require('../mysql/EmpInfo');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-BasicEmployee-Services');
logger.level = 'All';
var EmpBasicService = {};
var UnicID = require('../mysql/UnicID');
var SenEmpServices = require('./SensitiveEmpInfoServices');
const ActiveEmpStatus = 'Active';
var utils = require('../utils/utils');

EmpBasicService.getAllBasicEmpInfo = function () {
    return new Promise(function (rel, rej) {
        empInfo.findAll({
            where: {
                empStatus: ActiveEmpStatus
            }
        }).then((employees) => {
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

var updateWorkAge = function (emp) {
    if (emp.entryTime && emp.entryTime.length >= 8) {
        var workAge = utils.getWorkAge(emp.entryTime);
        if (workAge) {
            emp.workAge = workAge;
        }
    }
    return emp;
}

EmpBasicService.getEmpById = function (empId) {
    return new Promise(function (rel, rej) {
        empInfo.findAll({
            where: {
                empId: empId
            }
        }).then((employees) => {
            rel(employees);
        }, (err) => {
            logger.error("Error Location EmpBasicService001")
            logger.err(err);
            return null;
        }).catch((err) => {
            logger.error("Error Location EmpBasicService002")
            logger.err(err);
            return null;
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
                processed++;
                continue;
            }

            //To setup default to Active Employee
            if (!emps[i].empStatus || emps[i].empStatus === "") emps[i].empStatus = ActiveEmpStatus;

            empInfo.findOne({
                where: {
                    empId: empId
                }
            }).then((emp) => {
                if (emp === null) {
                    logger.info("To Create new Employee : " + JSON.stringify(emps[i]));
                    if (emps[i].name === null || emps[i].name === undefined || emps[i].name === '') {
                        logger.error("New Employee(without empID) name is not provided, will skip emp: " + empId);
                        processed++;
                    } else {
                        emps[i] = updateWorkAge(emps[i]);
                        empInfo.create(emps[i]).then((nemp) => {
                            logger.info("new Employee Created :" + empId);
                        }, (err) => {
                            logger.error("Error Location EmpBasicService004")
                            throw err;
                        }).then(() => {
                            logger.info("To create new Sensitive Emp Info for :" + emps[i].empId);
                            SenEmpServices.createNewSensitiveEmpInfo(empId, emps[i].name, emps[i].department, emps[i].jobRole, emps[i].workerCategory, emps[i].empStatus, emps[i].unEmpDate).then((cres) => {
                                logger.info("Sensitive Emp Info created: " + empId);
                                logger.info("Sensitive Emp Info response: " + cres);
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

                        }).catch(function (err) {
                            logger.error("Error Location EmpBasicService005")
                            throw err;
                        })
                    }
                } else {

                    emps[i] = updateWorkAge(emps[i]);

                    logger.info("To Update Employee : " + JSON.stringify(emps[i]));

                    empInfo.update(emps[i], {
                        where: {
                            empId: empId
                        }
                    }).then((nemp) => {
                        SenEmpServices.updateBasicEmpData(empId, emps[i].name, emps[i].department, emps[i].jobRole, emps[i].workerCategory, emps[i].empStatus, emps[i].unEmpDate).then(updateRes => {
                            processed++;
                            if (processed === emps.length) {
                                EmpBasicService.getAllBasicEmpInfo().then((employees) => {
                                    rel(employees);
                                }).catch((err) => {
                                    logger.error("Error Location EmpBasicService006")
                                    throw err;
                                })
                            }
                        }, err => {
                            ogger.error("Error Location EmpBasicService007, Update Sensitive Employee Data failed");
                            throw err;
                        })
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
                sequelize.query("DELETE FROM SensitiveEmpInfos WHERE empId IN(:empIds) ", { replacements: { empIds: empIds }, type: sequelize.QueryTypes.DELETE })
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

EmpBasicService.queryByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {

        if (criteria === null) criteria = {};

        let wherecase = buildWhereCase(criteria);
        let employees = [];
        sequelize.query("select * from EmpInfos" + wherecase, { type: sequelize.QueryTypes.SELECT })
            .then(sdata => {
                employees = JSON.parse(JSON.stringify(sdata));
                rel(employees);
            }, err => {
                logger.error("Error Location EmpBasicService018")
                rej(err);
            }).catch(err => {
                logger.error("Error Location EmpBasicService019")
                rej(err);
            });
    })
}

EmpBasicService.queryActiveByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {

        if (criteria === null || criteria===undefined) criteria = {};
        criteria.empStatus = ActiveEmpStatus;

        let wherecase = buildWhereCase(criteria);
        let employees = [];
        sequelize.query("select * from EmpInfos" + wherecase, { type: sequelize.QueryTypes.SELECT })
            .then(sdata => {
                employees = JSON.parse(JSON.stringify(sdata));
                rel(employees);
            }, err => {
                logger.error("Error Location EmpBasicService020")
                rej(err);
            }).catch(err => {
                logger.error("Error Location EmpBasicService021")
                rej(err);
            });
    })
}


var buildWhereCase = function (criteria) {

    let wherecase = '';
    if (criteria.workerCategory) {
        if (wherecase === '') {
            wherecase = " where workerCategory ='" + criteria.workerCategory + "'";
        } else {
            wherecase += " and workerCategory ='" + criteria.workerCategory + "'";
        }
    }

    if (criteria.NonWorkerCategory) {
        if (wherecase === '') {
            wherecase = " where workerCategory <>'" + criteria.NonWorkerCategory + "'";
        } else {
            wherecase += " and workerCategory <>'" + criteria.NonWorkerCategory + "'";
        }
    }

    if (criteria.department) {
        if (wherecase === '') {
            wherecase = " where department ='" + criteria.department + "'";
        } else {
            wherecase += " and department ='" + criteria.department + "'";
        }
    }
    if (criteria.jobRole) {
        if (wherecase === '') {
            wherecase = " where jobRole ='" + criteria.jobRole + "'";
        } else {
            wherecase += " and jobRole ='" + criteria.jobRole + "'";
        }
    }
    if (criteria.empStatus) {
        if (wherecase === '') {
            wherecase = " where empStatus ='" + criteria.empStatus + "'";
        } else {
            wherecase += " and empStatus ='" + criteria.empStatus + "'";
        }
    }


    return wherecase;
}

module.exports = EmpBasicService;