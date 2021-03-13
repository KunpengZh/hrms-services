var EmpSensitiveTable = require('../mysql/SensitiveEmpInfo');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-SensitiveEmployee-Services');
logger.level = 'All';

var CoryptoEnpSen = require('./CryptoEnpSen');
var SensitiveEmpInfoModel = require('./Model/SensitiveEmpInfo');
var utils = require('../utils/utils');
var empInfo = require('../mysql/EmpInfo');

const ActiveEmpStatus = 'Active';
const NonRegularEmployeeCategory = "非全日制人员";
const ColumnsNotEditableForNonRegularEmp = [
    "jinengGongzi",
    "gangweiGongzi",
    "jichuButie",
    "xilifei",
    "gonglingGongzi",
    "zhiwuJintie",
    "gongliBuzhu",
    "kaoheJiangjin",
    "tongxunButie",
    "qitaJiangjin",
    "xiaxiangBuzhu",
    "yingyetingBuzhu",
    "buchongyiliaobaoxian"];


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

var buildUpdateSql = function () {
    let sql = "update SensitiveEmpInfos set ";

    ColumnsNotEditableForNonRegularEmp.forEach(function (propName, index) {
        if (index === 0) {
            sql += propName + "=''";
        } else {
            sql += " , " + propName + "=''";
        }

    })

    sql += "where workerCategory='" + NonRegularEmployeeCategory + "'";

    return sql;
}

var updateForNonRegularEmp = function () {
    return new Promise(function (rel, rej) {
        logger.info("Start to update employee Sensitive Table for non-regular employees");
        let sql = buildUpdateSql();

        sequelize.query(sql, { type: sequelize.QueryTypes.UPDATE })
            .then(sdata => {
                logger.info(JSON.stringify(sdata));
                rel(true);
            }, err => {
                logger.error("Error Location SensitiveEmpService013")
                rej(err);
            }).catch(err => {
                logger.error("Error Location SensitiveEmpService014")
                rej(err);
            });

    })
}

