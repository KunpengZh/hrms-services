var SalaryDetails = require('../mysql/SalaryDetails');
var EmpBasicServices = require('../empInfoServices/EmpBasicServices');
var EmpSenServices = require('../empInfoServices/SensitiveEmpInfoServices');
var CategoryConfigServices = require('../CategoryConfig/CategoryConfig');
var SalaryDetailsModel = require('./Model/SalaryDetails');
var EmpOTServices = require('../EmpOTServices/EmpOTServices');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-SalaryDetails-Services');
logger.level = 'All';
var SalaryCalculation = require('./SalaryCalculation');
var ConfigDoc = require('../mysql/ConfigDoc');


var SDServices = {};

SDServices.getDataByCycle = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            rel([]);
            return;
        }
        SalaryDetails.findAll({
            where: {
                salaryCycle: salaryCycle
            }
        }).then((SDData) => {
            rel(SDData);
        }, (err) => {
            logger.error("Error Location SalaryDetails001")
            throw err;
        }).catch((err) => {
            logger.error("Error Location SalaryDetails002")
            throw err;
        })
    })
}

SDServices.InitialWithEmps = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        let emps = [];
        let empbasics = [];
        let empsendata = [];
        let configCategory = [];
        let configDoc = {};
        let empOTs = [];

        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            logger.error("Error Location SalaryDetails201")
            rej(new Error("The give salaryCycle is null,will return"));
            return;
        }



        let functionsprocessed = 0;

        let InitialSalaryDetails = function () {
            try {
                emps = SalaryCalculation.GenerateSalaryDetails(empbasics, salaryCycle);
                emps = SalaryCalculation.fillGongZiXinXi(emps, empsendata, configCategory);
                emps = SalaryCalculation.categoryOT(emps, empOTs);
                emps = SalaryCalculation.calculateYingfagongzi(emps);
                emps = SalaryCalculation.calculateNianJinAndBaoXian(emps, configDoc)
                emps = SalaryCalculation.calculateYingshuigongzi(emps, configDoc)
                emps = SalaryCalculation.calculateGerensuodeshui(emps, configDoc);
                emps = SalaryCalculation.calculateYicixingjiangjinTax(emps, configDoc)
                emps = SalaryCalculation.calculateNetIncome(emps);
                SalaryDetails.destroy({
                    where: {
                        salaryCycle: salaryCycle
                    },
                    truncate: true /* this will ignore where and truncate the table instead */
                }).then(() => {
                    SalaryDetails.bulkCreate(emps).then(() => {
                        SDServices.getDataByCycle(salaryCycle).then(returnval => {
                            rel(returnval);
                        }).catch(err => {
                            logger.error("Error Location SalaryDetails202")
                            rej(err);
                        })
                    }).catch(err => {
                        logger.error("Error Location SalaryDetails203")
                        rej(err);
                    })
                }).catch(err => {
                    logger.error("Error Location SalaryDetails211")
                    rej(err);
                })
            } catch (err) {
                logger.error("Error Location SalaryDetails204")
                rej(err);
            }
        }

        let WorkFlowControl = function () {
            functionsprocessed++;
            if (functionsprocessed >= 5) {
                InitialSalaryDetails();
            }
        }
        EmpBasicServices.getAllBasicEmpInfo().then(empbasicinfo => {
            empbasics = JSON.parse(JSON.stringify(empbasicinfo));
            WorkFlowControl();
        }).catch(err => {
            logger.error("Error Location SalaryDetails205")
            rej(err);
        })

        EmpSenServices.getAllSensitiveEmpInfo().then(sendata => {
            empsendata = JSON.parse(JSON.stringify(sendata));
            WorkFlowControl();
        }).catch(err => {
            logger.error("Error Location SalaryDetails206")
            rej(err);
        })

        CategoryConfigServices.getAllCategoryConfig().then(config => {
            configCategory = JSON.parse(JSON.stringify(config));
            WorkFlowControl();
        }).catch(err => {
            logger.error("Error Location SalaryDetails207")
            rej(err);
        })

        ConfigDoc.findOne({
            where: {
                configKey: 'ConfigData'
            }
        }).then((qres) => {
            if (qres === null) {
                logger.error("Error Location SalaryDetails208")
                logger.error("Do not have ConfigData find");
                rej(err);
            } else {
                configDoc = qres.get({
                    plain: true
                });
                configDoc = JSON.parse(configDoc.configDoc);
                WorkFlowControl();
            }
        }).catch(err => {
            logger.error("Error Location SalaryDetails209")
            rej(err);
        })


        EmpOTServices.getOTByCycle(salaryCycle).then(ots => {
            empOTs = JSON.parse(JSON.stringify(ots));
            WorkFlowControl();
        }).catch(err => {
            logger.error("Error Location SalaryDetails210")
            rej(err);
        })
    })
}



