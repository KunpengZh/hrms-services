var EmpOT = require('../mysql/EmpOT');
var EmpBasicServices = require('../empInfoServices/EmpBasicServices');
var EmpOTMOdel = require('./Model/EmpOT');
var empInfo = require('../mysql/EmpInfo');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-EmpOT-Services');
logger.level = 'All';
const NonRegularEmployeeCategory = "非全日制人员";
//var CategoryConfigModel = require('./Model/CategoryConfigModel')
var EmpOTServices = {};

EmpOTServices.getOTByCycle = function (OTCycle) {
    return new Promise(function (rel, rej) {
        if (OTCycle === null || OTCycle === undefined || OTCycle === '') {
            logger.error("The give OTCycle is null,will return");
            rel([]);
            return;
        }
        EmpOT.findAll({
            where: {
                OTCycle: OTCycle
            }
        }).then((OTData) => {
            rel(OTData);
        }, (err) => {
            logger.error("Error Location EmpOTServices001")
            throw err;
        }).catch((err) => {
            logger.error("Error Location EmpOTServices002")
            throw err;
        })
    })
}

EmpOTServices.queryByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {
        if (criteria === null) criteria = {};

        let wherecase = buildWhereCase(criteria);
        let data = [];
        sequelize.query("select * from EmpOTs" + wherecase, { type: sequelize.QueryTypes.SELECT })
            .then(sdata => {
                data = JSON.parse(JSON.stringify(sdata));
                rel({
                    status: 200,
                    data: data,
                    message: ''
                });
            }, err => {
                logger.error("Error Location EmpOTServicesQuery002")
                rej({
                    status: 500,
                    data: [],
                    message: err
                });
            }).catch(err => {
                logger.error("Error Location EmpOTServicesQuery003")
                rej({
                    status: 500,
                    data: [],
                    message: err
                });
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
    if (criteria.salaryCycle) {
        if (wherecase === '') {
            wherecase = " where OTCycle ='" + criteria.salaryCycle + "'";
        } else {
            wherecase += " and OTCycle ='" + criteria.salaryCycle + "'";
        }
    }

    return wherecase;
}


// var DeleteOTDataWithoutBasicEmpInfo = function (OTCycle) {
//     return new Promise(function (rel, rej) {
//         logger.info("Start to Clean OT Data table for records without an associated Basic Emp Info record");
//         EmpOT.findAll({
//             where: {
//                 OTCycle: OTCycle
//             }
//         }).then((OTData) => {
//             let processed = 0;
//             OTData.forEach(function (ot) {
//                 let empId = ot.empId;
//                 empInfo.findOne({
//                     where: {
//                         empId: empId
//                     }
//                 }).then((emp) => {
//                     if (emp === null) {
//                         EmpOTServices.delete([empId], OTCycle).then(() => {
//                             processed++;
//                             if (processed === OTData.length) {
//                                 logger.info("Clean OT Data without basic employee info completed");
//                                 rel(true);
//                             }
//                         })
//                     } else {
//                         processed++;
//                         if (processed === OTData.length) {
//                             logger.info("Clean OT Data without basic employee info completed");
//                             rel(true);
//                         }
//                     }
//                 })
//             })
//         }, (err) => {
//             logger.error("Error Location EmpOTServices501")
//             throw err;
//         }).catch((err) => {
//             logger.error("Error Location EmpOTServices502")
//             throw err;
//         })
//     })
// }

EmpOTServices.InitialWithEmps = function (OTCycle) {
    return new Promise(function (rel, rej) {
        if (OTCycle === null || OTCycle === undefined || OTCycle === '') {
            logger.error("The give OTCycle is null,will return");
            rel([]);
            return;
        }
        EmpBasicServices.queryActiveByCriteria({
            NonWorkerCategory: NonRegularEmployeeCategory
        }).then(emps => {
            if (emps.length <= 0) {
                rel({
                    status: 500,
                    data: [],
                    message: "没有符合条件的数据"
                });
            }
            let processed = 0;
            emps.forEach(function (emp) {
                let empId = emp.empId;
                EmpOT.findOne({
                    where: {
                        empId: empId,
                        OTCycle: OTCycle
                    }
                }).then((OTData) => {
                    if (OTData === null) {
                        let OTData = EmpOTMOdel(emp, OTCycle);
                        EmpOT.create(OTData).then(creationRes => {
                            logger.info("New OT data created for " + emp.name + " , on OT Cycle: " + OTCycle);
                            processed++;
                            if (processed === emps.length) {
                                logger.info("Initial OT Data for Cycle:" + OTCycle + " completed")
                                EmpOTServices.getOTByCycle(OTCycle).then(data => {
                                    rel(data);
                                }).catch((err) => {
                                    logger.error("Error Location EmpOTServices204")
                                    throw err;
                                })
                            }
                        }).catch((err) => {
                            logger.error("Error Location EmpOTServices203")
                            throw err;
                        })
                    } else {
                        processed++;
                        if (processed === emps.length) {
                            logger.info("Initial OT Data for Cycle:" + OTCycle + " completed")
                            EmpOTServices.getOTByCycle(OTCycle).then(data => {
                                rel(data);
                            }).catch((err) => {
                                logger.error("Error Location EmpOTServices204")
                                throw err;
                            })
                        }
                    }
                }).catch((err) => {
                    logger.error("Error Location EmpOTServices202")
                    throw err;
                })
            });
        }).catch((err) => {
            logger.error("Error Location EmpOTServices201")
            throw err;
        })
    })
}

EmpOTServices.update = function (OTCycle, OTDataList) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < OTDataList.length; i++) {
            let OTEmp = OTDataList[i];
            let empId = OTEmp.empId;
            logger.info("To Update OT Data for : " + OTEmp.name + " on OT Cycle:" + OTCycle);
            if (empId === null || empId === undefined || empId === '') {
                logger.error("The give empID is null,will skip");
                processed++;
                continue;
            }
            if (OTCycle === null || OTCycle === undefined || OTCycle === '') {
                logger.error("The give OTCycle is null,will skip");
                throw new Error("The give OTCycle is null")
            }


            EmpOT.update(OTEmp, {
                where: {
                    empId: empId,
                    OTCycle: OTCycle
                }
            }).then((updateRes) => {
                processed++;
                if (processed === OTDataList.length) {
                    logger.info("Update OT Data for Cycle:" + OTCycle + " running completed");
                    rel(true)
                }
            }, (err) => {
                logger.error("Error Location EmpOTServices301")
                throw err;
            }).catch(function (err) {
                logger.error("Error Location EmpOTServices301")
                throw err;
            })
        }
    })
}

