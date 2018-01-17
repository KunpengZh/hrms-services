
var SalaryDetails = require('../mysql/SalaryCalculations');
var SDTable = require('../mysql/SalaryDetails');
var regularEmpOTHistory = require('../mysql/EmpOTHistory');
var SalaryCycles = require('../mysql/SalaryCycles');
var nonRegularEmpSalaryHistory = require('../mysql/NonRegularSalaryHistory');
var EmpBasicServices = require('../empInfoServices/EmpBasicServices');
var EmpSenServices = require('../empInfoServices/SensitiveEmpInfoServices');
var CategoryConfigServices = require('../CategoryConfig/CategoryConfig');
var SalaryDetailsModel = require('./Model/SalaryDetails');
var EmpOTServices = require('../EmpOTServices/EmpOTServices');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-SalaryCalculation-Services');
logger.level = 'All';
var SalaryCalculation = require('./SalaryCalculation');
var ConfigDoc = require('../mysql/ConfigDoc');
var CoryptoEnpSen = require('../empInfoServices/CryptoEnpSen');
var NonRegularServices = require('../NonRegularSalary/NonRegularSalaryService');

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
            rel(CoryptoEnpSen.DeEncrypteEmps(JSON.parse(JSON.stringify(SDData))));
        }, (err) => {
            logger.error("Error Location SalaryCalculations001")
            throw err;
        }).catch((err) => {
            logger.error("Error Location SalaryCalculations002")
            throw err;
        })
    })
}

SDServices.queryByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {
        if (criteria === null) criteria = {};

        let wherecase = buildWhereCase(criteria);
        let data = [];
        sequelize.query("select * from SalaryCalculations" + wherecase, { type: sequelize.QueryTypes.SELECT })
            .then(sdata => {
                data = CoryptoEnpSen.DeEncrypteEmps(JSON.parse(JSON.stringify(sdata)));
                rel({
                    status: 200,
                    data: data,
                    message: ''
                });
            }, err => {
                logger.error("Error Location SalaryCalculationsQuery01")
                rej({
                    status: 500,
                    data: [],
                    message: err
                });
            }).catch(err => {
                logger.error("Error Location SalaryCalculations02")
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

SDServices.SyncWithEmps = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        let EmpBasics = [];
        let processed = 0;
        let WorkFlowControll = function () {
            processed++;
            if (processed === 2) {
                CreateSalaryDetails(salaryCycle, EmpBasics).then(returnVals => {
                    rel(returnVals);
                }).catch((err) => {
                    logger.error("Error Location SalaryDetails2002")
                    throw err;
                })
            }
        }

        sequelize.query("DELETE from SalaryCalculations where salaryCycle=:salaryCycle and empId not in (select EmpInfos.empId from EmpInfos where empStatus='Active')", { replacements: { salaryCycle: salaryCycle }, type: sequelize.QueryTypes.DELETE })
            .then((delres) => {
                logger.info("SyncWithEmps deletion result:" + delres);
                WorkFlowControll();
            }).catch((err) => {
                logger.error("Error Location SalaryCalculations5001")
                throw err;
            });

        sequelize.query("SELECT * FROM EmpInfos where empStatus='Active' and empId not in (SELECT empId from SalaryCalculations)", { type: sequelize.QueryTypes.SELECT })
            .then(emps => {
                EmpBasics = emps;
                WorkFlowControll();
            })
    })
}



