/**
 * Excel Utils
 * @Author:kpzhang@cn.ibm.com
 * June 28 2017
 */
var fs = require('fs');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Excel-Util');
logger.level = 'All';
var Excel = require('exceljs');


/**
 * Transfer Employee Basic Information Table to Excel 
 */

var setDefaultWorkBookProperties = function (workbook) {
    workbook.creator = 'Kunpeng Zhang';
    workbook.lastModifiedBy = 'Kunpeng Zhang';
    workbook.created = new Date();
    workbook.modified = new Date();
    return workbook;
}

var setEmpBasicColumns = function () {
    var columns = [
        { header: '员工号', key: 'empId', width: 15, style: { bold: true } },
        { header: '姓名', key: 'name', width: 15, style: { bold: true } },
        { header: '工作部门', key: 'department', width: 15, outlineLevel: 1, style: { bold: true } },
        { header: '工作岗位', key: 'jobRole', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '工龄', key: 'workAge', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '年龄', key: 'age', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '性别', key: 'gender', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '工作类别', key: 'workerCategory', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '备注', key: 'comment', width: 10, outlineLevel: 1, style: { bold: true } },
    ];
    return columns;
}


exports.EmpBasicInfoToExcel = function (emps, filename) {
    return new Promise(function (resolve, reject) {
        var workbook = new Excel.Workbook();
        workbook = setDefaultWorkBookProperties(workbook);
        var worksheet = workbook.addWorksheet('EmpBasicInfo', { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });
        worksheet.columns = setEmpBasicColumns();

        worksheet.addRows(emps);
        workbook.xlsx.writeFile(filename)
            .then(function () {
                logger.info("Successed write to file");
                resolve(filename);
            }).catch(function (err) {
                logger.error(err);
                logger.error("Error Location EXCELJS008")
                throw err;
            });
    })
}



/**
 * function to uplaod Basic Employee Information
 */

exports.EmpInfoToJSON = function (filename) {
    return new Promise(function (rel, rej) {
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(filename)
            .then(function (excelDoc) {
                var worksheet = excelDoc.getWorksheet(1);
                rowCount = worksheet.rowCount;
                if (rowCount < 1) {
                    logger.error("Do not find excel data");
                    logger.error("Error Location EXCELJS007")
                    throw new Error("Do not find excel data");
                    return;
                }

                let emps = [];

                worksheet.eachRow(function (row, rowNumber) {
                    if (rowNumber === 1) return;

                    let [, empId, name, department, jobRole, workAge, age, gender, workerCategory, comment] = row.values;
                    // if (null === name || name === undefined || name === '') {
                    //     logger.error("Employee is not provided from the excel, will skip row: " + rowNumber);
                    //     return;
                    // }
                    if ((null === name || name === undefined || name === '') && (null === empId || empId === undefined || empId === '')) {
                        logger.error("New Employee(without empID) name is not provided from the excel, will skip row: " + rowNumber);
                        return;
                    }
                    let emp = {
                        empId: empId ? empId : '',
                        department: department ? department : '',
                        jobRole: jobRole ? jobRole : '',
                        workAge: workAge ? workAge : '',
                        age: age ? age : '',
                        gender: gender ? gender : '',
                        workerCategory: workerCategory ? workerCategory : '',
                        comment: comment ? comment : ''
                    }
                    emps.push(emp);
                });

                rel(emps);
            }).catch(function (err) {
                logger.error("Error Location EXCELJS003")
                throw err;
            })
    })
};


var setEmpSensitiveColumns = function () {
    var columns = [
        { header: '员工号', key: 'empId', width: 15, style: { bold: true } },
        { header: '姓名', key: 'name', width: 15, style: { bold: true } },
        { header: '身份证', key: 'idCard', width: 15, outlineLevel: 1, style: { bold: true } },
        { header: '出生日期', key: 'birthday', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '银行帐号', key: 'bankAccount', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '技能工资', key: 'jinengGongzi', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '岗位工资', key: 'gangweiGongzi', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '基础补贴', key: 'jichuButie', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '洗理费', key: 'xilifei', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '工龄工资', key: 'gonglingGongzi', width: 15, style: { bold: true } },
        { header: '职务津贴', key: 'zhiwuJintie', width: 15, style: { bold: true } },
        { header: '公里补助', key: 'gongliBuzhu', width: 15, outlineLevel: 1, style: { bold: true } },
        { header: '考核奖金', key: 'kaoheJiangjin', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '通讯补贴', key: 'tongxunButie', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '其他津贴', key: 'qitaJiangjin', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '下乡补助', key: 'xiaxiangBuzhu', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '营业厅补助', key: 'yingyetingBuzhu', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '补充医疗保险', key: 'buchongyiliaobaoxian', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '上年收入', key: 'preAnnuallyIncom', width: 10, outlineLevel: 1, style: { bold: true } },
    ];
    return columns;
}

