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
var UnicID = require('../mysql/UnicID');
var EmpServices = require("../empInfoServices/empBasicServices");

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
                    let emp = {
                        empId: empId ? empId : '',
                        name: name ? name : '',
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

                UnicID.findOne({
                    where: {
                        configKey: 'EmpID'
                    }
                }).then((EmpUnicIDDoc) => {
                    let oriEmpUnicKey = EmpUnicIDDoc.get("unicID");
                    let EmpUnicKey = oriEmpUnicKey;
                    for (let i = 0; i < emps.length; i++) {
                        if (!emps[i].empId || emps[i].empId.trim() === "") {
                            EmpUnicKey = EmpUnicKey + 1;
                            emps[i].empId = EmpUnicKey;
                        }
                    }
                    if (EmpUnicKey !== oriEmpUnicKey) {
                        UnicID.update({
                            unicID: EmpUnicKey
                        }, {
                                where: {
                                    configKey: 'EmpID'
                                }
                            }).then((ures) => {
                                logger.info("Employee Unic ID updated back to database : " + EmpUnicKey);
                            }, (err) => {
                                logger.error("Error Location EXCELJS004")
                                throw err;
                            }).catch(function (err) {
                                logger.error("Error Location EXCELJS005")
                                throw err;
                            })
                    }
                    EmpServices.updatedBasicEmpInfo(emps).then((employees) => {
                        rel({
                            status: 200,
                            message: "上传保存到数据库成功"
                        })
                    }).catch((err) => {
                        logger.error("Error Location EXCELJS006")
                        throw err;
                    });
                }, (err) => {
                    logger.error("Error Location EXCELJS001")
                    throw err;
                }).catch(function (err) {
                    logger.error("Error Location EXCELJS002")
                    throw err;
                })
            }).catch(function (err) {
                logger.error("Error Location EXCELJS003")
                throw err;
            })
    })
};




