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
var ReportModel = require("./Model/ReportModel");
var NonRegularReportModel = require("./Model/NonRegularReportModel");

const RegularReportDataModel = ['jibengongzi',
    'totalJiangjin',
    'totalOT',
    'tongxunButie',
    'totalKouchu',
    'yingfagongzi',
    'nianjin',
    'yanglaobaoxian',
    'shiyebaoxian',
    'zhufanggongjijin',
    'yiliaobaoxian',
    'tax',
    'yicixingjiangjin',
    'yicixingjiangjinTax',
    'buchongyiliaobaoxian',
    'netIncome'];
const NonRegularReportReportDataModel = ['jibengongzi', 'yingfagongzi', 'totalJiangjin', 'totalOT', 'tax', 'netIncome'];


GZDServices.getDataByCycle = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        getGongZiDanData(salaryCycle, null, false).then(gzds => {
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
        getGongZiDanData(null, criteria, true).then(gzds => {
            rel(gzds);
        }).catch(err => {
            logger.error("Error Location GongZiDanServices002");
            logger.error(err);
            throw err;
        })
    })
}

var getGongZiDanData = function (salaryCycle, criteria, needGatherData) {
    return new Promise(function (rel, rej) {
        let salarylist = [];
        let empsalarys = [];

        let startGenerationData = function () {
            let jibengongzi = 0,
                totalJiangjin = 0,
                totalOT = 0,
                tongxunButie = 0,
                nianjin = 0,
                yanglaobaoxian = 0,
                shiyebaoxian = 0,
                zhufanggongjijin = 0,
                yiliaobaoxian = 0,
                totalKouchu = 0,
                tax = 0,
                yicixingjiangjin = 0,
                yicixingjiangjinTax = 0,
                buchongyiliaobaoxian = 0,
                netIncome = 0,
                yingfagongzi = 0;

            for (let i = 0; i < empsalarys.length; i++) {
                let empsalary = empsalarys[i];
                if (empsalary.workerCategory === NonRegularEmployeeCategory) {
                    let newgongzidan = NonRegularEmpSalaryModel(empsalary);
                    yingfagongzi += newgongzidan.yingfagongzi ? parseFloat(newgongzidan.yingfagongzi) : 0;
                    jibengongzi += newgongzidan.jibengongzi ? parseFloat(newgongzidan.jibengongzi) : 0;
                    totalJiangjin += newgongzidan.totalJiangjin ? parseFloat(newgongzidan.totalJiangjin) : 0;
                    totalOT += newgongzidan.totalOT ? parseFloat(newgongzidan.totalOT) : 0;
                    tax += newgongzidan.tax ? parseFloat(newgongzidan.tax) : 0;
                    netIncome += newgongzidan.netIncome ? parseFloat(newgongzidan.netIncome) : 0;

                    salarylist.push(newgongzidan);
                } else {
                    let newgongzidan = SalaryModel(empsalary);
                    yingfagongzi += newgongzidan.yingfagongzi ? parseFloat(newgongzidan.yingfagongzi) : 0;
                    jibengongzi += newgongzidan.jibengongzi ? parseFloat(newgongzidan.jibengongzi) : 0;
                    totalJiangjin += newgongzidan.totalJiangjin ? parseFloat(newgongzidan.totalJiangjin) : 0;
                    totalOT += newgongzidan.totalOT ? parseFloat(newgongzidan.totalOT) : 0;
                    tongxunButie += newgongzidan.tongxunButie ? parseFloat(newgongzidan.tongxunButie) : 0;
                    nianjin += newgongzidan.nianjin ? parseFloat(newgongzidan.nianjin) : 0;
                    yanglaobaoxian += newgongzidan.yanglaobaoxian ? parseFloat(newgongzidan.yanglaobaoxian) : 0;
                    shiyebaoxian += newgongzidan.shiyebaoxian ? parseFloat(newgongzidan.shiyebaoxian) : 0;
                    zhufanggongjijin += newgongzidan.zhufanggongjijin ? parseFloat(newgongzidan.zhufanggongjijin) : 0;
                    yiliaobaoxian += newgongzidan.yiliaobaoxian ? parseFloat(newgongzidan.yiliaobaoxian) : 0;
                    totalKouchu += newgongzidan.totalKouchu ? parseFloat(newgongzidan.totalKouchu) : 0;
                    tax += newgongzidan.tax ? parseFloat(newgongzidan.tax) : 0;
                    yicixingjiangjin += newgongzidan.yicixingjiangjin ? parseFloat(newgongzidan.yicixingjiangjin) : 0;
                    yicixingjiangjinTax += newgongzidan.yicixingjiangjinTax ? parseFloat(newgongzidan.yicixingjiangjinTax) : 0;
                    buchongyiliaobaoxian += newgongzidan.buchongyiliaobaoxian ? parseFloat(newgongzidan.buchongyiliaobaoxian) : 0;
                    netIncome += newgongzidan.netIncome ? parseFloat(newgongzidan.netIncome) : 0;

                    salarylist.push(newgongzidan);

                }
            }

            if (needGatherData) {
                let newEmpSA = {
                    empId: '统计汇总',
                    name: '',
                    gender: '',
                    idCard: '',
                    bankAccount: '',
                    workAge: '',
                    comment: '',
                    department: '',
                    jobRole: '',
                    workerCategory: '',
                    salaryCycle: '',
                    jibengongzi: jibengongzi.toFixed(2) + '',
                    totalJiangjin: totalJiangjin.toFixed(2) + '',
                    totalOT: totalOT.toFixed(2) + '',
                    tongxunButie: tongxunButie.toFixed(2) + '',
                    yingfagongzi: yingfagongzi.toFixed(2) + '',
                    nianjin: nianjin + '',
                    yanglaobaoxian: yanglaobaoxian.toFixed(2) + '',
                    shiyebaoxian: shiyebaoxian.toFixed(2) + '',
                    zhufanggongjijin: zhufanggongjijin.toFixed(2) + '',
                    yiliaobaoxian: yiliaobaoxian.toFixed(2) + '',
                    totalKouchu: totalKouchu.toFixed(2) + '',
                    tax: tax.toFixed(2) + '',
                    yicixingjiangjin: yicixingjiangjin.toFixed(2) + '',
                    yicixingjiangjinTax: yicixingjiangjinTax.toFixed(2) + '',
                    buchongyiliaobaoxian: buchongyiliaobaoxian.toFixed(2) + '',
                    netIncome: netIncome.toFixed(2) + '',
                    gongziDesc: ''
                }

                salarylist.push(newEmpSA);
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
    console.log(criteria)
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
            wherecase = " where salaryCycle <='" + criteria.endSalaryCycle + "'";
        } else {
            wherecase += " and salaryCycle <='" + criteria.endSalaryCycle + "'";
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

    if (criteria.salaryCycle) {
        if (wherecase === '') {
            wherecase = "  where salaryCycle ='" + criteria.salaryCycle + "'";
        } else {
            wherecase += " and salaryCycle ='" + criteria.salaryCycle + "'";
        }
    }

    return wherecase;
}

let calculateReportingData = function (empsa, reportDataModel) {
    if (empsa.workerCategory === NonRegularEmployeeCategory) {

        reportDataModel.yingfagongzi = reportDataModel.yingfagongzi + parseFloat(empsa.yingfagongzi);
        reportDataModel.jibengongzi = reportDataModel.jibengongzi + parseFloat(empsa.jibengongzi);
        reportDataModel.totalJiangjin = reportDataModel.totalJiangjin + parseFloat(empsa.anquanJiangli) + parseFloat(empsa.wuweizhangJiangli);
        reportDataModel.totalOT = reportDataModel.totalOT + parseFloat(empsa.OTJiangjin);
        reportDataModel.tax = reportDataModel.tax + parseFloat(empsa.tax);
        reportDataModel.netIncome = reportDataModel.netIncome + parseFloat(empsa.netIncome);

    } else {

        reportDataModel.jibengongzi += parseFloat(empsa.jibengongzi);
        reportDataModel.totalJiangjin += (parseFloat(empsa.zhiwuJintie) + parseFloat(empsa.gongliBuzhu) + parseFloat(empsa.kaoheJiangjin) + parseFloat(empsa.qitaJiangjin) + parseFloat(empsa.xiaxiangBuzhu) + parseFloat(empsa.yingyetingBuzhu));
        reportDataModel.totalOT += (parseFloat(empsa.NormalOT) + parseFloat(empsa.WeekendOT) + parseFloat(empsa.HolidayOT));
        reportDataModel.tongxunButie += parseFloat(empsa.tongxunButie);
        reportDataModel.nianjin += parseFloat(empsa.nianjin);
        reportDataModel.yanglaobaoxian += parseFloat(empsa.yanglaobaoxian);
        reportDataModel.shiyebaoxian += parseFloat(empsa.shiyebaoxian);
        reportDataModel.zhufanggongjijin += parseFloat(empsa.zhufanggongjijin);
        reportDataModel.yiliaobaoxian += parseFloat(empsa.yiliaobaoxian);
        reportDataModel.totalKouchu += (parseFloat(empsa.kouchu) + parseFloat(empsa.kaohekoukuan));
        reportDataModel.tax += parseFloat(empsa.tax);
        reportDataModel.yicixingjiangjin += parseFloat(empsa.yicixingjiangjin);
        reportDataModel.yicixingjiangjinTax += parseFloat(empsa.yicixingjiangjinTax);
        reportDataModel.buchongyiliaobaoxian += parseFloat(empsa.buchongyiliaobaoxian);
        reportDataModel.yingfagongzi += parseFloat(empsa.yingfagongzi);
        reportDataModel.netIncome += parseFloat(empsa.netIncome);


    }

    return reportDataModel;
}

let gatherReportData = function (reportDataModel, gatherObj) {

    if (reportDataModel.workerCategory === NonRegularEmployeeCategory) {
        gatherObj.jibengongzi += parseFloat(reportDataModel.jibengongzi);
        gatherObj.totalJiangjin += parseFloat(reportDataModel.totalJiangjin);
        gatherObj.totalOT += parseFloat(reportDataModel.totalOT);
        gatherObj.tax += parseFloat(reportDataModel.tax);
        gatherObj.netIncome += parseFloat(reportDataModel.netIncome);
        gatherObj.yingfagongzi += parseFloat(reportDataModel.yingfagongzi);
    } else {
        gatherObj.jibengongzi += parseFloat(reportDataModel.jibengongzi);
        gatherObj.totalJiangjin += parseFloat(reportDataModel.totalJiangjin);
        gatherObj.totalOT += parseFloat(reportDataModel.totalOT);
        gatherObj.tongxunButie += parseFloat(reportDataModel.tongxunButie);
        gatherObj.nianjin += parseFloat(reportDataModel.nianjin);
        gatherObj.yanglaobaoxian += parseFloat(reportDataModel.yanglaobaoxian);
        gatherObj.shiyebaoxian += parseFloat(reportDataModel.shiyebaoxian);
        gatherObj.zhufanggongjijin += parseFloat(reportDataModel.zhufanggongjijin);
        gatherObj.yiliaobaoxian += parseFloat(reportDataModel.yiliaobaoxian);
        gatherObj.totalKouchu += parseFloat(reportDataModel.totalKouchu);
        gatherObj.tax += parseFloat(reportDataModel.tax);
        gatherObj.yicixingjiangjin += parseFloat(reportDataModel.yicixingjiangjin);
        gatherObj.yicixingjiangjinTax += parseFloat(reportDataModel.yicixingjiangjinTax);
        gatherObj.buchongyiliaobaoxian += parseFloat(reportDataModel.buchongyiliaobaoxian);
        gatherObj.netIncome += parseFloat(reportDataModel.netIncome);
        gatherObj.yingfagongzi += parseFloat(reportDataModel.yingfagongzi);
    }
    return gatherObj;
}

let TransferFloatToString = function (ArrayObj) {

    for (let i = 0; i < ArrayObj.length; i++) {

        if (ArrayObj[i].workerCategory === NonRegularEmployeeCategory) {
            NonRegularReportReportDataModel.forEach(function (key) {
                ArrayObj[i][key] = parseFloat(ArrayObj[i][key]).toFixed(2);
            })
        } else {

            RegularReportDataModel.forEach(function (key) {
                ArrayObj[i][key] = parseFloat(ArrayObj[i][key]).toFixed(2);
            })
        }
    }
    return ArrayObj;
}

GZDServices.calculateByWorkerCategory = function (criteria) {
    return new Promise(function (rel, rej) {
        let salarylist = [];
        let empsalarys = [];
        let wherecase = buildWhereCase(criteria);
        let gatherDataObject = {};
        let startGenerationData = function () {
            empsalarys.forEach(function (emp) {
                let workerCategory = emp.workerCategory;
                if (gatherDataObject[workerCategory]) {
                    gatherDataObject[workerCategory] = calculateReportingData(emp, gatherDataObject[workerCategory]);
                } else {
                    let x = ReportModel(workerCategory, '');
                    if (workerCategory === NonRegularEmployeeCategory) {

                        gatherDataObject[workerCategory] = calculateReportingData(emp, NonRegularReportModel(workerCategory, ''));
                    } else {
                        gatherDataObject[workerCategory] = calculateReportingData(emp, ReportModel(workerCategory, ''));
                    }

                }
            })

            let gatherObj = ReportModel("统计汇总", '');
            for (var key in gatherDataObject) {
                gatherObj = gatherReportData(gatherDataObject[key], gatherObj);
                salarylist.push(gatherDataObject[key]);
            }
            salarylist.push(gatherObj);

            rel(TransferFloatToString(salarylist));
        }
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


    })

}

GZDServices.calculateByDepartment = function (criteria) {
    return new Promise(function (rel, rej) {
        let salarylist = [];
        let empsalarys = [];
        let wherecase = buildWhereCase(criteria);
        let gatherDataObject = {};
        let startGenerationData = function () {
            empsalarys.forEach(function (emp) {
                let workerCategory = emp.workerCategory;
                let department = emp.department;

                if (gatherDataObject[department]) {

                    gatherDataObject[department] = calculateReportingData(emp, gatherDataObject[department]);
                } else {
                    if (workerCategory === NonRegularEmployeeCategory) {
                        gatherDataObject[department] = calculateReportingData(emp, ReportModel('bydepartment', department));
                    } else {
                        gatherDataObject[department] = calculateReportingData(emp, ReportModel('bydepartment', department));
                    }

                }
            })

            let gatherObj = ReportModel('', "统计汇总");
            for (var key in gatherDataObject) {
                gatherObj = gatherReportData(gatherDataObject[key], gatherObj);
                salarylist.push(gatherDataObject[key]);
            }
            salarylist.push(gatherObj);

            rel(TransferFloatToString(salarylist));
        }
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


    })

}


module.exports = GZDServices;