// { header: '年金', key: 'nianjin', width: 15, style: { bold: true } },
// { header: '企业年金', key: 'naqiyeNianjinme', width: 15, style: { bold: true } },
// { header: '养老保险', key: 'yanglaobaoxian', width: 15, outlineLevel: 1, style: { bold: true } },
// { header: '失业保险', key: 'shiyebaoxian', width: 10, outlineLevel: 1, style: { bold: true } },
// { header: '住房公积金', key: 'zhufanggongjijin', width: 10, outlineLevel: 1, style: { bold: true } },
// { header: '医疗保险', key: 'yiliaobaoxian', width: 10, outlineLevel: 1, style: { bold: true } },

exports.EmpSensitiveInfoToExcel = function (emps, filename) {
    return new Promise(function (resolve, reject) {
        var workbook = new Excel.Workbook();
        workbook = setDefaultWorkBookProperties(workbook);
        var worksheet = workbook.addWorksheet('EmpSensitiveInfo', { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });
        worksheet.columns = setEmpSensitiveColumns();

        worksheet.addRows(emps);
        workbook.xlsx.writeFile(filename)
            .then(function () {
                logger.info("Successed write to file");
                resolve(filename);
            }).catch(function (err) {
                logger.error(err);
                logger.error("Error Location EXCELJS028")
                throw err;
            });
    })
};

/**
 * function to uplaod Sensitive Employee Information
 */

exports.EmpSensitiveInfoToJSON = function (filename) {
    return new Promise(function (rel, rej) {
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(filename)
            .then(function (excelDoc) {
                var worksheet = excelDoc.getWorksheet(1);
                rowCount = worksheet.rowCount;
                if (rowCount < 1) {
                    logger.error("Do not find excel data");
                    logger.error("Error Location EXCELJS027")
                    throw new Error("Do not find excel data");
                    return;
                }

                let emps = [];

                worksheet.eachRow(function (row, rowNumber) {
                    if (rowNumber === 1) return;
                    let [, empId, name, idCard, birthday, bankAccount, jinengGongzi, gangweiGongzi, jichuButie, xilifei, gonglingGongzi, zhiwuJintie, gongliBuzhu,
                        kaoheJiangjin, tongxunButie, qitaJiangjin, xiaxiangBuzhu, yingyetingBuzhu, buchongyiliaobaoxian, preAnnuallyIncom] = row.values;
                    //nianjin, qiyeNianjin, yanglaobaoxian, shiyebaoxian, zhufanggongjijin, yiliaobaoxian,
                    // if (null === name || name === undefined || name === '') {
                    //     logger.error("Employee is not provided from the excel, will skip row: " + rowNumber);
                    //     return;
                    // };
                    if (null === empId || empId === undefined || empId === '') {
                        logger.error("Employee ID is not provided from the excel, will skip row: " + rowNumber);
                        return;
                    };
                    let emp = {
                        empId: empId ? empId : '',
                        idCard: idCard ? idCard : '',
                        birthday: birthday ? birthday : '',
                        bankAccount: bankAccount ? bankAccount : '',
                        jinengGongzi: jinengGongzi ? jinengGongzi : '',
                        gangweiGongzi: gangweiGongzi ? gangweiGongzi : '',
                        jichuButie: jichuButie ? jichuButie : '',
                        xilifei: xilifei ? xilifei : '',
                        gonglingGongzi: gonglingGongzi ? gonglingGongzi : '',
                        zhiwuJintie: zhiwuJintie ? zhiwuJintie : '',
                        gongliBuzhu: gongliBuzhu ? gongliBuzhu : '',
                        kaoheJiangjin: kaoheJiangjin ? kaoheJiangjin : '',
                        tongxunButie: tongxunButie ? tongxunButie : '',
                        qitaJiangjin: qitaJiangjin ? qitaJiangjin : '',
                        xiaxiangBuzhu: xiaxiangBuzhu ? xiaxiangBuzhu : '',
                        yingyetingBuzhu: yingyetingBuzhu ? yingyetingBuzhu : '',
                        buchongyiliaobaoxian: buchongyiliaobaoxian ? buchongyiliaobaoxian : '',
                        preAnnuallyIncom: preAnnuallyIncom ? preAnnuallyIncom : '',
                    }
                    // nianjin: nianjin ? nianjin : '',
                    // qiyeNianjin: qiyeNianjin ? qiyeNianjin : '',
                    // yanglaobaoxian: yanglaobaoxian ? yanglaobaoxian : '',
                    // shiyebaoxian: shiyebaoxian ? shiyebaoxian : '',
                    // zhufanggongjijin: zhufanggongjijin ? zhufanggongjijin : '',
                    // yiliaobaoxian: yiliaobaoxian ? yiliaobaoxian : '',
                    emps.push(emp);
                });

                rel(emps);
            }).catch(function (err) {
                logger.error("Error Location EXCELJS026")
                throw err;
            })
    })
};


