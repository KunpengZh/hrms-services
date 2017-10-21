var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-GongZiDan-Services');
logger.level = 'All';
var EmpSenServices = require('../empInfoServices/SensitiveEmpInfoServices');
var SalaryDetailServices = require("../SalaryDetails/SalaryDetails");
var EmpBasicServices = require('../empInfoServices/EmpBasicServices');
let SalaryModel = require("./Model/GongziDan");
let NonRegularEmpSalaryModel = require('./Model/NonRegularModel');
var sequelize = require('../mysql/hrmsdb');
var CoryptoEnpSen = require('../empInfoServices/CryptoEnpSen');
const NonRegularEmployeeCategory = "非全日制人员";
var GZDServices = {};

GZDServices.getDataByCycle = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        getGongZiDanData(salaryCycle, null).then(gzds => {
            rel(gzds);
        }).catch(err => {
            logger.error("Error Location GongZiDanServices001");
            logger.error(err);
            throw err;
        })
    })
}
GZDServices.getDataByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {
        getGongZiDanData(null, criteria).then(gzds => {
            rel(gzds);
        }).catch(err => {
            logger.error("Error Location GongZiDanServices002");
            logger.error(err);
            throw err;
        })
    })
}

getGongZiDanData = function (salaryCycle, criteria) {
    return new Promise(function (rel, rej) {
        let salarylist = [];
        let empsalarys = [];

        let startGenerationData = function () {
            for (let i = 0; i < empsalarys.length; i++) {
                let empsalary = empsalarys[i];
                if (empsalary.workerCategory === NonRegularEmployeeCategory) {
                    let newgongzidan = NonRegularEmpSalaryModel(empsalary);
                    salarylist.push(newgongzidan);
                } else {
                    let newgongzidan = SalaryModel(empsalary);
                    salarylist.push(newgongzidan);
                }
            }
            rel(salarylist);
        }

        if (salaryCycle) {
            SalaryDetailServices.getDataByCycle(salaryCycle).then(sdata => {
                empsalarys = JSON.parse(JSON.stringify(sdata));
                startGenerationData();
            }, err => {
                logger.error("Error Location GongZiDanServices003");
                rej(err);
            }).catch(err => {
                logger.error("Error Location GongZiDanServices004");
                rej(err);
            });
        } else if (criteria) {
            let wherecase = buildWhereCase(criteria);
            sequelize.query("select * from SalaryDetails" + wherecase, { type: sequelize.QueryTypes.SELECT })
                .then(sdata => {
                    empsalarys = JSON.parse(JSON.stringify(CoryptoEnpSen.DeEncrypteEmps(sdata)));
                    startGenerationData();
                }, err => {
                    logger.error("Error Location GongZiDanServices005");
                    rej(err);
                }).catch(err => {
                    logger.error("Error Location GongZiDanServices006");
                    rej(err);
                });

        }
    })
}

GZDServices.getAllAvailableSalaryCycle = function () {
    return new Promise(function (rel, rej) {
        let result = {};
        let deparReady = false, configDataReady = false;
        let workFlowControl = function () {
            if (deparReady && configDataReady) {
                rel(result);
            }
        }
        sequelize.query("SELECT DISTINCT salaryCycle from SalaryDetails", { type: sequelize.QueryTypes.SELECT })
            .then(salaryCycles => {
                let sacs = [{ label: 'All', value: 'All' }];
                if (salaryCycles && salaryCycles.length > 0) {
                    salaryCycles.forEach(function (salaryCycle) {
                        sacs.push({
                            label: salaryCycle.salaryCycle,
                            value: salaryCycle.salaryCycle
                        })
                    });
                }

                result.salaryCycle = sacs;

                deparReady = true;
                workFlowControl();
            }).catch(function (err) {
                logger.error("Error Location GongZiDanServices0007")
                throw err;
            })
        sequelize.query("select configDoc from ConfigDocs where configKey='ConfigData'", { type: sequelize.QueryTypes.SELECT })
            .then(configDoc => {
                if (configDoc && configDoc.length > 0) {
                    configDoc = JSON.parse(configDoc[0].configDoc);
                    let Department = [{ label: 'All', value: 'All' }];
                    if (configDoc.Department && configDoc.Department.length > 0) {
                        configDoc.Department.forEach(function (department) {
                            Department.push({
                                label: department.value,
                                value: department.value,
                            })
                        })
                    }
                    let JobRole = [{ label: 'All', value: 'All' }];
                    if (configDoc.JobRole && configDoc.JobRole.length > 0) {
                        configDoc.JobRole.forEach(function (jobr) {
                            JobRole.push({
                                label: jobr.value,
                                value: jobr.value,
                            })
                        })
                    }
                    let WorkerCategory = [{ label: 'All', value: 'All' }];
                    if (configDoc.WorkerCategory && configDoc.WorkerCategory.length > 0) {
                        configDoc.WorkerCategory.forEach(function (wc) {
                            WorkerCategory.push({
                                label: wc.value,
                                value: wc.value,
                            })
                        })
                    }

                    result.department = Department;
                    result.jobRole = JobRole;
                    result.workerCategory = WorkerCategory;

                } else {
                    result.department = [{ label: 'All', value: 'All' }];
                    result.jobRole = [{ label: 'All', value: 'All' }];
                    result.workerCategory = [{ label: 'All', value: 'All' }];
                }

                configDataReady = true;
                workFlowControl();
            }).catch(function (err) {
                logger.error("Error Location GongZiDanServices0008")
                throw err;
            })
    })
}

var buildWhereCase = function (criteria) {
    let wherecase = '';
    if (criteria.startSalaryCycle) {
        if (wherecase === '') {
            wherecase = "  where salaryCycle >='" + criteria.startSalaryCycle + "'";
        } else {
            wherecase += " and salaryCycle >='" + criteria.startSalaryCycle + "'";
        }
    }
    if (criteria.endSalaryCycle) {
        if (wherecase === '') {
            wherecase = " where salaryCycle <='" + criteria.startSalaryCycle + "'";
        } else {
            wherecase += " and salaryCycle <='" + criteria.startSalaryCycle + "'";
        }
    }
    if (criteria.name) {
        if (wherecase === '') {
            wherecase = " where name ='" + criteria.name + "'";
        } else {
            wherecase += " and name ='" + criteria.name + "'";
        }
    }
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
    return wherecase;
}


module.exports = GZDServices;