SDServices.InitialWithEmps = function (salaryCycle) {
    return new Promise(function (rel, rej) {

        //verify the salaryCycle not be closed already
        let verifySalaryCycle = function () {
            logger.info("verify the salaryCycle not be closed already");
            sequelize.query("SELECT * FROM SalaryCycles where salaryCycle=:salaryCycle", { replacements: { salaryCycle: salaryCycle }, type: sequelize.QueryTypes.SELECT })
                .then(sals => {
                    if (sals.length > 0) {
                        let isFinalizedCycle = false;
                        for (let i = 0; i < sals.length; i++) {
                            if (sals[i].status === 'Closed') {
                                isFinalizedCycle = true;
                                break;
                            }
                        }
                        if (isFinalizedCycle) {
                            rel({
                                status: 500,
                                message: '指定的工资周期已经被冻结，不能再重新初始化：' + salaryCycle
                            })
                        } else {
                            verifyOpenSalaryCycle();
                        }

                    } else {
                        SalaryCycles.create({
                            salaryCycle: salaryCycle,
                            status: 'Open'
                        }).then(cres => {
                            logger.info("Create new Salary Cycle res:" + JSON.stringify(cres));
                            verifyOpenSalaryCycle();
                        })

                    }
                })
        }

        //verify if any opened salary cycle current working

        let verifyOpenSalaryCycle = function () {
            logger.info('verify if any opened salary cycle current working');
            sequelize.query("SELECT * FROM SalaryCalculations", { type: sequelize.QueryTypes.SELECT })
                .then(sacals => {
                    if (sacals.length > 0) {
                        rel({
                            status: 500,
                            message: '当前存在正在计算中的工资周期，请冻结当前的工资周期，或是清除后再重新初始化'
                        })
                    } else {
                        initialSalaryCAL()
                    }
                })

        }

        //To initial salary calculation data

        let initialSalaryCAL = function () {
            logger.info("start to initial new salary calculation");
            SalaryDetails.destroy({
                where: {
                    salaryCycle: salaryCycle
                }
            }).then(() => {
                CreateSalaryDetails(salaryCycle).then(returnVals => {
                    rel(returnVals);
                }).catch((err) => {
                    logger.error("Error Location SalaryCalculations2002")
                    throw err;
                })
            }).catch((err) => {
                logger.error("Error Location SalaryCalculations2003")
                throw err;
            })
        }

        verifySalaryCycle();

    })
}
SDServices.getYearMonthPeriod = function () {
    return new Promise(function (rel, rej) {
        var date = new Date;
        var year = date.getFullYear();
        var month = date.getMonth() + 2;
        var YearMonthPeriod = [];
        sequelize.query("SELECT * FROM SalaryCycles where status='Closed'", { type: sequelize.QueryTypes.SELECT })
            .then(sals => {

                for (let i = 0; i < 13; i++) {
                    month = month - 1;
                    if (month < 1) {
                        year = year - 1;
                        month = 12;
                    }
                    let item = year.toString() + (month < 10 ? "0" + month : month).toString();

                    let isClosedCycle = false;
                    for (let k = 0; k < sals.length; k++) {
                        if (sals[k].salaryCycle === item) {
                            isClosedCycle = true;
                            break;
                        }
                    }

                    if (!isClosedCycle) {
                        YearMonthPeriod.push({ value: item, label: item });
                    }
                }

                rel({
                    status: 200,
                    data: YearMonthPeriod
                });
            })
    })
}