var setOTDataColumns = function () {
    var columns = [
        { header: '员工号', key: 'empId', width: 15, style: { bold: true } },
        { header: '姓名', key: 'name', width: 15, style: { bold: true } },
        { header: '工作部门', key: 'department', width: 15, outlineLevel: 1, style: { bold: true } },
        { header: '工作岗位', key: 'jobRole', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '工作类别', key: 'workerCategory', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '加班周期', key: 'OTCycle', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '平时加班', key: 'NormalOT', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '周末加班', key: 'WeekendOT', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '节假日加班', key: 'HolidayOT', width: 10, outlineLevel: 1, style: { bold: true } },
    ];
    return columns;
}
exports.OTDataToExcel = function (OTDataLists, filename) {
    return new Promise(function (rel, rej) {
        var workbook = new Excel.Workbook();
        workbook = setDefaultWorkBookProperties(workbook);
        var worksheet = workbook.addWorksheet('OTData', { views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }] });
        worksheet.columns = setOTDataColumns();

        worksheet.addRows(OTDataLists);
        workbook.xlsx.writeFile(filename)
            .then(function () {
                logger.info("Successed write to file");
                rel(filename);
            }).catch(function (err) {
                logger.error(err);
                logger.error("Error Location EXCELJSOT001")
                throw err;
            });
    })
}

exports.OTExcelToJSON = function (filename) {
    return new Promise(function (rel, rej) {
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(filename)
            .then(function (excelDoc) {
                var worksheet = excelDoc.getWorksheet(1);
                rowCount = worksheet.rowCount;
                if (rowCount < 1) {
                    logger.error("Do not find excel data");
                    logger.error("Error Location EXCELJSOT002")
                    throw new Error("Do not find excel data");
                    return;
                }

                let OTLists = [];

                worksheet.eachRow(function (row, rowNumber) {
                    if (rowNumber === 1) return;
                    let [, empId, name, department, jobRole, workerCategory, OTCycle, NormalOT, WeekendOT, HolidayOT] = row.values;

                    if (null === empId || empId === undefined || empId === '') {
                        logger.error("Employee ID is not provided from the excel, will skip row: " + rowNumber);
                        return;
                    };
                    if (null === OTCycle || OTCycle === undefined || OTCycle === '') {
                        logger.error("OTCycle is not provided from the excel, will skip row: " + rowNumber);
                        return;
                    };
                    let OT = {
                        empId: empId ? empId : '',
                        OTCycle: OTCycle ? OTCycle : '',
                        NormalOT: NormalOT ? NormalOT : '0',
                        WeekendOT: WeekendOT ? WeekendOT : '0',
                        HolidayOT: HolidayOT ? HolidayOT : '0'
                    }
                    OTLists.push(OT);
                });

                rel(OTLists);
            }).catch(function (err) {
                logger.error("Error Location EXCELJSOT003")
                throw err;
            })
    })
};

/**
 * Funcitons for Salary Details uplaod and download
 */

