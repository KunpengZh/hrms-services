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

var setEmpBasicColumns = function () {
    var columns = [
        { header: '员工号', key: 'empId', width: 15, style: { bold: true } },
        { header: '姓名', key: 'name', width: 15, style: { bold: true } },
        { header: '工作类别', key: 'workerCategory', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '工作部门', key: 'department', width: 15, outlineLevel: 1, style: { bold: true } },
        { header: '工作岗位', key: 'jobRole', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '入职日期', key: 'entryTime', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '性别', key: 'gender', width: 10, outlineLevel: 1, style: { bold: true } },
        { header: '备注', key: 'comment', width: 10, outlineLevel: 1, style: { bold: true } },
    ];
    return columns;
}


var workbook = new Excel.Workbook();
var worksheet = workbook.addWorksheet('My Sheet', {
    properties: {
        tabColor: { argb: 'FFC0000' },
        showGridLines: false,
        defaultRowHeight: 25
    },
    views: [{ xSplit: 1, ySplit: 1 }],
    pageSetup: {
        fitToPage: true,
        fitToHeight: 5,
        fitToWidth: 7,
        orientation: 'portrait',      //'landscape'
        fitToWidth: 1,
        fitToHeight: 1,
        paperSize: 9,  //A4
        horizontalCentered: true,
        verticalCentered: false
    }
});

let GeneralReportFormat = function (worksheet, title, columns, data) {

    worksheet.addRow([title]);

    let tableHeader = [];
    let tableKeys = [];
    columns.forEach(function (element) {
        tableHeader.push(element.header);
        tableKeys.push(element.key);
    });
    worksheet.addRow(tableHeader);

    data.forEach(function (dataObj) {
        let datarow = [];
        tableKeys.forEach(function (key) {
            datarow.push(dataObj[key] ? dataObj[key] : '');
        })
        worksheet.addRow(datarow)
    })

    return worksheet;
}

workbook.xlsx.writeFile("test.xlsx")
    .then(function () {
        logger.info("Successed write to file");

    }).catch(function (err) {
        console.log(err);
        throw err;
    });