let CreateSalaryDetails = function (salaryCycle, parEmpBasics) {
    return new Promise(function (rel, rej) {
        let emps = [];
        let empbasics = [];
        let empsendata = [];
        //let configCategory = [];
        let configDoc = {};
        let empOTs = [];
        let nonRegularData = [];

        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            logger.error("Error Location SalaryCalculations201")
            rej(new Error("The give salaryCycle is null,will return"));
            return;
        }
        let functionsprocessed = 0;

        let InitialSalaryDetails = function () {
            try {
                emps = SalaryCalculation.GenerateSalaryDetails(empbasics, salaryCycle);
                emps = SalaryCalculation.fillRegularEmployeeGongZiXinXi(emps, empsendata, empOTs);
                emps = SalaryCalculation.fillNonRegularEmployeeGongZiXinXi(emps, empsendata, nonRegularData);
                emps = SalaryCalculation.calculateJibengongzi(emps);
                emps = SalaryCalculation.categoryOT(emps, configDoc);
                emps = SalaryCalculation.calculateYingfagongzi(emps);
                emps = SalaryCalculation.calculateNianJinAndBaoXian(emps, configDoc)
                emps = SalaryCalculation.calculateYingshuigongzi(emps, configDoc)
                emps = SalaryCalculation.calculateGerensuodeshui(emps, configDoc);
                emps = SalaryCalculation.calculateYicixingjiangjinTax(emps, configDoc)
                emps = SalaryCalculation.calculateNetIncome(emps);

                SalaryDetails.bulkCreate(CoryptoEnpSen.EncrypteEmps(emps)).then(() => {
                    SDServices.getDataByCycle(salaryCycle).then(returnval => {
                        rel(returnval);
                    }).catch(err => {
                        logger.error("Error Location SalaryCalculations202")
                        rej(err);
                    })
                }).catch(err => {
                    logger.error("Error Location SalaryCalculations203")
                    rej(err);
                })

            } catch (err) {
                logger.error("Error Location SalaryCalculations204")
                rej(err);
            }
        }

        let WorkFlowControl = function () {
            functionsprocessed++;
            if (functionsprocessed >= 5) {
                InitialSalaryDetails();
            }
        }

        if (parEmpBasics) {
            empbasics = JSON.parse(JSON.stringify(parEmpBasics));
            WorkFlowControl();
        } else {
            EmpBasicServices.getAllBasicEmpInfo().then(empbasicinfo => {
                empbasics = JSON.parse(JSON.stringify(empbasicinfo));
                WorkFlowControl();
            }).catch(err => {
                logger.error("Error Location SalaryCalculations205")
                rej(err);
            })
        }


        EmpSenServices.getAllSensitiveEmpInfo().then(sendata => {
            empsendata = JSON.parse(JSON.stringify(sendata));
            WorkFlowControl();
        }).catch(err => {
            logger.error("Error Location SalaryCalculations206")
            rej(err);
        })

        // CategoryConfigServices.getAllCategoryConfig().then(config => {
        //     configCategory = JSON.parse(JSON.stringify(config));
        //     WorkFlowControl();
        // }).catch(err => {
        //     logger.error("Error Location SalaryCalculations207")
        //     rej(err);
        // })

        ConfigDoc.findOne({
            where: {
                configKey: 'ConfigData'
            }
        }).then((qres) => {
            if (qres === null) {
                logger.error("Error Location SalaryCalculations208")
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
            logger.error("Error Location SalaryCalculations209")
            rej(err);
        })

        EmpOTServices.getOTByCycle(salaryCycle).then(ots => {
            empOTs = JSON.parse(JSON.stringify(ots));
            WorkFlowControl();
        }).catch(err => {
            logger.error("Error Location SalaryCalculations210")
            rej(err);
        })

        NonRegularServices.getNRSSByCycle(salaryCycle).then(data => {
            if (data.status === 200) {
                nonRegularData = JSON.parse(JSON.stringify(data.data));
                WorkFlowControl();
            } else {
                logger.error("Error Location SalaryCalculations211")
                logger.error("Error when query non regular salary data");
                rej(new Error("未能获取非全日制人员的工资数据"));
            }
        })

    })
}



SDServices.ReCalculateSalaryDetails = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        let emps = [];
        let configDoc = {};


        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            logger.error("Error Location SalaryCalculations301")
            rej(new Error("The give salaryCycle is null,will return"));
            return;
        }

        let functionsprocessed = 0;

        let calculateSalaryDetails = function () {
            try {
                emps = SalaryCalculation.calculateJibengongzi(emps);
                emps = SalaryCalculation.categoryOT(emps, configDoc);
                emps = SalaryCalculation.calculateYingfagongzi(emps);
                emps = SalaryCalculation.calculateNianJinAndBaoXian(emps, configDoc)
                emps = SalaryCalculation.calculateYingshuigongzi(emps, configDoc)
                emps = SalaryCalculation.calculateGerensuodeshui(emps, configDoc);
                emps = SalaryCalculation.calculateYicixingjiangjinTax(emps, configDoc)
                emps = SalaryCalculation.calculateNetIncome(emps);

                let processed = 0;

                emps.forEach(function (emp) {
                    SalaryDetails.update(CoryptoEnpSen.EncrypteEmps(emp), {
                        where: {
                            id: emp.id
                        }
                    }).then(ures => {
                        processed++;
                        updateWorkFlowControl(processed, emps.length);
                    }).catch(err => {
                        logger.error("Error Location SalaryCalculations302");
                        rej(err);
                    })
                });
                /**
                 * to reutrn in case emps is a []
                 */
                updateWorkFlowControl(processed, emps.length);
            } catch (err) {
                logger.error("Error Location SalaryCalculations303")
                rej(err);
            }
        }

        let updateWorkFlowControl = function (processed, reqlength) {
            if (processed === reqlength) {
                SDServices.getDataByCycle(salaryCycle).then(sdemps => {
                    rel(emps)
                }).catch(err => {
                    logger.error("Error Location SalaryCalculations304")
                    rej(err);
                })
            }
        }

        let WorkFlowControl = function () {
            functionsprocessed++;
            if (functionsprocessed >= 2) {
                calculateSalaryDetails();
            }
        }

        SDServices.getDataByCycle(salaryCycle).then(sdemps => {
            emps = sdemps;
            WorkFlowControl();
        }).catch(err => {
            logger.error("Error Location SalaryCalculations305")
            rej(err);
        })

        ConfigDoc.findOne({
            where: {
                configKey: 'ConfigData'
            }
        }).then((qres) => {
            if (qres === null) {
                logger.error("Error Location SalaryCalculations306")
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
            logger.error("Error Location SalaryCalculations307")
            rej(err);
        })


        // EmpOTServices.getOTByCycle(salaryCycle).then(ots => {
        //     empOTs = JSON.parse(JSON.stringify(ots));
        //     WorkFlowControl();
        // }).catch(err => {
        //     logger.error("Error Location SalaryCalculations308")
        //     rej(err);
        // })
    })
}