var setSDColumns = function () {
    var columns = [
        { header: '员工号', key: 'empId', width: 15, style: { bold: true } },
        { header: '姓名', key: 'name', width: 15, style: { bold: true } },
        { header: '工作部门', key: 'department', width: 15, outlineLevel: 1, style: { bold: true } },
        { header: '工作岗位', key: 'jobRole', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '工作类别', key: 'workerCategory', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '工资周期', key: 'salaryCycle', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '技能工资', key: 'jinengGongzi', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '岗位工资', key: 'gangweiGongzi', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '基础补贴', key: 'jichuButie', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '洗理费', key: 'xilifei', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '工龄工资', key: 'gonglingGongzi', width: 15, style: { bold: true } },
        { header: '职务津贴', key: 'zhiwuJintie', width: 15, style: { bold: true } },
        { header: '公里补助', key: 'gongliBuzhu', width: 15, outlineLevel: 1, style: { bold: true } },
        { header: '考核奖金', key: 'kaoheJiangjin', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '通讯补贴', key: 'tongxunButie', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '其他津贴', key: 'qitaJiangjin', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '下乡补助', key: 'xiaxiangBuzhu', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '营业厅补助', key: 'yingyetingBuzhu', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '补充医疗保险', key: 'buchongyiliaobaoxian', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '工资扣除', key: 'kouchu', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '考核扣款', key: 'kaohekoukuan', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '年终奖金', key: 'yicixingjiangjin', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '上年收入', key: 'preAnnuallyIncom', width: 10, outlineLevel: 1, style: { bold: true } },
    ];
    return columns;
}
exports.SDDataToExcel = function (SDDataLists, filename) {
    return new Promise(function (rel, rej) {
        var workbook = new Excel.Workbook();
        workbook = setDefaultWorkBookProperties(workbook);
        var worksheet = workbook.addWorksheet('SalaryData', { views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }] });
        worksheet.columns = setSDColumns();

        worksheet.addRows(SDDataLists);
        workbook.xlsx.writeFile(filename)
            .then(function () {
                logger.info("Successed write to file");
                rel(filename);
            }).catch(function (err) {
                logger.error(err);
                logger.error("Error Location EXCELJSSDDATATOEXCEL001")
                throw err;
            });
    })
}
exports.SDExcelToJSON = function (filename) {
    return new Promise(function (rel, rej) {
        var workbook = new Excel.Workbook();
        workbook.xlsx.readFile(filename)
            .then(function (excelDoc) {
                var worksheet = excelDoc.getWorksheet(1);
                rowCount = worksheet.rowCount;
                if (rowCount < 1) {
                    logger.error("Do not find excel data");
                    logger.error("Error Location EXCELJSOT002")
                    throw new Error("Do not find excel data");
                    return;
                }

                let SDLists = [];

                worksheet.eachRow(function (row, rowNumber) {
                    if (rowNumber === 1) return;
                    let [, empId, name, department, jobRole, workerCategory, salaryCycle, jinengGongzi, gangweiGongzi, jichuButie, xilifei, gonglingGongzi, zhiwuJintie, gongliBuzhu,
                        kaoheJiangjin, tongxunButie, qitaJiangjin, xiaxiangBuzhu, yingyetingBuzhu, buchongyiliaobaoxian, kouchu, kaohekoukuan, yicixingjiangjin, preAnnuallyIncom] = row.values;

                    if (null === empId || empId === undefined || empId === '') {
                        logger.error("Employee ID is not provided from the excel, will skip row: " + rowNumber);
                        return;
                    };
                    if (null === salaryCycle || salaryCycle === undefined || salaryCycle === '') {
                        logger.error("salaryCycle is not provided from the excel, will skip row: " + rowNumber);
                        return;
                    };
                    let SD = {
                        empId: empId,
                        name: name ? name : '',
                        department: department ? department : '',
                        jobRole: jobRole ? jobRole : '',
                        workerCategory: workerCategory ? workerCategory : '',
                        salaryCycle: salaryCycle,
                        jinengGongzi: jinengGongzi ? jinengGongzi : '',
                        gangweiGongzi: gangweiGongzi ? gangweiGongzi : '',
                        jichuButie: jichuButie ? jichuButie : '',
                        xilifei: xilifei ? xilifei : '',
                        gonglingGongzi: gonglingGongzi ? gonglingGongzi : '',
                        zhiwuJintie: zhiwuJintie ? zhiwuJintie : '',
                        gongliBuzhu: gongliBuzhu ? gongliBuzhu : '',
                        kaoheJiangjin: kaoheJiangjin ? kaoheJiangjin : '',
                        tongxunButie: tongxunButie ? tongxunButie : '',
                        qitaJiangjin: qitaJiangjin ? qitaJiangjin : '',
                        xiaxiangBuzhu: xiaxiangBuzhu ? xiaxiangBuzhu : '',
                        yingyetingBuzhu: yingyetingBuzhu ? yingyetingBuzhu : '',
                        buchongyiliaobaoxian: buchongyiliaobaoxian ? buchongyiliaobaoxian : '',
                        kouchu: kouchu ? kouchu : '',
                        kaohekoukuan: kaohekoukuan ? kaohekoukuan : '',
                        yicixingjiangjin: yicixingjiangjin ? yicixingjiangjin : '',
                        preAnnuallyIncom: preAnnuallyIncom ? preAnnuallyIncom : '',
                    }
                    SDLists.push(SD);
                });

                rel(SDLists);
            }).catch(function (err) {
                logger.error("Error Location EXCELJSSDEXCELTOJSON003")
                throw err;
            })
    })
};



