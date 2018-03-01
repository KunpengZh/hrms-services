
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-EmpDeskAccount-Services');
logger.level = 'All';
var sequelize = require('../mysql/hrmsdb');

var EmpDeskAccount = {};

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

EmpDeskAccount.getAvailableCalendarYear = function () {
    return new Promise(function (rel, rej) {
        let result = {};
        let yearsReady = false, configDataReady = false;
        let workFlowControl = function () {
            if (yearsReady && configDataReady) {
                rel({
                    status: 200,
                    data: result
                });
            }
        }
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

        sequelize.query("SELECT DISTINCT LEFT(salaryCycle,4) as years FROM SalaryCycles", { type: sequelize.QueryTypes.SELECT })
            .then(years => {
                years = JSON.parse(JSON.stringify(years));
                let returnYears = [];
                for (let i = 0; i < years.length; i++) {
                    returnYears.push({
                        value: years[i].years,
                        label: years[i].years
                    })
                }
                result.calendarYears = returnYears;
                yearsReady = true;
                workFlowControl();
            }, err => {
                logger.error("Error Location DeskAccountServices001");
                rel({
                    status: 500,
                    data: [],
                    message: err
                });
            }).catch(err => {
                logger.error("Error Location DeskAccountServices002");
                rel({
                    status: 500,
                    data: [],
                    message: err
                });
            });

    })
}

// EmpDeskAccount.getEmpDeskAccountByYearV1 = function (calendarYear) {
//     return new Promise(function (rel, rej) {


//         let startSalaryCycle = calendarYear + "01";
//         let endSalaryCycle = calendarYear + "12";

//         let ObjData = ['Xiaoji', 'Gongzi', 'Jiangjin', 'Wuxiangfuli'];
//         let RowData = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JANTODEC'];
//         let empaccount = [];

//         let createEmpAccount = function (empId, name, workerCategory, department, jobrole) {

//             let newaccount = {
//                 empId: empId,
//                 name: name,
//                 workerCategory: workerCategory,
//                 department: department,
//                 jobrole: jobrole
//             }

//             for (let i = 0; i < RowData.length; i++) {
//                 let newObj = {};
//                 for (let k = 0; k < ObjData.length; k++) {
//                     newObj[ObjData[k]] = '';
//                 }
//                 newaccount[RowData[i]] = newObj;
//             }

//             return newaccount;

//         }

//         let translateMonthNumToMonth = function (monthNum) {
//             monthNum = parseInt(monthNum) - 1;


//             if (monthNum < 0 || monthNum > 11) {
//                 return ""
//             } else {
//                 return RowData[monthNum];
//             }
//         }

//         let zongji = createEmpAccount("", "总计", "", "", "");

//         for (let i = 0; i < RowData.length; i++) {
//             for (let k = 0; k < ObjData.length; k++) {
//                 zongji[RowData[i]][ObjData[k]] = 0;
//             }
//         }


//         sequelize.query("SELECT empId,name,workerCategory,department, jobrole, salaryCycle, yingfagongzi,jibengongzi from SalaryDetails where salaryCycle>=:startSalaryCycle and salaryCycle<=:endSalaryCycle", { replacements: { startSalaryCycle: startSalaryCycle, endSalaryCycle: endSalaryCycle }, type: sequelize.QueryTypes.SELECT })
//             .then(saldata => {

//                 for (let i = 0; i < saldata.length; i++) {

//                     let isEmpaSAExist = false;
//                     for (let k = 0; k < empaccount.length; k++) {
//                         if (empaccount[k].empId === saldata[i].empId) {
//                             let samonth = translateMonthNumToMonth(saldata[i].salaryCycle.substring(4, 6));
//                             empaccount[k][samonth].Xiaoji = saldata[i].yingfagongzi;
//                             empaccount[k][samonth].Gongzi = saldata[i].jibengongzi;
//                             empaccount[k][samonth].Jiangjin = keepTwoDecimalFull(parseFloat(saldata[i].yingfagongzi) - parseFloat(saldata[i].jibengongzi));