SDServices.finalizeSalaryCalData = function () {
    return new Promise(function (rel, rej) {

        let saCycles = [];
        //to get all distinct salary cycle from SD Calculation table
        let getAllDistinctSalaryCycle = function () {
            logger.info("Start get all Distinct Salary Cycle.......");
            sequelize.query("SELECT DISTINCT salaryCycle from SalaryCalculations", { type: sequelize.QueryTypes.SELECT })
                .then((resdata) => {
                    resdata = JSON.parse(JSON.stringify(resdata))
                    logger.info("Distinct Salary Cycles:" + resdata);
                    saCycles = resdata;
                    verifySalaryCycleNotExist();
                }).catch((err) => {
                    logger.error("Error Location SalaryCalculations6001")
                    logger.error(err);
                    throw err;
                });
        }

        //to verify the salary cycle not exist from SDdetails table
        //if the saalary cycle already exist in SDDetails , that mean it already be finalized previously, then return error

        let verifySalaryCycleNotExist = function () {
            logger.info("Start verify Salary Cycle exist.......");
            let isExist = false;
            let processCount = 0;
            let WorkFlowControl = function () {
                if (processCount === saCycles.length) {
                    if (!isExist) {
                        moveSalaryCalDataToSDDetails();
                    } else {
                        rel({
                            status: 500,
                            message: "工资数据之前已经被锁定，不能覆盖"
                        })
                    }
                }
            }

            for (let i = 0; i < saCycles.length; i++) {

                sequelize.query("select count(*) as countnum from SalaryDetails where salaryCycle=:salaryCycle", { replacements: { salaryCycle: saCycles[i].salaryCycle }, type: sequelize.QueryTypes.SELECT })
                    .then(countnum => {
                        countnum = countnum[0].countnum;
                        if (countnum > 0) {
                            isExist = true;
                            processCount = saCycles.length;
                            WorkFlowControl();
                        }
                        processCount++;
                        WorkFlowControl();
                    }).catch((err) => {
                        logger.error("Error Location SalaryCalculations6002")
                        logger.error(err);
                        rel({
                            status: 500,
                            message: err
                        })
                    });
            }
        }

        //move SalaryCalculation data to SDDetails tables
        let moveSalaryCalDataToSDDetails = function () {
            logger.info("move salary data to SD Details.......");
            let salaryCalData = SalaryDetails.findAll().then((salCaldata) => {
                salCaldata = JSON.parse(JSON.stringify(salCaldata))

                salCaldata = salCaldata.map(function (item) {
                    delete item.id;
                    return item;
                })


                if (salCaldata.length > 0) {

                    SDTable.bulkCreate(salCaldata).then(() => {
                        //delete all data from Salary Calculation Table
                        sequelize.query("delete from SalaryCalculations", { type: sequelize.QueryTypes.DELETE })
                            .then(delres => {
                                //update salary Cycles status
                                updateSalaryCyclesStatus();
                            }).catch((err) => {
                                logger.error("Error Location SalaryCalculations6003")
                                logger.error(err);
                                rel({
                                    status: 500,
                                    message: err
                                })
                            });
                    }).catch(err => {
                        logger.error("Error Location SalaryCalculations6004")
                        logger.error(err);
                        rel({
                            status: 500,
                            message: err
                        })
                    })
                }
            })
        }

        //update salary Cycles status

        let updateSalaryCyclesStatus = function () {
            let processCount = 0;
            let WorkFlowControl = function () {
                if (processCount === saCycles.length) {
                    //move Regular OT Data to history table
                    moveRegularEmpOTDataToHistory();
                }
            }

            for (let i = 0; i < saCycles.length; i++) {
                sequelize.query("select * from SalaryCycles where salaryCycle=:salaryCycle", { replacements: { salaryCycle: saCycles[i].salaryCycle }, type: sequelize.QueryTypes.SELECT })
                    .then(saCycle => {
                        saCycle = JSON.parse(JSON.stringify(saCycle));
                        if (saCycle.length > 0) {
                            sequelize.query("update SalaryCycles set status='Closed' where salaryCycle=:salaryCycle ", { replacements: { salaryCycle: saCycles[i].salaryCycle }, type: sequelize.QueryTypes.UPDATE })
                                .then(upres => {
                                    processCount++;
                                    WorkFlowControl();
                                })
                        } else {

                            SalaryCycles.create({
                                salaryCycle: saCycles[i].salaryCycle,
                                status: 'Closed'
                            }).then(crres => {
                                processCount++;
                                WorkFlowControl();
                            })
                        }
                    })
            }
        }

        //move data from regular OT to regular OT history table

        let moveRegularEmpOTDataToHistory = function () {
            logger.info("Start regular Emp OT Data to history table.......");
            let processCount = 0;
            let WorkFlowControl = function () {
                if (processCount === saCycles.length) {
                    moveNonRegularDataToHistory();
                }
            }

            for (let i = 0; i < saCycles.length; i++) {
                sequelize.query("select * from EmpOTs where OTCycle=:salaryCycle", { replacements: { salaryCycle: saCycles[i].salaryCycle }, type: sequelize.QueryTypes.SELECT })
                    .then(resdata => {
                        resdata = JSON.parse(JSON.stringify(resdata));
                        if (resdata.length > 0) {

                            resdata = resdata.map(function (item) {
                                delete item.id;
                                return item;
                            })

                            regularEmpOTHistory.bulkCreate(resdata).then(() => {
                                //delete all data from Salary Calculation Table
                                sequelize.query("delete from EmpOTs where OTCycle=:salaryCycle", { replacements: { salaryCycle: saCycles[i].salaryCycle }, type: sequelize.QueryTypes.DELETE })
                                    .then(delres => {
                                        processCount++;
                                        WorkFlowControl();
                                    }).catch((err) => {
                                        logger.error("Error Location SalaryCalculations6005")
                                        logger.error(err);
                                        rel({
                                            status: 500,
                                            message: err
                                        })
                                    });
                            }).catch(err => {
                                logger.error("Error Location SalaryCalculations6006")
                                logger.error(err);
                                rel({
                                    status: 500,
                                    message: err
                                })
                            })
                        } else {
                            processCount++;
                            WorkFlowControl();
                        }

                    }).catch((err) => {
                        logger.error("Error Location SalaryCalculations6002")
                        logger.error(err);
                        rel({
                            status: 500,
                            message: err
                        })
                    });
            }
        }

        //move data from non regular salary  to non-regular salary history table

        let moveNonRegularDataToHistory = function () {
            logger.info("move non-regular salary data to history table.......");
            let processCount = 0;
            let WorkFlowControl = function () {
                if (processCount === saCycles.length) {
                    rel({
                        status: 200,
                        message: "全部工资数据冻结完成"
                    })

                }
            }

            for (let i = 0; i < saCycles.length; i++) {
                sequelize.query("select * from NonRegularSalaries where salaryCycle=:salaryCycle", { replacements: { salaryCycle: saCycles[i].salaryCycle }, type: sequelize.QueryTypes.SELECT })
                    .then(resdata => {
                        resdata = JSON.parse(JSON.stringify(resdata));

                        resdata = resdata.map(function (item) {
                            delete item.id;
                            return item;
                        })

                        if (resdata.length > 0) {
                            nonRegularEmpSalaryHistory.bulkCreate(resdata).then(() => {
                                //delete all data from Salary Calculation Table
                                sequelize.query("delete from NonRegularSalaries where salaryCycle=:salaryCycle", { replacements: { salaryCycle: saCycles[i].salaryCycle }, type: sequelize.QueryTypes.DELETE })
                                    .then(delres => {
                                        processCount++;
                                        WorkFlowControl();
                                    }).catch((err) => {
                                        logger.error("Error Location SalaryCalculations6007")
                                        logger.error(err);
                                        rel({
                                            status: 500,
                                            message: err
                                        })
                                    });
                            }).catch(err => {
                                logger.error("Error Location SalaryCalculations6008")
                                logger.error(err);
                                rel({
                                    status: 500,
                                    message: err
                                })
                            })
                        } else {
                            processCount++;
                            WorkFlowControl();
                        }

                    }).catch((err) => {
                        logger.error("Error Location SalaryCalculations6002")
                        logger.error(err);
                        rel({
                            status: 500,
                            message: err
                        })
                    });
            }
        }

        //Start from get all Distinct salary cycle
        getAllDistinctSalaryCycle();

    })
}


