var NonRegularSalary = require('../mysql/NonRegularSalary');
var EmpBasicServices = require('../empInfoServices/EmpBasicServices');
var NRModel = require('./Model/NonRegularSalary');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-NonRegularSalary-Services');
logger.level = 'All';
const NonRegularEmployeeCategory = "非全日制人员";
var NRSS = {};

NRSS.getNRSSByCycle = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            logger.error("Error Location NonRegularS001")
            rel({
                status: 500,
                data: [],
                message: "The give salaryCycle is null,will return"
            })
            return;
        }
        NonRegularSalary.findAll({
            where: {
                salaryCycle: salaryCycle
            }
        }).then((nrssData) => {
            rel({
                status: 200,
                data: nrssData,
                message: ''
            });
        }, (err) => {
            logger.error(err);
            logger.error("Error Location NonRegularS002")
            rel({
                status: 500,
                data: [],
                message: err
            });
        }).catch((err) => {
            logger.error("Error Location NonRegularS003")
            rel({
                status: 500,
                data: [],
                message: err
            });
        })
    })
}

NRSS.InitialWithEmps = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            logger.error("Error Location NonRegularS2001")
            rel({
                status: 500,
                data: [],
                message: "The give salaryCycle is null,will return"
            })
            return;
        }
        EmpBasicServices.queryActiveByCriteria({
            workerCategory: NonRegularEmployeeCategory
        }).then(emps => {
            let processed = 0;
            if(emps.length<=0){
                rel({
                    status: 500,
                    data: [],
                    message: "没有符合条件的数据"
                });
            }
            emps.forEach(function (emp) {
                let empId = emp.empId;
                NonRegularSalary.findOne({
                    where: {
                        empId: empId,
                        salaryCycle: salaryCycle
                    }
                }).then((saData) => {
                    if (saData === null) {
                        let saData = NRModel(emp, salaryCycle);
                        NonRegularSalary.create(saData).then(creationRes => {
                            logger.info("New NonRegular Salary data created for " + emp.name + " , on Salary Cycle: " + salaryCycle);
                            processed++;
                            if (processed === emps.length) {
                                logger.info("Initial Non Regular Salary Data for Cycle:" + salaryCycle + " completed")
                                NRSS.getNRSSByCycle(salaryCycle).then(data => {
                                    rel(data);
                                }).catch((err) => {
                                    logger.error("Error Location NonRegularS2002")
                                    rel({
                                        status: 500,
                                        data: [],
                                        message: err
                                    });
                                })
                            }
                        }).catch((err) => {
                            logger.error("Error Location NonRegularS2003")
                            rel({
                                status: 500,
                                data: [],
                                message: err
                            });
                        })
                    } else {
                        processed++;
                        if (processed === emps.length) {
                            logger.info("Initial Non Regular Salary Data for Cycle:" + salaryCycle + " completed")
                            NRSS.getNRSSByCycle(salaryCycle).then(data => {
                                rel(data);
                            }).catch((err) => {
                                logger.error("Error Location NonRegularS2004")
                                rel({
                                    status: 500,
                                    data: [],
                                    message: err
                                });
                            })
                        }
                    }
                }).catch((err) => {
                    logger.error("Error Location NonRegularS2005")
                    rel({
                        status: 500,
                        data: [],
                        message: err
                    });
                })
            });
        }).catch((err) => {
            logger.error("Error Location NonRegularS2006")
            rel({
                status: 500,
                data: [],
                message: err
            });
        })
    })
}

NRSS.update = function (salaryCycle, nrssData) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < nrssData.length; i++) {
            let nrEmp = nrssData[i];
            let empId = nrEmp.empId;
            logger.info("To Update Non Regular Salary Data for : " + nrEmp.name + " on Cycle:" + salaryCycle);
            if (empId === null || empId === undefined || empId === '') {
                logger.error("The give empID is null,will skip");
                processed++;
                continue;
            }
            if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
                logger.error("The give salaryCycle is null,will return");
                logger.error("Error Location NonRegularS3001")
                rel({
                    status: 500,
                    data: [],
                    message: "The give salaryCycle is null,will return"
                })
                return;
            }


            NonRegularSalary.update(nrEmp, {
                where: {
                    empId: empId,
                    salaryCycle: salaryCycle
                }
            }).then((updateRes) => {
                processed++;
                if (processed === nrssData.length) {
                    logger.info("Update Non Regular Salary Data for Cycle:" + salaryCycle + " running completed");
                    rel({
                        status: 200,
                        data: updateRes,
                        message: ''
                    });
                }
            }, (err) => {
                logger.error("Error Location NonRegularS3002")
                rel({
                    status: 500,
                    data: [],
                    message: err
                });
            }).catch(function (err) {
                logger.error("Error Location NonRegularS3003")
                rel({
                    status: 500,
                    data: [],
                    message: err
                })
            })
        }
    })
}

NRSS.upload = function (nrDataList) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < nrDataList.length; i++) {
            let nrEmp = nrDataList[i];
            let empId = nrEmp.empId;
            let salaryCycle = nrEmp.salaryCycle;
            logger.info("To Upload Non Regular Data on Cycle:" + salaryCycle);
            if (empId === null || empId === undefined || empId === '') {
                logger.error("Error Location NonRegularS4001")
                logger.error("The give empID is null,will skip");
                processed++;
                continue;
            }
            if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
                logger.error("Error Location NonRegularS4002")
                logger.error("The give salaryCycle is null,will skip");
                processed++;
                continue;
            }

            NonRegularSalary.update(nrEmp, {
                where: {
                    empId: empId,
                    salaryCycle: salaryCycle
                }
            }).then((updateRes) => {
                processed++;
                if (processed === nrDataList.length) {
                    logger.info("Upload Non Regular Data running completed");
                    rel({
                        status: 200,
                        data: updateRes,
                        message: ''
                    });
                }
            }, (err) => {
                logger.error("Error Location NonRegularS4003")
                rel({
                    status: 500,
                    data: [],
                    message: err
                })
            }).catch(function (err) {
                logger.error("Error Location NonRegular4004")
                rel({
                    status: 500,
                    data: [],
                    message: err
                })
            })
        }
    })
}

NRSS.delete = function (empIds, salaryCycle) {
    return new Promise(function (rel, rej) {
        sequelize.query('DELETE FROM NonRegularSalaries WHERE empId IN(:empIds) and salaryCycle=:salaryCycle',
            { replacements: { empIds: empIds, salaryCycle: salaryCycle } }
        ).spread((results, metadata) => {
            rel({
                status: 200,
                data: results,
                message: ""
            })
        }).catch((err) => {
            logger.error(err);
            logger.error("Error Location NonRegularS5001")
            rel({
                status: 500,
                data: [],
                message: err
            })
        });
    })
}

module.exports = NRSS;