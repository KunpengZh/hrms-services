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
var setDefaultWorkBookProperties = function (workbook) {
    workbook.creator = 'Kunpeng Zhang';
    workbook.lastModifiedBy = 'Kunpeng Zhang';
    workbook.created = new Date();
    workbook.modified = new Date();
    return workbook;
}
let createReportWorkSheet = function (workbook, name) {
    var worksheet = workbook.addWorksheet(name, {
        properties: {
            showGridLines: false,
            defaultRowHeight: 25,
            outlineLevelCol: 5
        },
        pageSetup: {
            fitToPage: true,
            fitToHeight: 5,
            fitToWidth: 7,
            orientation: 'portrait',      //'landscape'
            fitToWidth: 1,
            fitToHeight: 1,
            paperSize: 9,  //A4
            horizontalCentered: true,
            verticalCentered: true
        },
        views: [{ state: 'frozen', xSplit: 1, ySplit: 3 }],
    })

    return worksheet;
};
var workbook = new Excel.Workbook();
workbook = setDefaultWorkBookProperties(workbook);

let title = '献县光大电力实业有限责任公司员工工资台帐' + "2017" + "年";


worksheet = createReportWorkSheet(workbook, 'EmpDeskAccount');

let _dictionary = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

/**
 * Row1 is a blank row
 */
worksheet.addRow([]);
let row1 = worksheet.getRow(1);
row1.height = 5;


/**
 * Row2 is the Title row
 */
let mergeRange = 'A2:Z2';

worksheet.addRow([title]);
let row2 = worksheet.getRow(2);
worksheet.mergeCells(mergeRange);
row2.font = { size: 18, underline: 'double', bold: true };
row2.alignment = { vertical: 'center', horizontal: 'center' };

/**
 * Row3 is a blank row
 */
worksheet.addRow([]);
let row3 = worksheet.getRow(3);
row3.height = 5;


/**
 * Row4, Row5 is the header row
 */


let mergeRangeEmpId = 'A4:A5';
worksheet.mergeCells(mergeRangeEmpId);
let mergeRangeName = 'B4:B5';
worksheet.mergeCells(mergeRangeName);
let mergeRangeWorkCategory = 'C4:C5';
worksheet.mergeCells(mergeRangeWorkCategory);
let mergeRangeDepartment = 'D4:D5';
worksheet.mergeCells(mergeRangeDepartment);
let mergeRangeJobRole = 'E4:E5';
worksheet.mergeCells(mergeRangeJobRole);

let newmerge='F4:H4';
worksheet.mergeCells(newmerge);
newmerge='I4:K4';
worksheet.mergeCells(newmerge);

worksheet.addRow(["empId","name","workcategory","department","jobrole","Jan","Feb","Mar"]);
worksheet.addRow([]);
let row4 = worksheet.getRow(4);
let row5 = worksheet.getRow(5);


workbook.xlsx.writeFile("test.xlsx")
    .then(function () {
        logger.info("Successed write to file");

    }).catch(function (err) {
        console.log(err);
        throw err;
    });