// SDServices.update = function (salaryCycle, salaryDataList) {
//     return new Promise(function (rel, rej) {
//         let processed = 0;
//         for (let i = 0; i < salaryDataList.length; i++) {
//             let emp = salaryDataList[i];
//             let empId = emp.empId;
//             logger.info("To Update Salary Details Data for : " + emp.name + " on Cycle:" + salaryCycle);
//             if (empId === null || empId === undefined || empId === '') {
//                 logger.error("The give empID is null,will skip");
//                 processed++;
//                 continue;
//             }
//             if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
//                 logger.error("The give salaryCycle is null,will skip");
//                 logger.error("Error Location SalaryDetails401")
//                 throw new Error("The give salaryCycle is null")
//             }

//             delete emp.idCard;
//             delete emp.bankAccount;
//             delete emp.birthday;

//             SalaryDetails.update(emp, {
//                 where: {
//                     empId: empId,
//                     salaryCycle: salaryCycle
//                 }
//             }).then((updateRes) => {
//                 processed++;
//                 if (processed === salaryDataList.length) {
//                     logger.info("Update Salary Details Data for Cycle:" + salaryCycle + " running completed");
//                     rel(true)
//                 }
//             }, (err) => {
//                 logger.error("Error Location SalaryDetails402")
//                 throw err;
//             }).catch(function (err) {
//                 logger.error("Error Location SalaryDetails403")
//                 throw err;
//             })
//         }
//     })
// }