/**
 * Allow user to speicify OTCycle within the data
 */
EmpOTServices.upload = function (OTDataList) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < OTDataList.length; i++) {
            let OTEmp = OTDataList[i];
            let empId = OTEmp.empId;
            let OTCycle = OTEmp.OTCycle;
            logger.info("To Upload OT Data on OT Cycle:" + OTCycle);
            if (empId === null || empId === undefined || empId === '') {
                logger.error("Error Location EmpOTServices501")
                logger.error("The give empID is null,will skip");
                processed++;
                continue;
            }
            if (OTCycle === null || OTCycle === undefined || OTCycle === '') {
                logger.error("Error Location EmpOTServices502")
                logger.error("The give OTCycle is null,will skip");
                processed++;
                continue;
            }

            EmpOT.update(OTEmp, {
                where: {
                    empId: empId,
                    OTCycle: OTCycle
                }
            }).then((updateRes) => {
                processed++;
                if (processed === OTDataList.length) {
                    logger.info("Upload OT Datarunning completed");
                    rel(true)
                }
            }, (err) => {
                logger.error("Error Location EmpOTServices505")
                throw err;
            }).catch(function (err) {
                logger.error("Error Location EmpOTServices504")
                throw err;
            })
        }
    })
}

EmpOTServices.delete = function (empIds, OTCycle) {
    return new Promise(function (rel, rej) {
        sequelize.query('DELETE FROM EmpOTs WHERE empId IN(:empIds) and OTCycle=:OTCycle',
            { replacements: { empIds: empIds, OTCycle: OTCycle } }
        ).spread((results, metadata) => {
            rel(true);
        }).catch((err) => {
            logger.error("Error Location EmpOTServices401")
            throw err;
        });
    })
}

module.exports = EmpOTServices;