SensitiveEmpService.SyncEmpSensitiveInfo = function () {
    return new Promise(function (rel, rej) {
        empInfo.findAll().then((basicemps) => {
            let processed = 0;
            basicemps.forEach(function (basicemp) {
                let empId = basicemp.empId,
                    name = basicemp.name,
                    department = basicemp.department,
                    jobRole = basicemp.jobRole,
                    workerCategory = basicemp.workerCategory,
                    empStatus = basicemp.empStatus,
                    unEmpDate = basicemp.unEmpDate;
                EmpSensitiveTable.findOne({
                    where: {
                        empId: empId
                    }
                }).then((emp) => {
                    if (emp === null) {
                        logger.info("Sync Sensitive Employe: to create new sensitive info for :" + empId + " , name:" + name);
                        SensitiveEmpService.createNewSensitiveEmpInfo(empId, name, department, jobRole, workerCategory, empStatus, unEmpDate).then(() => {
                            logger.info("Sensitive Emp Info created: " + empId + " , name: " + name);
                            processed++;
                            if (processed === basicemps.length) {
                                logger.info("SyncEmpSensitiveInfo running completed");
                                DeleteEmpSenWithoutBasicEmpInfo().then(() => {
                                    updateForNonRegularEmp().then(() => {
                                        rel(true)
                                    }, err => {
                                        logger.error("Error Location SensitiveEmpService058, Failed update Non-Regular Employee");
                                        throw err;
                                    })
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
                            name: name,
                            department: department,
                            jobRole: jobRole,
                            workerCategory: workerCategory,
                            empStatus:empStatus,
                            unEmpDate:unEmpDate
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
                                        updateForNonRegularEmp().then(() => {
                                            rel(true)
                                        }, err => {
                                            logger.error("Error Location SensitiveEmpService058, Failed update Non-Regular Employee");
                                            throw err;
                                        })
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
        EmpSensitiveTable.findAll({
            where: {
                empStatus: ActiveEmpStatus
            }
        }).then((employees) => {

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
SensitiveEmpService.createNewSensitiveEmpInfo = function (empId, name, department, jobRole, workerCategory, empStatus, unEmpDate) {
    return new Promise(function (rel, rej) {

        if (null === empId || empId === undefined || empId === '' || null === name || name === undefined || name === '') {
            logger.error("Employee ID and Employee Name is mandatory required");
            rel(false);
        }
        empStatus = empStatus ? empStatus : ActiveEmpStatus;
        unEmpDate = unEmpDate ? unEmpDate : '';

        EmpSensitiveTable.findOne({
            where: {
                empId: empId
            }
        }).then((emp) => {
            if (emp === null) {
                logger.info("To Create new Sensitive Employee : " + empId);
                let newEmp = CoryptoEnpSen.EncrypteEmps(SensitiveEmpInfoModel(empId, name, department, jobRole, workerCategory, empStatus, unEmpDate));
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
        emps = emps.map(function (emp, index) {
            emp = updateBirthdayAndAge(emp);
            return emp;
        })
        rel(updatedSensitiveEmpInfo(CoryptoEnpSen.EncrypteEmps(emps)));
    }).catch(function (err) {
        logger.error("Error Location SensitiveEmpService012")
        throw err;
    })
}

var updateBirthdayAndAge = function (emp) {
    if (emp.idCard && emp.idCard.length >= 15) {
        var birthday = utils.getBrithdayFromUUID(emp.idCard);
        var age = utils.getAgeFromUUID(emp.idCard);
        if (birthday) emp.birthday = birthday;
        if (age) emp.age = age;
    }
    return emp;
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
                    updateForNonRegularEmp().then(() => {
                        rel(true)
                    }, err => {
                        logger.error("Error Location SensitiveEmpService007, Failed update Non-Regular Employee");
                        throw err;
                    })
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

SensitiveEmpService.queryByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {
        // if (!criteria || JSON.stringify(criteria) === '{}') {
        //     logger.error("Error Location SensitiveEmpService012")
        //     rej(new Error("Please provide criteria"));
        //     return;
        // }
        if (criteria === null) criteria = {};
        let wherecase = buildWhereCase(criteria);
        let employees = [];
        sequelize.query("select * from SensitiveEmpInfos" + wherecase, { type: sequelize.QueryTypes.SELECT })
            .then(sdata => {
                employees = JSON.parse(JSON.stringify(CoryptoEnpSen.DeEncrypteEmps(sdata)));
                rel(employees);
            }, err => {
                logger.error("Error Location SensitiveEmpService013")
                rej(err);
            }).catch(err => {
                logger.error("Error Location SensitiveEmpService014")
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
    if(criteria.empStatus){
        if (wherecase === '') {
            wherecase = " where empStatus ='" + criteria.empStatus + "'";
        } else {
            wherecase += " and empStatus ='" + criteria.empStatus + "'";
        }
    }
    return wherecase;
}


SensitiveEmpService.updateBasicEmpData = function (empId, empName, department, jobRole, workerCategory, empStatus, unEmpDate) {
    return new Promise(function (rel, rej) {
        let emp = {
            empName: empName ? empName : '',
            department: department ? department : '',
            jobRole: jobRole ? jobRole : '',
            workerCategory: workerCategory ? workerCategory : '',
            empStatus: empStatus ? empStatus : ActiveEmpStatus,
            unEmpDate: unEmpDate ? unEmpDate : ''
        }
        EmpSensitiveTable.update(emp, {
            where: {
                empId: empId
            }
        }).then((nemp) => {
            rel(true)
        }, (err) => {
            logger.error("Error Location SensitiveEmpService007")
            rej(err)
        }).catch(function (err) {
            logger.error("Error Location SensitiveEmpService008")
            rej(err)
        })
    })
}

SensitiveEmpService.getEmpById = function (empId) {
    return new Promise(function (rel, rej) {
        EmpSensitiveTable.findOne({
            where: {
                empId: empId
            }
        }).then((employees) => {
            rel(employees);
        }, (err) => {
            logger.error("Error Location SensitiveEmpService0018")
            logger.err(err);
            return null;
        }).catch((err) => {
            logger.error("Error Location SensitiveEmpService0019")
            logger.err(err);
            return null;
        })
    })
}




module.exports = SensitiveEmpService;