// /**
//  * Allow user to speicify Salary Cycle within the data
//  */
// SDServices.upload = function (salaryDataList) {
//     return new Promise(function (rel, rej) {
//         let processed = 0;
//         let skipList = [];
//         let flowcontroll = function () {
//             if (processed >= salaryDataList.length) {
//                 logger.info("Upload Salary data finished");
//                 rel({
//                     status: 200,
//                     data: [],
//                     errorList: skipList,
//                     message: '',
//                 })
//             }
//         }
//         for (let i = 0; i < salaryDataList.length; i++) {
//             let emp = salaryDataList[i];
//             let empId = emp.empId;
//             let salaryCycle = emp.salaryCycle;
//             logger.info("To Update Salary Details Data for : " + emp.name + " on Cycle:" + salaryCycle);
//             if (empId === null || empId === undefined || empId === '') {
//                 logger.error("The give empID is null,will skip");
//                 logger.error("Error Location SalaryDetails501")
//                 skipList.push({
//                     empId: empId,
//                     name: emp.name,
//                     salaryCycle: emp.salaryCycle,
//                     message: '员工工号不能为空'
//                 });
//                 logger.error('员工工号不能为空' + emp.name)
//                 processed++;
//                 flowcontroll();
//                 continue;
//             }
//             if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
//                 logger.error("The give salaryCycle is null,will skip");
//                 logger.error("Error Location SalaryDetails502")
//                 skipList.push({
//                     empId: empId,
//                     name: emp.name,
//                     salaryCycle: emp.salaryCycle,
//                     message: '工次周期不能为空'
//                 });
//                 logger.error('工次周期不能为空' + empId + " , " + emp.name);
//                 processed++;
//                 flowcontroll();
//                 continue;
//             }

//             SalaryDetails.findOne({
//                 where: {
//                     empId: empId,
//                     salaryCycle: salaryCycle
//                 }
//             }).then((empsd) => {
//                 if (empsd === null || empsd === undefined) {
//                     /**
//                      * To create new Employee Salary Data
//                      */

//                     //第一步先找到这个员工，如果不存在，跳过
//                     EmpSenServices.getEmpById(empId).then(empsen => {
//                         if (empsen === null || empsen === undefined) {
//                             skipList.push({
//                                 empId: empId,
//                                 name: emp.name,
//                                 salaryCycle: emp.salaryCycle,
//                                 message: '此工号' + empId + '在员工敏感信息表中不存在'
//                             });
//                             logger.error('此工号' + empId + '在员工敏感信息表中不存在');
//                             processed++;
//                             flowcontroll();
//                         } else {
//                             emp.name = empsen.name;
//                             emp.department = empsen.department;
//                             emp.jobRole = empsen.jobRole;
//                             emp.workerCategory = empsen.workerCategory;
//                             emp.idCard == empsen.idCard;
//                             emp.birthday = empsen.birthday;
//                             emp.bankAccount = empsen.bankAccount;

