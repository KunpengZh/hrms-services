
var BaoxianbulvTable = require('../mysql/BaoxianBuLv');
var EmpBasicServices = require('../empInfoServices/EmpBasicServices');
var BaoxianbulvModel = require('./Model/BaoxianbulvModel');
var empInfo = require('../mysql/EmpInfo');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Baoxianbulv-Services');
logger.level = 'All';

var BaoxianbulvServices = {};

const NonRegularEmployeeCategory = "非全日制人员";

var keepTwoDecimalFull = function (num) {
    var result = parseFloat(num);
    if (isNaN(result)) {
        return false;
    }
    result = Math.round(num * 100) / 100;
    var s_x = result.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0) {
        pos_decimal = s_x.length;
        s_x += '.';
    }
    while (s_x.length <= pos_decimal + 2) {
        s_x += '0';
    }
    return s_x;
}

BaoxianbulvServices.getByCycle = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            rel([]);
            return;
        }
        BaoxianbulvTable.findAll({
            where: {
                salaryCycle: salaryCycle
            }
        }).then((welfareData) => {
            welfareData = JSON.parse(JSON.stringify(welfareData));
            rel({
                status: 200,
                data: welfareData
            });
        }, (err) => {
            logger.error("Error Location BaoxianbulvServices001")
            logger.error(err);
            rel({
                status: 200,
                data: welfareData
            });
        }).catch((err) => {
            logger.error("Error Location BaoxianbulvServices002")
            logger.error(err);
            rel({
                status: 200,
                data: welfareData
            });
        })
    })
}

BaoxianbulvServices.queryByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {
        if (criteria === null) criteria = {};

        let wherecase = buildWhereCase(criteria);
        let data = [];
        sequelize.query("select * from Baoxianbulvs" + wherecase, { type: sequelize.QueryTypes.SELECT })
            .then(walfaredata => {
                data = JSON.parse(JSON.stringify(walfaredata));
                rel({
                    status: 200,
                    data: data,
                    message: ''
                });
            }, err => {
                logger.error("Error Location BaoxianbulvServicesQuery002")
                logger.error(err);
                rej({
                    status: 500,
                    data: [],
                    message: err
                });
            }).catch(err => {
                logger.error("Error Location BaoxianbulvServicesQuery003")
                logger.error(err);
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
            wherecase = " where salaryCycle ='" + criteria.salaryCycle + "'";
        } else {
            wherecase += " and salaryCycle ='" + criteria.salaryCycle + "'";
        }
    }

    if (criteria.startSalaryCycle) {
        if (wherecase === '') {
            wherecase = "  where salaryCycle >='" + criteria.startSalaryCycle + "'";
        } else {
            wherecase += " and salaryCycle >='" + criteria.startSalaryCycle + "'";
        }
    }
    if (criteria.endSalaryCycle) {

        if (wherecase === '') {
            wherecase = " where salaryCycle <='" + criteria.endSalaryCycle + "'";
        } else {

            wherecase += " and salaryCycle <='" + criteria.endSalaryCycle + "'";
        }
    }

    if (criteria.name) {

        if (wherecase === '') {
            wherecase = " where name='" + criteria.name + "'";
        } else {

            wherecase += " and name ='" + criteria.name + "'";
        }
    }

    return wherecase;
}




BaoxianbulvServices.InitialWithEmps = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            rel([]);
            return;
        }
        EmpBasicServices.queryActiveByCriteria().then(emps => {
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
                BaoxianbulvTable.findOne({
                    where: {
                        empId: empId,
                        salaryCycle: salaryCycle
                    }
                }).then((WelData) => {
                    if (WelData === null) {
                        WelData = BaoxianbulvModel(emp, salaryCycle);
                        BaoxianbulvTable.create(WelData).then(creationRes => {
                            logger.info("New Baoxian data created for " + emp.name + " , on salary Cycle: " + salaryCycle);
                            processed++;
                            if (processed === emps.length) {
                                logger.info("Initial baoxian Data for Cycle:" + salaryCycle + " completed")
                                BaoxianbulvServices.getByCycle(salaryCycle).then(data => {
                                    rel({
                                        status: 200,
                                        data: data
                                    });
                                }).catch((err) => {
                                    logger.error("Error Location BaoxianbulvServices204")
                                    logger.error(err);
                                    rel({
                                        status: 500,
                                        data: [],
                                        message: err
                                    });
                                })
                            }
                        }).catch((err) => {
                            logger.error("Error Location BaoxianbulvServices203")
                            logger.error(err);
                            rel({
                                status: 500,
                                data: [],
                                message: err
                            });
                        })
                    } else {
                        processed++;
                        if (processed === emps.length) {
                            logger.info("Initial OT Data for Cycle:" + salaryCycle + " completed")
                            BaoxianbulvServices.getByCycle(salaryCycle).then(data => {
                                rel({
                                    status: 200,
                                    data: data
                                });
                            }).catch((err) => {
                                logger.error("Error Location BaoxianbulvServices204")
                                logger.error(err);
                                rel({
                                    status: 500,
                                    data: [],
                                    message: err
                                });
                            })
                        }
                    }
                }).catch((err) => {
                    logger.error("Error Location BaoxianbulvServices202")
                    logger.error(err);
                    rel({
                        status: 500,
                        data: [],
                        message: err
                    });
                })
            });
        }).catch((err) => {
            logger.error("Error Location BaoxianbulvServices201")
            logger.error(err);
            rel({
                status: 500,
                data: [],
                message: err
            });
        })
    })
}