SDServices.ReCalculateSalaryDetails = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        let emps = [];
        let configDoc = {};
        let empOTs = [];

        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            logger.error("Error Location SalaryDetails301")
            rej(new Error("The give salaryCycle is null,will return"));
            return;
        }

        let functionsprocessed = 0;

        let calculateSalaryDetails = function () {
            try {
                emps = SalaryCalculation.categoryOT(emps, empOTs);
                emps = SalaryCalculation.calculateYingfagongzi(emps);
                emps = SalaryCalculation.calculateNianJinAndBaoXian(emps, configDoc)
                emps = SalaryCalculation.calculateYingshuigongzi(emps, configDoc)
                emps = SalaryCalculation.calculateGerensuodeshui(emps, configDoc);
                emps = SalaryCalculation.calculateYicixingjiangjinTax(emps, configDoc)
                emps = SalaryCalculation.calculateNetIncome(emps);

                let processed = 0;

                emps.forEach(function (emp) {
                    SalaryDetails.update(emp, {
                        where: {
                            id: emp.id
                        }
                    }).then(ures => {
                        processed++;
                        updateWorkFlowControl(processed, emps.length);
                    }).catch(err => {
                        logger.error("Error Location SalaryDetails302");
                        rej(err);
                    })
                });
            } catch (err) {
                logger.error("Error Location SalaryDetails303")
                rej(err);
            }
        }

        let updateWorkFlowControl = function (processed, reqlength) {
            if (processed === reqlength) {
                SDServices.getDataByCycle(salaryCycle).then(sdemps => {
                    emps = JSON.parse(JSON.stringify(sdemps));
                    rel(emps)
                }).catch(err => {
                    logger.error("Error Location SalaryDetails304")
                    rej(err);
                })
            }
        }

        let WorkFlowControl = function () {
            functionsprocessed++;
            if (functionsprocessed >= 3) {
                calculateSalaryDetails();
            }
        }

        SDServices.getDataByCycle(salaryCycle).then(sdemps => {
            emps = JSON.parse(JSON.stringify(sdemps));
            WorkFlowControl();
        }).catch(err => {
            logger.error("Error Location SalaryDetails305")
            rej(err);
        })

        ConfigDoc.findOne({
            where: {
                configKey: 'ConfigData'
            }
        }).then((qres) => {
            if (qres === null) {
                logger.error("Error Location SalaryDetails306")
                logger.error("Do not have ConfigData find");
                rej(err);
            } else {
                configDoc = qres.get({
                    plain: true
                });
                configDoc = JSON.parse(configDoc.configDoc);
                WorkFlowControl();
            }
        }).catch(err => {
            logger.error("Error Location SalaryDetails307")
            rej(err);
        })


        EmpOTServices.getOTByCycle(salaryCycle).then(ots => {
            empOTs = JSON.parse(JSON.stringify(ots));
            WorkFlowControl();
        }).catch(err => {
            logger.error("Error Location SalaryDetails308")
            rej(err);
        })
    })
}

SDServices.update = function (salaryCycle, salaryDataList) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < salaryDataList.length; i++) {
            let emp = salaryDataList[i];
            let empId = emp.empId;
            logger.info("To Update Salary Details Data for : " + emp.name + " on Cycle:" + salaryCycle);
            if (empId === null || empId === undefined || empId === '') {
                logger.error("The give empID is null,will skip");
                processed++;
                continue;
            }
            if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
                logger.error("The give salaryCycle is null,will skip");
                logger.error("Error Location SalaryDetails401")
                throw new Error("The give salaryCycle is null")
            }


            SalaryDetails.update(emp, {
                where: {
                    empId: empId,
                    salaryCycle: salaryCycle
                }
            }).then((updateRes) => {
                processed++;
                if (processed === salaryDataList.length) {
                    logger.info("Update Salary Details Data for Cycle:" + salaryCycle + " running completed");
                    rel(true)
                }
            }, (err) => {
                logger.error("Error Location SalaryDetails402")
                throw err;
            }).catch(function (err) {
                logger.error("Error Location SalaryDetails403")
                throw err;
            })
        }
    })
}

/**
 * Allow user to speicify Salary Cycle within the data
 */
SDServices.upload = function (salaryDataList) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < salaryDataList.length; i++) {
            let emp = salaryDataList[i];
            let empId = emp.empId;
            let salaryCycle = emp.salaryCycle;
            logger.info("To Update Salary Details Data for : " + emp.name + " on Cycle:" + salaryCycle);
            if (empId === null || empId === undefined || empId === '') {
                logger.error("The give empID is null,will skip");
                logger.error("Error Location SalaryDetails501")
                processed++;
                continue;
            }
            if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
                logger.error("The give salaryCycle is null,will skip");
                logger.error("Error Location SalaryDetails502")
                processed++;
                continue;
            }


            SalaryDetails.update(emp, {
                where: {
                    empId: empId,
                    salaryCycle: salaryCycle
                }
            }).then((updateRes) => {
                processed++;
                if (processed === salaryDataList.length) {
                    logger.info("Update Salary Details Data for Cycle:" + salaryCycle + " running completed");
                    rel(true)
                }
            }, (err) => {
                logger.error("Error Location SalaryDetails503")
                throw err;
            }).catch(function (err) {
                logger.error("Error Location SalaryDetails504")
                throw err;
            })
        }
    })
}

module.exports = SDServices;