//                             SalaryDetails.create(CoryptoEnpSen.EncrypteEmps(emp)).then((cres) => {
//                                 logger.info("Created successed for emp:" + emp.name + " , salarycycle:" + emp.salaryCycle);
//                                 processed++;
//                                 flowcontroll();
//                             }).catch(err => {
//                                 logger.error("Error Location SalaryDetails203")
//                                 skipList.push({
//                                     empId: empId,
//                                     name: emp.name,
//                                     salaryCycle: emp.salaryCycle,
//                                     message: '新建失败'
//                                 });
//                                 logger.error('新建失败' + empId)
//                                 processed++;
//                                 flowcontroll();
//                             })
//                         }
//                     })
//                 } else {
//                     /**
//                      * To Update Emp Salary Data
//                      */
//                     /**
//                      * 不给Update
//                      */
//                     logger.error('此工号' + empId + ' 和工资周期:' + emp.salaryCycle + '已经存在，不能更新');
//                     skipList.push({
//                         empId: empId,
//                         name: emp.name,
//                         salaryCycle: emp.salaryCycle,
//                         message: '此工号' + empId + ' 和工资周期:' + emp.salaryCycle + '已经存在，不能更新'
//                     });
//                     processed++;
//                     flowcontroll();
//                     // SalaryDetails.update(emp, {
//                     //     where: {
//                     //         empId: empId,
//                     //         salaryCycle: salaryCycle
//                     //     }
//                     // }).then((updateRes) => {
//                     //     processed++;
//                     //     if (processed === salaryDataList.length) {
//                     //         logger.info("Update Salary Details Data for Cycle:" + salaryCycle + " running completed");
//                     //         rel({
//                     //             status: 200,
//                     //             data: [],
//                     //             errorList: skipList,
//                     //             message: '更新成功'
//                     //         })
//                     //     }
//                     // }, (err) => {
//                     //     logger.error("Error Location SalaryDetails503")
//                     //     rel({
//                     //         status: 500,
//                     //         data: [],
//                     //         errorList: skipList,
//                     //         message: err
//                     //     })
//                     // }).catch(function (err) {
//                     //     logger.error("Error Location SalaryDetails504")
//                     //     rel({
//                     //         status: 500,
//                     //         data: [],
//                     //         errorList: skipList,
//                     //         message: err
//                     //     })
//                     // })
//                 }
//             }).catch(function (err) {
//                 logger.error("Error Location SalaryDetails505")
//                 logger.error('此工号' + empId + ", 查找员工时出错");
//                 skipList.push({
//                     empId: empId,
//                     name: emp.name,
//                     salaryCycle: emp.salaryCycle,
//                     message: '此工号' + empId + ", 查找员工时出错"
//                 });
//                 processed++;
//                 flowcontroll();
//             })
//         }
//     })
// }