BaoxianbulvServices.update = function (salaryCycle, WelDataList) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < WelDataList.length; i++) {
            let WeEmp = WelDataList[i];
            let empId = WeEmp.empId;
            logger.info("To Update Baoxian Data for : " + WeEmp.name + " on salary Cycle:" + salaryCycle);
            if (empId === null || empId === undefined || empId === '') {
                logger.error("The give empID is null,will skip");
                processed++;
                continue;
            }
            if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
                logger.error("The give salaryCycle is null,will skip");

                rel({
                    status: 500,
                    data: [],
                    message: "The give salaryCycle is null"
                });
                continue;
            }

            BaoxianbulvTable.findOne({
                where: {
                    empId: empId,
                    salaryCycle: salaryCycle
                }
            }).then((WelData) => {
                if (WelData === null) {
                    EmpBasicServices.getEmpById(empId).then(emps => {
                        if (emps.length > 0) {
                            let emp = emps[0];
                            WeEmp.name = emp.name;
                            WeEmp.workerCategory = emp.workerCategory;
                            WeEmp.department = emp.department;
                            WeEmp.jobRole = emp.jobRole;
                            BaoxianbulvTable.create(WeEmp).then(crres => {
                                logger.info("Created new employee Baoxian for emp: " + emp.empId + " , " + emp.name);
                                processed++;
                                if (processed === WelDataList.length) {
                                    logger.info("Upload Employee baoxian  completed");
                                    rel({
                                        status: 200,
                                        data: [],
                                        message: "finished"
                                    })
                                }
                            })
                        } else {
                            logger.error("The given emp ID not exist :" + empId)
                        }
                    })
                } else {
                    BaoxianbulvTable.update(WeEmp, {
                        where: {
                            empId: empId,
                            salaryCycle: salaryCycle
                        }
                    }).then((updateRes) => {
                        processed++;
                        if (processed === WelDataList.length) {
                            logger.info("Update Baoxian Data for Cycle:" + salaryCycle + " running completed");
                            rel({
                                status: 200,
                                data: [],
                                message: "finished"
                            })
                        }
                    }, (err) => {
                        logger.error("Error Location BaoxianbulvServices301")
                        logger.error(err);
                        rel({
                            status: 500,
                            data: [],
                            message: err
                        });
                    }).catch(function (err) {
                        logger.error("Error Location BaoxianbulvServices301")
                        logger.error(err);
                        rel({
                            status: 500,
                            data: [],
                            message: err
                        });
                    })
                }
            })



        }
    })
}

/**
 * Allow user to speicify salaryCycle within the data
 */
BaoxianbulvServices.upload = function (WelDataList) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < WelDataList.length; i++) {
            let WeEmp = WelDataList[i];
            let empId = WeEmp.empId;
            let salaryCycle = WeEmp.salaryCycle;
            logger.info("To Upload baoxian Data on salary Cycle:" + salaryCycle);
            if (empId === null || empId === undefined || empId === '') {
                logger.error("Error Location BaoxianbulvServices501")
                logger.error("The give empID is null,will skip");
                processed++;
                continue;
            }
            if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
                logger.error("Error Location BaoxianbulvServices502")
                logger.error("The give salaryCycle is null,will skip");
                processed++;
                continue;
            }

            BaoxianbulvTable.findOne({
                where: {
                    empId: empId,
                    salaryCycle: salaryCycle
                }
            }).then((WelData) => {
                if (WelData === null) {
                    EmpBasicServices.getEmpById(empId).then(emps => {
                        if (emps.length > 0) {
                            let emp = emps[0];
                            WeEmp.name = emp.name;
                            WeEmp.workerCategory = emp.workerCategory;
                            WeEmp.department = emp.department;
                            WeEmp.jobRole = emp.jobRole;
                            BaoxianbulvTable.create(WeEmp).then(crres => {
                                logger.info("Created new employee Baoxian for emp: " + emp.empId + " , " + emp.name);
                                processed++;
                                if (processed === WelDataList.length) {
                                    logger.info("Upload Employee baoxian  completed");
                                    rel({
                                        status: 200,
                                        data: [],
                                        message: "finished"
                                    })
                                }
                            })
                        } else {
                            logger.error("The given emp ID not exist :" + empId)
                        }
                    })
                } else {
                    BaoxianbulvTable.update(WeEmp, {
                        where: {
                            empId: empId,
                            salaryCycle: salaryCycle
                        }
                    }).then((updateRes) => {
                        processed++;
                        if (processed === WelDataList.length) {
                            logger.info("Upload Employee baoxian  completed");
                            rel({
                                status: 200,
                                data: [],
                                message: "finished"
                            })
                        }
                    }, (err) => {
                        logger.error("Error Location BaoxianbulvServices505")
                        logger.error(err);
                        rel({
                            status: 500,
                            data: [],
                            message: err
                        });
                    }).catch(function (err) {
                        logger.error("Error Location BaoxianbulvServices504")
                        logger.error(err);
                        rel({
                            status: 500,
                            data: [],
                            message: err
                        });
                    })
                }
            });


        }
    })
}

BaoxianbulvServices.delete = function (empIds, salaryCycle) {
    return new Promise(function (rel, rej) {
        sequelize.query('DELETE FROM Baoxianbulvs WHERE empId IN(:empIds) and salaryCycle=:salaryCycle',
            { replacements: { empIds: empIds, salaryCycle: salaryCycle } }
        ).spread((results, metadata) => {
            rel({
                status: 200,
                data: [],
                message: "finished"
            })
        }).catch((err) => {
            logger.error("Error Location BaoxianbulvServices401")
            logger.error(err);
            rel({
                status: 500,
                data: [],
                message: err
            });
        });
    })
}

module.exports = BaoxianbulvServices;