//                             empaccount[k].JANTODEC.Xiaoji = keepTwoDecimalFull(parseFloat(empaccount[k].JANTODEC.Xiaoji) + parseFloat(empaccount[k][samonth].Xiaoji));
//                             empaccount[k].JANTODEC.Gongzi = keepTwoDecimalFull(parseFloat(empaccount[k].JANTODEC.Gongzi) + parseFloat(empaccount[k][samonth].Gongzi));
//                             empaccount[k].JANTODEC.Jiangjin = keepTwoDecimalFull(parseFloat(empaccount[k].JANTODEC.Jiangjin) + parseFloat(empaccount[k][samonth].Jiangjin));

//                             zongji[samonth].Xiaoji = keepTwoDecimalFull(parseFloat(zongji[samonth].Xiaoji) + parseFloat(empaccount[k][samonth].Xiaoji));
//                             zongji[samonth].Gongzi = keepTwoDecimalFull(parseFloat(zongji[samonth].Gongzi) + parseFloat(empaccount[k][samonth].Gongzi));
//                             zongji[samonth].Jiangjin = keepTwoDecimalFull(parseFloat(zongji[samonth].Jiangjin) + parseFloat(empaccount[k][samonth].Jiangjin));

//                             zongji.JANTODEC.Xiaoji = keepTwoDecimalFull(parseFloat(zongji.JANTODEC.Xiaoji) + parseFloat(empaccount[k][samonth].Xiaoji));
//                             zongji.JANTODEC.Gongzi = keepTwoDecimalFull(parseFloat(zongji.JANTODEC.Gongzi) + parseFloat(empaccount[k][samonth].Gongzi));
//                             zongji.JANTODEC.Jiangjin = keepTwoDecimalFull(parseFloat(zongji.JANTODEC.Jiangjin) + parseFloat(empaccount[k][samonth].Jiangjin));

//                             isEmpaSAExist = true;
//                             break;
//                         }
//                     }
//                     if (!isEmpaSAExist) {
//                         let newemp = createEmpAccount(saldata[i].empId, saldata[i].name, saldata[i].workerCategory, saldata[i].department, saldata[i].jobrole);
//                         let samonth = translateMonthNumToMonth(saldata[i].salaryCycle.substring(4, 6));

//                         newemp[samonth].Xiaoji = saldata[i].yingfagongzi;
//                         newemp[samonth].Gongzi = saldata[i].jibengongzi;
//                         newemp[samonth].Jiangjin = keepTwoDecimalFull(parseFloat(saldata[i].yingfagongzi) - parseFloat(saldata[i].jibengongzi));

//                         newemp.JANTODEC.Xiaoji = saldata[i].yingfagongzi;
//                         newemp.JANTODEC.Gongzi = saldata[i].jibengongzi;
//                         newemp.JANTODEC.Jiangjin = newemp[samonth].Jiangjin;

//                         zongji[samonth].Xiaoji = keepTwoDecimalFull(parseFloat(zongji[samonth].Xiaoji) + parseFloat(newemp[samonth].Xiaoji));
//                         zongji[samonth].Gongzi = keepTwoDecimalFull(parseFloat(zongji[samonth].Gongzi) + parseFloat(newemp[samonth].Gongzi));
//                         zongji[samonth].Jiangjin = keepTwoDecimalFull(parseFloat(zongji[samonth].Jiangjin) + parseFloat(newemp[samonth].Jiangjin));

//                         zongji.JANTODEC.Xiaoji = keepTwoDecimalFull(parseFloat(zongji.JANTODEC.Xiaoji) + parseFloat(newemp.JANTODEC.Xiaoji));
//                         zongji.JANTODEC.Gongzi = keepTwoDecimalFull(parseFloat(zongji.JANTODEC.Gongzi) + parseFloat(newemp.JANTODEC.Gongzi));
//                         zongji.JANTODEC.Jiangjin = keepTwoDecimalFull(parseFloat(zongji.JANTODEC.Jiangjin) + parseFloat(newemp.JANTODEC.Jiangjin));

//                         empaccount.push(newemp);
//                     }
//                 }