SDServices.syncData = function () {

    return new Promise(function (rel, rej) {
        let SDCycles = [];

        //step 1 get all Distinct Salary Cycle from Salary Details table

        let getDistinctSalaryCycles = function () {
            logger.info("Start get all Distinct Salary Cycle.......");
            sequelize.query("SELECT DISTINCT salaryCycle from SalaryDetails", { type: sequelize.QueryTypes.SELECT })
                .then((resdata) => {
                    resdata = JSON.parse(JSON.stringify(resdata))
                    logger.info("Distinct Salary Cycles:" + resdata);
                    SDCycles = resdata;
                    updateSalaryCyclesTable();
                }).catch((err) => {
                    logger.error("Error Location SalaryCalculations7001")
                    logger.error(err);
                    rel({
                        status: 500,
                        message: "query distinct salary cycles from Salary Details table failed"
                    })
                });
        }

        //Update Salary Cycles Table

        let updateSalaryCyclesTable = function () {
            logger.info("start to update salaryCycles table.......");
            sequelize.query("SELECT * FROM salaryCycles", { type: sequelize.QueryTypes.SELECT })
                .then(salcyles => {
                    salcyles = JSON.parse(JSON.stringify(salcyles));
                    let SDCyclesIndex = 0;

                    let verifySalaryCycles = function () {
                        if (SDCyclesIndex < SDCycles.length) {
                            let cycleItem = SDCycles[SDCyclesIndex].salaryCycle;
                            let cycleItemExist = false;
                            for (let k = 0; k < salcyles.length; k++) {
                                if (salcyles[k].salaryCycle === cycleItem) {
                                    cycleItemExist = true;
                                    break;
                                }
                            }
                            if (!cycleItemExist) {
                                SalaryCycles.create({
                                    salaryCycle: cycleItem,
                                    status: 'Closed'
                                }).then(cres => {
                                    logger.info("Create new Salary Cycle res:" + JSON.stringify(cres));
                                    SDCyclesIndex++;
                                    verifySalaryCycles();
                                })
                            } else {
                                SDCyclesIndex++;
                                verifySalaryCycles();
                            }
                        } else {
                            //move OT Data
                            moveOTData();
                        }
                    }

                    verifySalaryCycles();

                }).catch((err) => {
                    logger.error("Error Location SalaryCalculations70011")
                    logger.error(err);
                    rel({
                        status: 500,
                        message: "update salary cycles table failed"
                    })
                });
        }
        //Move OT Data 

        let moveOTData = function () {
            logger.info("start to clean emp OT data");
            let allCycles = "";

            for (let i = 0; i < SDCycles.length; i++) {
                if (allCycles === "") {
                    allCycles = "'" + SDCycles[i].salaryCycle + "'";
                } else {
                    allCycles += " , '" + SDCycles[i].salaryCycle + "'";
                }

            }

            sequelize.query("SELECT * FROM EmpOTs where OTCycle in (" + allCycles + ")", { type: sequelize.QueryTypes.SELECT })
                .then(resdata => {
                    resdata = JSON.parse(JSON.stringify(resdata));
                    if (resdata.length > 0) {

                        resdata = resdata.map(function (item) {
                            delete item.id;
                            return item;
                        })

                        regularEmpOTHistory.bulkCreate(resdata).then(() => {
                            //delete all data from Salary Calculation Table
                            sequelize.query("delete from EmpOTs where OTCycle in (" + allCycles + ")", { type: sequelize.QueryTypes.DELETE })
                                .then(delres => {

                                    //move non-regular Data;
                                    cleanNonRegularData(allCycles);
                                }).catch((err) => {
                                    logger.error("Error Location SalaryCalculations7002")
                                    logger.error(err);
                                });
                        }).catch(err => {
                            logger.error("Error Location SalaryCalculations7003")
                            logger.error(err);
                        })
                    } else {
                        //move non-regular Data;
                        cleanNonRegularData(allCycles);
                    }
                }).catch((err) => {
                    logger.error("Error Location SalaryCalculations7012")
                    logger.error(err);
                    rel({
                        status: 500,
                        message: "move OT data failed"
                    })
                });;

        }

        //clean non-Regular Emp Data
        let cleanNonRegularData = function (allCycles) {
            logger.info("start to clean non-regular emp data");
            sequelize.query("SELECT * FROM NonRegularSalaries where salaryCycle in (" + allCycles + ")", { type: sequelize.QueryTypes.SELECT })
                .then(resdata => {
                    resdata = JSON.parse(JSON.stringify(resdata));
                    if (resdata.length > 0) {

                        resdata = resdata.map(function (item) {
                            delete item.id;
                            return item;
                        })

                        nonRegularEmpSalaryHistory.bulkCreate(resdata).then(() => {
                            //delete all data from Salary Calculation Table
                            sequelize.query("delete from NonRegularSalaries where salaryCycle in (" + allCycles + ")", { type: sequelize.QueryTypes.DELETE })
                                .then(delres => {

                                    logger.info("Syncnization Data completed");
                                    rel({
                                        status: 200,
                                        message: "Syncnization Data completed"
                                    })
                                }).catch((err) => {
                                    logger.error("Error Location SalaryCalculations7004")
                                    logger.error(err);
                                });
                        }).catch(err => {
                            logger.error("Error Location SalaryCalculations7005")
                            logger.error(err);
                        })
                    } else {
                        rel({
                            status: 200,
                            message: "Syncnization Data completed"
                        })
                    }
                }).catch((err) => {
                    logger.error("Error Location SalaryCalculations7013")
                    logger.error(err);
                    rel({
                        status: 500,
                        message: "move non-regular emp data failed"
                    })
                });
        }

        getDistinctSalaryCycles();
    })

}


module.exports = SDServices;