//                 empaccount.push(zongji)
//                 rel({
//                     status: 200,
//                     data: empaccount
//                 })

//             }, err => {
//                 logger.error("Error Location DeskAccountServices003");
//                 logger.error(err);
//                 rel({
//                     status: 500,
//                     data: [],
//                     message: err
//                 });
//             }).catch(err => {
//                 logger.error("Error Location DeskAccountServices004");
//                 logger.error(err);
//                 rel({
//                     status: 500,
//                     data: [],
//                     message: err
//                 });
//             });
//     })
// }

EmpDeskAccount.getEmpDeskAccountByYear = function (calendarYear) {
    return new Promise(function (rel, rej) {


        let startSalaryCycle = calendarYear + "01";
        let endSalaryCycle = calendarYear + "12";

        let ObjData = ['Xiaoji', 'Gongzi', 'Jiangjin', 'Wuxiangfuli'];
        let RowData = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JANTODEC'];
        let empaccount = [];

        let createEmpAccount = function (empId, name, workerCategory, department, jobrole) {

            let newaccount = {
                empId: empId,
                name: name,
                workerCategory: workerCategory,
                department: department,
                jobRole: jobrole
            }

            for (let i = 0; i < RowData.length; i++) {
                for (let k = 0; k < ObjData.length; k++) {
                    newaccount[RowData[i] + ObjData[k]] = '';
                }
            }
            return newaccount;

        }

        let translateMonthNumToMonth = function (monthNum) {
            monthNum = parseInt(monthNum) - 1;


            if (monthNum < 0 || monthNum > 11) {
                return ""
            } else {
                return RowData[monthNum];
            }
        }

        let zongji = createEmpAccount("", "总计", "", "", "");

        for (let i = 0; i < RowData.length; i++) {
            for (let k = 0; k < ObjData.length; k++) {
                zongji[RowData[i] + ObjData[k]] = 0;
            }
        }


        sequelize.query("SELECT empId,name,workerCategory,department, jobrole, salaryCycle, yingfagongzi,jibengongzi,yicixingjiangjin from SalaryDetails where salaryCycle>=:startSalaryCycle and salaryCycle<=:endSalaryCycle", { replacements: { startSalaryCycle: startSalaryCycle, endSalaryCycle: endSalaryCycle }, type: sequelize.QueryTypes.SELECT })
            .then(saldata => {

                for (let i = 0; i < saldata.length; i++) {

                    let isEmpaSAExist = false;
                    for (let k = 0; k < empaccount.length; k++) {
                        if (empaccount[k].empId === saldata[i].empId) {
                            let samonth = translateMonthNumToMonth(saldata[i].salaryCycle.substring(4, 6));
                            let yicixingjiangjin = parseFloat(saldata[i].yicixingjiangjin);
                            if (yicixingjiangjin.toString() == "NaN") {
                                yicixingjiangjin = 0;
                            }
                            empaccount[k][samonth + 'Xiaoji'] = saldata[i].yingfagongzi;
                            empaccount[k][samonth + 'Gongzi'] = saldata[i].jibengongzi;
                            empaccount[k][samonth + 'Jiangjin'] = keepTwoDecimalFull(parseFloat(saldata[i].yingfagongzi) - parseFloat(saldata[i].jibengongzi) + yicixingjiangjin);

                            empaccount[k].JANTODECXiaoji = keepTwoDecimalFull(parseFloat(empaccount[k].JANTODECXiaoji) + parseFloat(empaccount[k][samonth + 'Xiaoji']));
                            empaccount[k].JANTODECGongzi = keepTwoDecimalFull(parseFloat(empaccount[k].JANTODECGongzi) + parseFloat(empaccount[k][samonth + 'Gongzi']));
                            empaccount[k].JANTODECJiangjin = keepTwoDecimalFull(parseFloat(empaccount[k].JANTODECJiangjin) + parseFloat(empaccount[k][samonth + 'Jiangjin']));

                            zongji[samonth + 'Xiaoji'] = keepTwoDecimalFull(parseFloat(zongji[samonth + 'Xiaoji']) + parseFloat(empaccount[k][samonth + 'Xiaoji']));
                            zongji[samonth + 'Gongzi'] = keepTwoDecimalFull(parseFloat(zongji[samonth + 'Gongzi']) + parseFloat(empaccount[k][samonth + 'Gongzi']));
                            zongji[samonth + 'Jiangjin'] = keepTwoDecimalFull(parseFloat(zongji[samonth + 'Jiangjin']) + parseFloat(empaccount[k][samonth + 'Jiangjin']));

                            zongji.JANTODECXiaoji = keepTwoDecimalFull(parseFloat(zongji.JANTODECXiaoji) + parseFloat(empaccount[k][samonth + 'Xiaoji']));
                            zongji.JANTODECGongzi = keepTwoDecimalFull(parseFloat(zongji.JANTODECGongzi) + parseFloat(empaccount[k][samonth + 'Gongzi']));
                            zongji.JANTODECJiangjin = keepTwoDecimalFull(parseFloat(zongji.JANTODECJiangjin) + parseFloat(empaccount[k][samonth + 'Jiangjin']));

                            isEmpaSAExist = true;
                            break;
                        }
                    }
                    if (!isEmpaSAExist) {
                        let newemp = createEmpAccount(saldata[i].empId, saldata[i].name, saldata[i].workerCategory, saldata[i].department, saldata[i].jobrole);
                        let samonth = translateMonthNumToMonth(saldata[i].salaryCycle.substring(4, 6));

                        let yicixingjiangjin = parseFloat(saldata[i].yicixingjiangjin);
                        if (yicixingjiangjin.toString() == "NaN") {
                            yicixingjiangjin = 0;
                        }

                        newemp[samonth + 'Xiaoji'] = saldata[i].yingfagongzi;
                        newemp[samonth + 'Gongzi'] = saldata[i].jibengongzi;
                        newemp[samonth + 'Jiangjin'] = keepTwoDecimalFull(parseFloat(saldata[i].yingfagongzi) - parseFloat(saldata[i].jibengongzi)+yicixingjiangjin);

                        newemp.JANTODECXiaoji = saldata[i].yingfagongzi;
                        newemp.JANTODECGongzi = saldata[i].jibengongzi;
                        newemp.JANTODECJiangjin = newemp[samonth + 'Jiangjin'];

                        zongji[samonth + 'Xiaoji'] = keepTwoDecimalFull(parseFloat(zongji[samonth + 'Xiaoji']) + parseFloat(newemp[samonth + 'Xiaoji']));
                        zongji[samonth + 'Gongzi'] = keepTwoDecimalFull(parseFloat(zongji[samonth + 'Gongzi']) + parseFloat(newemp[samonth + 'Gongzi']));
                        zongji[samonth + 'Jiangjin'] = keepTwoDecimalFull(parseFloat(zongji[samonth + 'Jiangjin']) + parseFloat(newemp[samonth + 'Jiangjin']));

                        zongji.JANTODECXiaoji = keepTwoDecimalFull(parseFloat(zongji.JANTODECXiaoji) + parseFloat(newemp.JANTODECXiaoji));
                        zongji.JANTODECGongzi = keepTwoDecimalFull(parseFloat(zongji.JANTODECGongzi) + parseFloat(newemp.JANTODECGongzi));
                        zongji.JANTODECJiangjin = keepTwoDecimalFull(parseFloat(zongji.JANTODECJiangjin) + parseFloat(newemp.JANTODECJiangjin));

                        empaccount.push(newemp);
                    }
                }

                empaccount.push(zongji)
                rel({
                    status: 200,
                    data: empaccount
                })

            }, err => {
                logger.error("Error Location DeskAccountServices003");
                logger.error(err);
                rel({
                    status: 500,
                    data: [],
                    message: err
                });
            }).catch(err => {
                logger.error("Error Location DeskAccountServices004");
                logger.error(err);
                rel({
                    status: 500,
                    data: [],
                    message: err
                });
            });
    })
}



module.exports = EmpDeskAccount;

