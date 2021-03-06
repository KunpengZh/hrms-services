/**
 * Excel Utils
 * @Author:kpzhang@cn.ibm.com
 * June 28 2017
 */
var fs = require("fs");
var log4js = require("log4js");
var logger = log4js.getLogger("HRMS-Excel-Util");
logger.level = "All";
var Excel = require("exceljs");

/**
 * Transfer Employee Basic Information Table to Excel
 */

var setDefaultWorkBookProperties = function(workbook) {
  workbook.creator = "Kunpeng Zhang";
  workbook.lastModifiedBy = "Kunpeng Zhang";
  workbook.created = new Date();
  workbook.modified = new Date();
  return workbook;
};

var setEmpBasicColumns = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 10, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "工作类别", key: "workerCategory", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工作岗位", key: "jobRole", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "入职日期", key: "entryTime", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "性别", key: "gender", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "备注", key: "comment", width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};

//{ header: '年龄', key: 'age', width: 10, outlineLevel: 1, style: { bold: true } },
//{ header: '工龄', key: 'workAge', width: 10, outlineLevel: 1, style: { bold: true } },

exports.EmpBasicInfoToExcel = function(emps, filename) {
  return new Promise(function(resolve, reject) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);

    isReportFormat = true;

    var worksheet = workbook.addWorksheet("EmpBasicInfo", { views: [{ state: "frozen", xSplit: 0, ySplit: 1 }] });
    worksheet.columns = setEmpBasicColumns();
    worksheet.addRows(emps);

    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        resolve(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJS008");
        throw err;
      });
  });
};

let createReportWorkSheet = function(workbook, name) {
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
      orientation: "portrait", //'landscape'
      fitToWidth: 1,
      fitToHeight: 1,
      paperSize: 9, //A4
      horizontalCentered: true,
      verticalCentered: false
    },
    views: [{ state: "frozen", xSplit: 2, ySplit: 4 }]
  });

  return worksheet;
};

let GeneralReportFormat = function(worksheet, title, columns, data) {
  let _dictionary = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "AA",
    "AB",
    "AC",
    "AD",
    "AE",
    "AF",
    "AG",
    "AH",
    "AI",
    "AJ",
    "AK",
    "AL",
    "AM",
    "AN",
    "AO",
    "AP",
    "AQ",
    "AR",
    "AS",
    "AT",
    "AU",
    "AV",
    "AW",
    "AX",
    "AY",
    "AZ",
    "BA",
    "BB",
    "BC",
    "BD",
    "BE",
    "BF",
    "BG",
    "BH",
    "BI",
    "BJ",
    "BK",
    "BL",
    "BM",
    "BN",
    "BO",
    "BP",
    "BQ",
    "BR",
    "BS",
    "BT",
    "BU",
    "BV",
    "BW",
    "BX",
    "BY",
    "BZ"
  ];

  /**
   * Row1 is a blank row
   */
  worksheet.addRow([]);
  let row1 = worksheet.getRow(1);
  row1.height = 5;

  /**
   * Row2 is the Title row
   */
  let mergeRange = "A2:";
  if (columns.length > 25) {
    mergeRange = "A2:Z2";
  } else {
    mergeRange += _dictionary[columns.length - 1] + "2";
  }

  worksheet.addRow([title]);
  let row2 = worksheet.getRow(2);
  worksheet.mergeCells(mergeRange);
  row2.font = { size: 18, underline: "double", bold: true };
  row2.alignment = { vertical: "center", horizontal: "center" };

  /**
   * Row3 is a blank row
   */
  worksheet.addRow([]);
  let row3 = worksheet.getRow(3);
  row3.height = 5;

  /**
   * Row4 is the table header row
   */
  let tableHeader = [];
  let tableKeys = [];
  columns.forEach(function(element) {
    tableHeader.push(element.header);
    tableKeys.push(element.key);
  });
  worksheet.addRow(tableHeader);
  let row4 = worksheet.getRow(4);
  let tableHeaderRowNum = 4;

  for (let i = 0; i < columns.length; i++) {
    worksheet.getColumn(i + 1).width = columns[i].width ? columns[i].width : 15;
    let index = _dictionary[i % 78];
    worksheet.getCell(index + tableHeaderRowNum).font = { size: 12, bold: true };
    worksheet.getCell(index + tableHeaderRowNum).alignment = { vertical: "center", horizontal: "center" };
    worksheet.getCell(index + tableHeaderRowNum).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFF00" },
      bgColor: { argb: "FF0000FF" }
    };
    worksheet.getCell(index + tableHeaderRowNum).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" }
    };
  }

  /**
   * Start from row 5, is the table data row
   */

  let rownum = 5;
  data.forEach(function(dataObj) {
    let datarow = [];
    tableKeys.forEach(function(key) {
      datarow.push(dataObj[key] ? dataObj[key] : "");
    });
    worksheet.addRow(datarow);
    for (let i = 0; i < columns.length; i++) {
      let index = _dictionary[i % 78];
      worksheet.getCell(index + rownum).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    }
    rownum++;
  });

  return worksheet;
};

/**
 * function to uplaod Basic Employee Information
 */

exports.EmpInfoToJSON = function(filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook.xlsx
      .readFile(filename)
      .then(function(excelDoc) {
        var worksheet = excelDoc.getWorksheet(1);
        rowCount = worksheet.rowCount;
        if (rowCount < 1) {
          logger.error("Do not find excel data");
          logger.error("Error Location EXCELJS007");
          throw new Error("Do not find excel data");
          return;
        }

        let emps = [];

        worksheet.eachRow(function(row, rowNumber) {
          if (rowNumber === 1) return;

          let [, empId, name, workerCategory, department, jobRole, entryTime, gender, comment] = row.values;
          // if (null === name || name === undefined || name === '') {
          //     logger.error("Employee is not provided from the excel, will skip row: " + rowNumber);
          //     return;
          // }
          if (
            (null === name || name === undefined || name === "") &&
            (null === empId || empId === undefined || empId === "")
          ) {
            logger.error(
              "New Employee(without empID) name is not provided from the excel, will skip row: " + rowNumber
            );
            return;
          }
          let emp = {
            empId: empId ? objToString(empId) : "",
            name: name,
            department: department ? objToString(department) : "",
            jobRole: jobRole ? objToString(jobRole) : "",
            entryTime: entryTime ? objToString(entryTime) : "",
            gender: gender ? objToString(gender) : "",
            workerCategory: workerCategory ? objToString(workerCategory) : "",
            comment: comment ? objToString(comment) : ""
          };
          emps.push(emp);
        });

        rel(emps);
      })
      .catch(function(err) {
        logger.error("Error Location EXCELJS003");
        throw err;
      });
  });
};

var setEmpSensitiveColumns = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 15, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "身份证", key: "idCard", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "银行帐号", key: "bankAccount", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "技能工资", key: "jinengGongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "岗位工资", key: "gangweiGongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "基础补贴", key: "jichuButie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "洗理费", key: "xilifei", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工龄工资", key: "gonglingGongzi", width: 15, style: { bold: true } },
    { header: "职务津贴", key: "zhiwuJintie", width: 15, style: { bold: true } },
    { header: "上年月平均收入", key: "preAnnuallyIncom", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年金基数", key: "nianjinJishu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "失业保险基数", key: "shiyebaoxianJishu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "养老保险基数", key: "yanglaobaoxianJishu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "住房公积金基数", key: "zhufanggongjijinJishu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "个人所得税抵扣", key: "personalIncomeTaxDeduction", width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};

// { header: '年金', key: 'nianjin', width: 15, style: { bold: true } },
// { header: '企业年金', key: 'naqiyeNianjinme', width: 15, style: { bold: true } },
// { header: '养老保险', key: 'yanglaobaoxian', width: 15, outlineLevel: 1, style: { bold: true } },
// { header: '失业保险', key: 'shiyebaoxian', width: 10, outlineLevel: 1, style: { bold: true } },
// { header: '住房公积金', key: 'zhufanggongjijin', width: 10, outlineLevel: 1, style: { bold: true } },
// { header: '医疗保险', key: 'yiliaobaoxian', width: 10, outlineLevel: 1, style: { bold: true } },

exports.EmpSensitiveInfoToExcel = function(emps, filename) {
  return new Promise(function(resolve, reject) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("EmpSensitiveInfo", { views: [{ state: "frozen", xSplit: 0, ySplit: 1 }] });
    worksheet.columns = setEmpSensitiveColumns();

    worksheet.addRows(emps);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        resolve(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJS028");
        throw err;
      });
  });
};

/**
 * function to uplaod Sensitive Employee Information
 */

var objToString = function(obj) {
  if (typeof obj === "object" && obj.richText && obj.richText[1] && obj.richText[1].text) {
    obj = obj.richText[1].text;
  }
  return obj;
};

exports.EmpSensitiveInfoToJSON = function(filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook.xlsx
      .readFile(filename)
      .then(function(excelDoc) {
        var worksheet = excelDoc.getWorksheet(1);
        rowCount = worksheet.rowCount;
        if (rowCount < 1) {
          logger.error("Do not find excel data");
          logger.error("Error Location EXCELJS027");
          throw new Error("Do not find excel data");
          return;
        }

        let emps = [];

        worksheet.eachRow(function(row, rowNumber) {
          if (rowNumber === 1) return;
          let [
            ,
            empId,
            name,
            idCard,
            bankAccount,
            jinengGongzi,
            gangweiGongzi,
            jichuButie,
            xilifei,
            gonglingGongzi,
            zhiwuJintie,
            preAnnuallyIncom,
            nianjinJishu,
            shiyebaoxianJishu,
            yanglaobaoxianJishu,
            zhufanggongjijinJishu,
            personalIncomeTaxDeduction
          ] = row.values;

          if (null === empId || empId === undefined || empId === "") {
            logger.error("Employee ID is not provided from the excel, will skip row: " + rowNumber);
            return;
          }

          let emp = {
            empId: empId ? objToString(empId) : "",
            idCard: idCard ? objToString(idCard) : "",
            bankAccount: bankAccount ? objToString(bankAccount) : "",
            jinengGongzi: jinengGongzi ? objToString(jinengGongzi) : "",
            gangweiGongzi: gangweiGongzi ? objToString(gangweiGongzi) : "",
            jichuButie: jichuButie ? objToString(jichuButie) : "",
            xilifei: xilifei ? objToString(xilifei) : "",
            gonglingGongzi: gonglingGongzi ? objToString(gonglingGongzi) : "",
            zhiwuJintie: zhiwuJintie ? objToString(zhiwuJintie) : "",
            preAnnuallyIncom: preAnnuallyIncom ? objToString(preAnnuallyIncom) : "",
            nianjinJishu: nianjinJishu ? objToString(nianjinJishu) : "",
            shiyebaoxianJishu: shiyebaoxianJishu ? objToString(shiyebaoxianJishu) : "",
            yanglaobaoxianJishu: yanglaobaoxianJishu ? objToString(yanglaobaoxianJishu) : "",
            zhufanggongjijinJishu: zhufanggongjijinJishu ? objToString(zhufanggongjijinJishu) : "",
            personalIncomeTaxDeduction: personalIncomeTaxDeduction ? objToString(personalIncomeTaxDeduction) : ""
          };
          // nianjin: nianjin ? nianjin : '',
          // qiyeNianjin: qiyeNianjin ? qiyeNianjin : '',
          // yanglaobaoxian: yanglaobaoxian ? yanglaobaoxian : '',
          // shiyebaoxian: shiyebaoxian ? shiyebaoxian : '',
          // zhufanggongjijin: zhufanggongjijin ? zhufanggongjijin : '',
          // yiliaobaoxian: yiliaobaoxian ? yiliaobaoxian : '',
          emps.push(emp);
        });

        rel(emps);
      })
      .catch(function(err) {
        logger.error("Error Location EXCELJS026");
        throw err;
      });
  });
};

var setOTDataColumns = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 15, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工作岗位", key: "jobRole", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作类别", key: "workerCategory", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工资周期", key: "OTCycle", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "公里补助", key: "gongliBuzhu", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "考核奖金", key: "kaoheJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "固定奖金", key: "gudingJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "通讯补贴", key: "tongxunButie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "其他奖励", key: "qitaJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "下乡补助", key: "xiaxiangBuzhu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "营业厅补助", key: "yingyetingBuzhu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "补充医疗保险", key: "buchongyiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "夜间值班", key: "NormalOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "周末值班", key: "WeekendOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "节假日值班(天数)", key: "HolidayOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣工资", key: "kouchu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "其他罚款", key: "kaohekoukuan", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年终奖金", key: "yicixingjiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "医疗保险扣款", key: "yiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业部分医疗保险", key: "qiyeYiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业生育保险", key: "shengyubaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业工伤保险", key: "gongshangbaoxian", width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};
exports.OTDataToExcel = function(OTDataLists, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("OTData", { views: [{ state: "frozen", xSplit: 2, ySplit: 1 }] });
    worksheet.columns = setOTDataColumns();

    worksheet.addRows(OTDataLists);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSOT001");
        throw err;
      });
  });
};

exports.OTExcelToJSON = function(filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook.xlsx
      .readFile(filename)
      .then(function(excelDoc) {
        var worksheet = excelDoc.getWorksheet(1);
        rowCount = worksheet.rowCount;
        if (rowCount < 1) {
          logger.error("Do not find excel data");
          logger.error("Error Location EXCELJSOT002");
          throw new Error("Do not find excel data");
          return;
        }

        let OTLists = [];

        worksheet.eachRow(function(row, rowNumber) {
          if (rowNumber === 1) return;
          let [
            ,
            empId,
            name,
            department,
            jobRole,
            workerCategory,
            OTCycle,
            gongliBuzhu,
            kaoheJiangjin,
            gudingJiangjin,
            tongxunButie,
            qitaJiangjin,
            xiaxiangBuzhu,
            yingyetingBuzhu,
            buchongyiliaobaoxian,
            NormalOT,
            WeekendOT,
            HolidayOT,
            kouchu,
            kaohekoukuan,
            yicixingjiangjin,
            yiliaobaoxian,
            qiyeYiliaobaoxian,
            shengyubaoxian,
            gongshangbaoxian
          ] = row.values;

          if (null === empId || empId === undefined || empId === "") {
            logger.error("Employee ID is not provided from the excel, will skip row: " + rowNumber);
            return;
          }
          if (null === OTCycle || OTCycle === undefined || OTCycle === "") {
            logger.error("OTCycle is not provided from the excel, will skip row: " + rowNumber);
            return;
          }
          let OT = {
            empId: empId ? empId : "",
            OTCycle: OTCycle ? OTCycle : "",
            gongliBuzhu: gongliBuzhu ? gongliBuzhu : "",
            kaoheJiangjin: kaoheJiangjin ? kaoheJiangjin : "",
            gudingJiangjin: gudingJiangjin ? gudingJiangjin : "",
            tongxunButie: tongxunButie ? tongxunButie : "",
            qitaJiangjin: qitaJiangjin ? qitaJiangjin : "",
            xiaxiangBuzhu: xiaxiangBuzhu ? xiaxiangBuzhu : "",
            yingyetingBuzhu: yingyetingBuzhu ? yingyetingBuzhu : "",
            buchongyiliaobaoxian: buchongyiliaobaoxian ? buchongyiliaobaoxian : "",
            NormalOT: NormalOT ? NormalOT : "0",
            WeekendOT: WeekendOT ? WeekendOT : "0",
            HolidayOT: HolidayOT ? HolidayOT : "0",
            kouchu: kouchu ? kouchu : "0",
            kaohekoukuan: kaohekoukuan ? kaohekoukuan : "0",
            yicixingjiangjin: yicixingjiangjin ? yicixingjiangjin : "0",
            yiliaobaoxian: yiliaobaoxian ? yiliaobaoxian : "0",
            qiyeYiliaobaoxian: qiyeYiliaobaoxian ? qiyeYiliaobaoxian : "0",
            shengyubaoxian: shengyubaoxian ? shengyubaoxian : "0",
            gongshangbaoxian: gongshangbaoxian ? gongshangbaoxian : "0"
          };
          OTLists.push(OT);
        });

        rel(OTLists);
      })
      .catch(function(err) {
        logger.error("Error Location EXCELJSOT003");
        throw err;
      });
  });
};

/**
 * Non Regular Salary related functions
 */

var setNRDataColumns = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 15, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工作岗位", key: "jobRole", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作类别", key: "workerCategory", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工资周期", key: "salaryCycle", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "日工资", key: "daySalary", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作天数", key: "workDays", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "安全奖励", key: "anquanJiangli", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "无违章奖励", key: "wuweizhangJiangli", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "加班奖金", key: "OTJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "医疗保险", key: "yiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业部分医疗保险", key: "qiyeYiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业生育保险", key: "shengyubaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业工伤保险", key: "gongshangbaoxian", width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};
exports.NRDataToExcel = function(NRDataLists, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("NRData", { views: [{ state: "frozen", xSplit: 2, ySplit: 1 }] });
    worksheet.columns = setNRDataColumns();

    worksheet.addRows(NRDataLists);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSNR001");
        throw err;
      });
  });
};

exports.NRExcelToJSON = function(filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook.xlsx
      .readFile(filename)
      .then(function(excelDoc) {
        var worksheet = excelDoc.getWorksheet(1);
        rowCount = worksheet.rowCount;
        if (rowCount < 1) {
          logger.error("Do not find excel data");
          logger.error("Error Location EXCELJSNR002");
          throw new Error("Do not find excel data");
          return;
        }

        let NRLists = [];

        worksheet.eachRow(function(row, rowNumber) {
          if (rowNumber === 1) return;
          let [
            ,
            empId,
            name,
            department,
            jobRole,
            workerCategory,
            salaryCycle,
            daySalary,
            workDays,
            anquanJiangli,
            wuweizhangJiangli,
            OTJiangjin,
            yiliaobaoxian,
            qiyeYiliaobaoxian,
            shengyubaoxian,
            gongshangbaoxian
          ] = row.values;

          if (null === empId || empId === undefined || empId === "") {
            logger.error("Employee ID is not provided from the excel, will skip row: " + rowNumber);
            return;
          }
          if (null === salaryCycle || salaryCycle === undefined || salaryCycle === "") {
            logger.error("salaryCycle is not provided from the excel, will skip row: " + rowNumber);
            return;
          }
          let NREmp = {
            empId: empId ? empId : "",
            salaryCycle: salaryCycle ? salaryCycle : "",
            daySalary: daySalary ? daySalary : "0",
            workDays: workDays ? workDays : "0",
            anquanJiangli: anquanJiangli ? anquanJiangli : "0",
            wuweizhangJiangli: wuweizhangJiangli ? wuweizhangJiangli : "0",
            OTJiangjin: OTJiangjin ? OTJiangjin : "0",
            yiliaobaoxian: yiliaobaoxian ? yiliaobaoxian : "0",
            qiyeYiliaobaoxian: qiyeYiliaobaoxian ? qiyeYiliaobaoxian : "0",
            shengyubaoxian: shengyubaoxian ? shengyubaoxian : "0",
            gongshangbaoxian: gongshangbaoxian ? gongshangbaoxian : "0"
          };
          NRLists.push(NREmp);
        });

        rel(NRLists);
      })
      .catch(function(err) {
        logger.error("Error Location EXCELJSNR003");
        throw err;
      });
  });
};

/**
 * Funcitons for Salary Details uplaod and download
 *
 */

// var setSDColumns = function () {
//     var columns = [
//         { header: '员工号', key: 'empId', width: 15, style: { bold: true } },
//         { header: '姓名', key: 'name', width: 15, style: { bold: true } },
//         { header: '工作部门', key: 'department', width: 15, outlineLevel: 1, style: { bold: true } },
//         { header: '工作岗位', key: 'jobRole', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '工作类别', key: 'workerCategory', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '工资周期', key: 'salaryCycle', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '技能工资', key: 'jinengGongzi', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '岗位工资', key: 'gangweiGongzi', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '基础补贴', key: 'jichuButie', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '洗理费', key: 'xilifei', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '工龄工资', key: 'gonglingGongzi', width: 15, style: { bold: true } },
//         { header: '职务津贴', key: 'zhiwuJintie', width: 15, style: { bold: true } },
//         { header: '公里补助', key: 'gongliBuzhu', width: 15, outlineLevel: 1, style: { bold: true } },
//         { header: '考核奖金', key: 'kaoheJiangjin', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '通讯补贴', key: 'tongxunButie', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '其他奖励', key: 'qitaJiangjin', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '下乡补助', key: 'xiaxiangBuzhu', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '营业厅补助', key: 'yingyetingBuzhu', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '补充医疗保险', key: 'buchongyiliaobaoxian', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '夜间值班', key: 'NormalOT', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '周末值班', key: 'WeekendOT', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '节假日值班(天数)', key: 'HolidayOT', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '医疗保险', key: 'yiliaobaoxian', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '工资扣除', key: 'kouchu', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '考核扣款', key: 'kaohekoukuan', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '年终奖金', key: 'yicixingjiangjin', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '上年收入', key: 'preAnnuallyIncom', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '日工资', key: 'daySalary', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '工作天数', key: 'workDays', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '安全奖励', key: 'anquanJiangli', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '无违章奖励', key: 'wuweizhangJiangli', width: 10, outlineLevel: 1, style: { bold: true } },
//         { header: '加班奖金', key: 'OTJiangjin', width: 10, outlineLevel: 1, style: { bold: true } }
//     ];
//     return columns;
// }
// exports.SDDataToExcel = function (SDDataLists, filename) {
//     return new Promise(function (rel, rej) {
//         var workbook = new Excel.Workbook();
//         workbook = setDefaultWorkBookProperties(workbook);
//         var worksheet = workbook.addWorksheet('SalaryData', { views: [{ state: 'frozen', xSplit: 2, ySplit: 1 }] });
//         worksheet.columns = setSDColumns();

//         worksheet.addRows(SDDataLists);
//         workbook.xlsx.writeFile(filename)
//             .then(function () {
//                 logger.info("Successed write to file");
//                 rel(filename);
//             }).catch(function (err) {
//                 logger.error(err);
//                 logger.error("Error Location EXCELJSSDDATATOEXCEL001")
//                 throw err;
//             });
//     })
// }
exports.SDExcelToJSON = function(filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook.xlsx
      .readFile(filename)
      .then(function(excelDoc) {
        var worksheet = excelDoc.getWorksheet(1);
        rowCount = worksheet.rowCount;
        if (rowCount < 1) {
          logger.error("Do not find excel data");
          logger.error("Error Location EXCELJSOT002");
          throw new Error("Do not find excel data");
          return;
        }

        let SDLists = [];

        worksheet.eachRow(function(row, rowNumber) {
          if (rowNumber === 1) return;
          let [
            ,
            empId,
            name,
            department,
            jobRole,
            workerCategory,
            salaryCycle,
            jinengGongzi,
            gangweiGongzi,
            jichuButie,
            xilifei,
            gonglingGongzi,
            daySalary,
            workDays,
            jibengongzi,
            jibengongziComments,
            zhiwuJintie,
            gongliBuzhu,
            kaoheJiangjin,
            gudingJiangjin,
            tongxunButie,
            qitaJiangjin,
            xiaxiangBuzhu,
            yingyetingBuzhu,
            NormalOT,
            WeekendOT,
            HolidayOT,
            HolidayOTComments,
            anquanJiangli,
            wuweizhangJiangli,
            OTJiangjin,
            kouchu,
            kaohekoukuan,
            yingfagongzi,
            yingfagongziComments,
            preAnnuallyIncom,
            nianjin,
            nianjinComments,
            yanglaobaoxian,
            yanglaobaoxianComments,
            shiyebaoxian,
            shiyebaoxianComments,
            zhufanggongjijin,
            zhufanggongjijinComments,
            yiliaobaoxian,
            qiyeNianjin,
            qiyeNianJinComments,
            qiyeYanglaobaoxian,
            qiyeYanglaobaoxianComments,
            qiyeShiyebaoxian,
            qiyeShiyebaoxianComments,
            qiyeZhufanggongjijin,
            qiyeZhufanggongjijinComments,
            qiyeYiliaobaoxian,
            yingshuigongzi,
            yingshuigongziComments,
            tax,
            taxComments,
            yicixingjiangjin,
            yicixingjiangjinTax,
            yicixingjiangjinTaxComments,
            buchongyiliaobaoxian,
            netIncome,
            netIncomeComments
          ] = row.values;

          if (null === empId || empId === undefined || empId === "") {
            logger.error("Employee ID is not provided from the excel, will skip row: " + rowNumber);
            return;
          }
          if (null === salaryCycle || salaryCycle === undefined || salaryCycle === "") {
            logger.error("salaryCycle is not provided from the excel, will skip row: " + rowNumber);
            return;
          }
          let SD = {
            empId: empId,
            name: name ? name : "",
            department: department ? department : "",
            jobRole: jobRole ? jobRole : "",
            workerCategory: workerCategory ? workerCategory : "",
            salaryCycle: salaryCycle ? salaryCycle : "",
            jinengGongzi: jinengGongzi ? jinengGongzi : "0",
            gangweiGongzi: gangweiGongzi ? gangweiGongzi : "0",
            jichuButie: jichuButie ? jichuButie : "0",
            xilifei: xilifei ? xilifei : "0",
            gonglingGongzi: gonglingGongzi ? gonglingGongzi : "0",
            daySalary: daySalary ? daySalary : "0",
            workDays: workDays ? workDays : "0",
            jibengongzi: jibengongzi ? jibengongzi : "0",
            jibengongziComments: jibengongziComments ? jibengongziComments : "0",
            zhiwuJintie: zhiwuJintie ? zhiwuJintie : "0",
            gongliBuzhu: gongliBuzhu ? gongliBuzhu : "0",
            kaoheJiangjin: kaoheJiangjin ? kaoheJiangjin : "0",
            gudingJiangjin: gudingJiangjin ? gudingJiangjin : "0",
            tongxunButie: tongxunButie ? tongxunButie : "0",
            qitaJiangjin: qitaJiangjin ? qitaJiangjin : "0",
            xiaxiangBuzhu: xiaxiangBuzhu ? xiaxiangBuzhu : "0",
            yingyetingBuzhu: yingyetingBuzhu ? yingyetingBuzhu : "0",
            NormalOT: NormalOT ? NormalOT : "0",
            WeekendOT: WeekendOT ? WeekendOT : "0",
            HolidayOT: HolidayOT ? HolidayOT : "0",
            HolidayOTComments: HolidayOTComments ? HolidayOTComments : "0",
            anquanJiangli: anquanJiangli ? anquanJiangli : "0",
            wuweizhangJiangli: wuweizhangJiangli ? wuweizhangJiangli : "0",
            OTJiangjin: OTJiangjin ? OTJiangjin : "0",
            kouchu: kouchu ? kouchu : "0",
            kaohekoukuan: kaohekoukuan ? kaohekoukuan : "0",
            yingfagongzi: yingfagongzi ? yingfagongzi : "0",
            yingfagongziComments: yingfagongziComments ? yingfagongziComments : "0",
            preAnnuallyIncom: preAnnuallyIncom ? preAnnuallyIncom : "0",
            nianjin: nianjin ? nianjin : "0",
            nianjinComments: nianjinComments ? nianjinComments : "0",
            yanglaobaoxian: yanglaobaoxian ? yanglaobaoxian : "0",
            yanglaobaoxianComments: yanglaobaoxianComments ? yanglaobaoxianComments : "0",
            shiyebaoxian: shiyebaoxian ? shiyebaoxian : "0",
            shiyebaoxianComments: shiyebaoxianComments ? shiyebaoxianComments : "0",
            zhufanggongjijin: zhufanggongjijin ? zhufanggongjijin : "0",
            zhufanggongjijinComments: zhufanggongjijinComments ? zhufanggongjijinComments : "0",
            yiliaobaoxian: yiliaobaoxian ? yiliaobaoxian : "0",
            qiyeNianjin: qiyeNianjin ? qiyeNianjin : "0",
            qiyeNianJinComments: qiyeNianJinComments ? qiyeNianJinComments : "0",
            qiyeYanglaobaoxian: qiyeYanglaobaoxian ? qiyeYanglaobaoxian : "0",
            qiyeYanglaobaoxianComments: qiyeYanglaobaoxianComments ? qiyeYanglaobaoxianComments : "0",
            qiyeShiyebaoxian: qiyeShiyebaoxian ? qiyeShiyebaoxian : "0",
            qiyeShiyebaoxianComments: qiyeShiyebaoxianComments ? qiyeShiyebaoxianComments : "0",
            qiyeZhufanggongjijin: qiyeZhufanggongjijin ? qiyeZhufanggongjijin : "0",
            qiyeZhufanggongjijinComments: qiyeZhufanggongjijinComments ? qiyeZhufanggongjijinComments : "0",
            qiyeYiliaobaoxian: qiyeYiliaobaoxian ? qiyeYiliaobaoxian : "0",
            yingshuigongzi: yingshuigongzi ? yingshuigongzi : "0",
            yingshuigongziComments: yingshuigongziComments ? yingshuigongziComments : "0",
            tax: tax ? tax : "0",
            taxComments: taxComments ? taxComments : "0",
            yicixingjiangjin: yicixingjiangjin ? yicixingjiangjin : "0",
            yicixingjiangjinTax: yicixingjiangjinTax ? yicixingjiangjinTax : "0",
            yicixingjiangjinTaxComments: yicixingjiangjinTaxComments ? yicixingjiangjinTaxComments : "0",
            buchongyiliaobaoxian: buchongyiliaobaoxian ? buchongyiliaobaoxian : "0",
            netIncome: netIncome ? netIncome : "0",
            netIncomeComments: netIncomeComments ? netIncomeComments : "0"
          };
          SDLists.push(SD);
        });

        rel(SDLists);
      })
      .catch(function(err) {
        logger.error("Error Location EXCELJSSDEXCELTOJSON003");
        throw err;
      });
  });
};

var setSDTableColumns = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 15, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工作岗位", key: "jobRole", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作类别", key: "workerCategory", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工资周期", key: "salaryCycle", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "技能工资", key: "jinengGongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "岗位工资", key: "gangweiGongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "基础补贴", key: "jichuButie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "洗理费", key: "xilifei", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工龄工资", key: "gonglingGongzi", width: 15, style: { bold: true } },
    { header: "日工资", key: "daySalary", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作天数", key: "workDays", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "基本工资", key: "jibengongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "基本工资计算方法", key: "jibengongziComments", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "职务津贴", key: "zhiwuJintie", width: 15, style: { bold: true } },
    { header: "公里补助", key: "gongliBuzhu", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "考核奖金", key: "kaoheJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "固定奖金", key: "gudingJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "通讯补贴", key: "tongxunButie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "其他奖励", key: "qitaJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "下乡补助", key: "xiaxiangBuzhu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "营业厅补助", key: "yingyetingBuzhu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "夜间值班", key: "NormalOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "周末值班", key: "WeekendOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "节假日值班", key: "HolidayOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "节假日值班计算方法", key: "HolidayOTComments", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "安全奖励(非全日制)", key: "anquanJiangli", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "无违章奖励(非全日制)", key: "wuweizhangJiangli", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "加班奖金(非全日制)", key: "OTJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣工资", key: "kouchu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "其他罚款", key: "kaohekoukuan", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "应发工资", key: "yingfagongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "应发工资计算方法", key: "yingfagongziComments", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "上年收入", key: "preAnnuallyIncom", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年金", key: "nianjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年金计算方法", key: "nianjinComments", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "养老保险", key: "yanglaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "养老保险计算方法", key: "yanglaobaoxianComments", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "失业保险", key: "shiyebaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "失业保险计算方法", key: "shiyebaoxianComments", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "住房公积金", key: "zhufanggongjijin", width: 10, outlineLevel: 1, style: { bold: true } },
    {
      header: "住房公积金计算方法",
      key: "zhufanggongjijinComments",
      width: 10,
      outlineLevel: 1,
      style: { bold: true }
    },
    { header: "医疗保险", key: "yiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业年金", key: "qiyeNianjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业年金计算方法", key: "qiyeNianJinComments", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业养老保险", key: "qiyeYanglaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    {
      header: "企业养老保险计算方法",
      key: "qiyeYanglaobaoxianComments",
      width: 10,
      outlineLevel: 1,
      style: { bold: true }
    },
    { header: "企业失业保险", key: "qiyeShiyebaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    {
      header: "企业失业保险计算方法",
      key: "qiyeShiyebaoxianComments",
      width: 10,
      outlineLevel: 1,
      style: { bold: true }
    },
    { header: "企业住房公积金", key: "qiyeZhufanggongjijin", width: 10, outlineLevel: 1, style: { bold: true } },
    {
      header: "企业住房公积金计算方法",
      key: "qiyeZhufanggongjijinComments",
      width: 10,
      outlineLevel: 1,
      style: { bold: true }
    },
    { header: "企业医疗保险", key: "qiyeYiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "应税工资", key: "yingshuigongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "应税工资计算方法", key: "yingshuigongziComments", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "个人所得税", key: "tax", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "个人所得税计算方法", key: "taxComments", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年终奖金", key: "yicixingjiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年终奖金税", key: "yicixingjiangjinTax", width: 10, outlineLevel: 1, style: { bold: true } },
    {
      header: "年终奖金税计算方法",
      key: "yicixingjiangjinTaxComments",
      width: 10,
      outlineLevel: 1,
      style: { bold: true }
    },
    { header: "补充医疗保险", key: "buchongyiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "实发工资", key: "netIncome", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "实发工资计算方法", key: "netIncomeComments", width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};
// { header: '企业医疗保险计算方法', key: 'yiliaobaoxianComments', width: 10, outlineLevel: 1, style: { bold: true } },
//{ header: '医疗保险计算方法', key: 'yiliaobaoxianComments', width: 10, outlineLevel: 1, style: { bold: true } },
//{ header: '周末值班计算方法', key: 'WeekendOTComments', width: 15, outlineLevel: 1, style: { bold: true } },
//{ header: '夜间值班计算方法', key: 'NormalOTComments', width: 15, outlineLevel: 1, style: { bold: true } },
exports.SDTableDataToExcel = function(SDDataLists, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("SalaryDetailData", { views: [{ state: "frozen", xSplit: 2, ySplit: 1 }] });
    worksheet.columns = setSDTableColumns();

    worksheet.addRows(SDDataLists);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSSDDATATOEXCEL001");
        throw err;
      });
  });
};

/**
 * Funcitons for Salary report
 */

// { header: '身份证', key: 'idCard', width: 15, style: { bold: true } },
// { header: '银行帐号', key: 'bankAccount', width: 15, style: { bold: true } },
// { header: '性别', key: 'gender', width: 15, style: { bold: true } },
//{ header: '扣补充医疗保险', key: 'buchongyiliaobaoxian', width: 10, outlineLevel: 1, style: { bold: true } },
//{ header: '工资周期', key: 'salaryCycle', width: 10, outlineLevel: 1, style: { bold: true } },
var setGZDColumns = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 15, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工作岗位", key: "jobRole", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作类别", key: "workerCategory", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工资", key: "jibengongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "奖金", key: "totalJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "值班费", key: "totalOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "通讯补贴", key: "tongxunButie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣年金", key: "nianjin", width: 15, style: { bold: true } },
    { header: "扣养老保险", key: "yanglaobaoxian", width: 15, style: { bold: true } },
    { header: "扣失业保险", key: "shiyebaoxian", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "扣住房公积金", key: "zhufanggongjijin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣医疗保险", key: "yiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣工资", key: "totalKouchu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣个人所得税", key: "tax", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年终奖", key: "yicixingjiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣年终奖金税", key: "yicixingjiangjinTax", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "实发工资", key: "netIncome", width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};

//{ header: '扣补充医疗保险', key: 'buchongyiliaobaoxian', width: 15, outlineLevel: 1, style: { bold: true } },
var setGZDReportColumns = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 10, style: { bold: true } },
    { header: "姓名", key: "name", width: 10, style: { bold: true } },
    { header: "工资", key: "jibengongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "奖金", key: "totalJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "值班费", key: "totalOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "通讯补贴", key: "tongxunButie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣工资", key: "totalKouchu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "应发工资", key: "yingfagongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣年金", key: "nianjin", width: 10, style: { bold: true } },
    { header: "扣养老保险", key: "yanglaobaoxian", width: 15, style: { bold: true } },
    { header: "扣失业保险", key: "shiyebaoxian", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "扣住房公积金", key: "zhufanggongjijin", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "扣医疗保险", key: "yiliaobaoxian", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "扣个人所得税", key: "tax", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "年终奖", key: "yicixingjiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣年终奖金税", key: "yicixingjiangjinTax", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "实发工资", key: "netIncome", width: 15, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};
exports.GZDDataToExcel = function(GZData, filename, isReportFormat, criteria) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);

    if (isReportFormat) {
      let title = "献县光大电力实业有限责任公司";
      let salaryCycle = criteria.salaryCycle;
      title += salaryCycle.slice(0, 4) + "年" + salaryCycle.slice(4) + "月工资发放表(" + (GZData.length - 1) + ")人";
      worksheet = createReportWorkSheet(workbook, "SalaryReport");
      worksheet = GeneralReportFormat(worksheet, title, setGZDReportColumns(), GZData);
    } else {
      var worksheet = workbook.addWorksheet("SalaryData", { views: [{ state: "frozen", xSplit: 2, ySplit: 1 }] });
      worksheet.columns = setGZDColumns();
      worksheet.addRows(GZData);
    }

    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSGZDDataToExcelL001");
        throw err;
      });
  });
};
//{ header: '扣补充医疗保险', key: 'buchongyiliaobaoxian', width: 10, outlineLevel: 1, style: { bold: true } },
var setGZDColumnsByWokerCategory = function() {
  var columns = [
    { header: "工作类别", key: "workerCategory", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工资", key: "jibengongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "奖金", key: "totalJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "值班费", key: "totalOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "通讯补贴", key: "tongxunButie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣年金", key: "nianjin", width: 15, style: { bold: true } },
    { header: "扣养老保险", key: "yanglaobaoxian", width: 15, style: { bold: true } },
    { header: "扣失业保险", key: "shiyebaoxian", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "扣住房公积金", key: "zhufanggongjijin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣医疗保险", key: "yiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣工资", key: "totalKouchu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣个人所得税", key: "tax", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年终奖", key: "yicixingjiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣年终奖金税", key: "yicixingjiangjinTax", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "实发工资", key: "netIncome", width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};

exports.GZDDataToExcelByWorkerCategory = function(GZData, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("ByWorkerCategory", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
    worksheet.columns = setGZDColumnsByWokerCategory();

    worksheet.addRows(GZData);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSGZDDataToExcelByWorkerCategory001");
        throw err;
      });
  });
};

//{ header: '扣补充医疗保险', key: 'buchongyiliaobaoxian', width: 10, outlineLevel: 1, style: { bold: true } },
var setGZDColumnsByDepartment = function() {
  var columns = [
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工资", key: "jibengongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "奖金", key: "totalJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "值班费", key: "totalOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "通讯补贴", key: "tongxunButie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣年金", key: "nianjin", width: 15, style: { bold: true } },
    { header: "扣养老保险", key: "yanglaobaoxian", width: 15, style: { bold: true } },
    { header: "扣失业保险", key: "shiyebaoxian", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "扣住房公积金", key: "zhufanggongjijin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣医疗保险", key: "yiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣工资", key: "totalKouchu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣个人所得税", key: "tax", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年终奖", key: "yicixingjiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣年终奖金税", key: "yicixingjiangjinTax", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "实发工资", key: "netIncome", width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};

exports.GZDDataToExcelByDepartment = function(GZData, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("ByDepartment", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
    worksheet.columns = setGZDColumnsByDepartment();

    worksheet.addRows(GZData);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSGZDDataToExcelByDepartment001");
        throw err;
      });
  });
};

var setDanweiJitiColumns = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 15, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "工资周期", key: "salaryCycle", width: 15, style: { bold: true } },
    { header: "个人缴纳", key: "personal", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "公司缴纳", key: "company", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "合计", key: "total", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "备注", key: "comments", width: 15, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};

var getYearMonthPeriod = function() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;

  return year.toString() + (month < 10 ? "0" + month : month).toString();
};
exports.DanweiJitiToExcel = function(danweiJitiData, filename, category, criteria) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);

    /**
     * 暂时先用startSalaryCycle
     * 现在无法确认报表标题的逻辑
     */
    let salaryCycle = "";
    if (criteria.startSalaryCycle) {
      salaryCycle = criteria.startSalaryCycle;
    } else {
      salaryCycle = getYearMonthPeriod();
    }

    let year = salaryCycle.slice(0, 4);
    let month = salaryCycle.slice(4);
    let title = "献县光大电力实业有限责任公司" + year + "年";
    switch (category) {
      case "yanglaobaoxian":
        title += month + "月养老保险明细表(" + (danweiJitiData.length - 1) + ")人";
        break;
      case "shiyebaoxian":
        title += month + "月失业保险明细表(" + (danweiJitiData.length - 1) + ")人";
        break;
      case "yiliaobaoxian":
        title += "医疗保险明细表(" + (danweiJitiData.length - 1) + ")人";
        break;
      case "zhufanggongjijin":
        title += month + "月住房公积金明细(" + (danweiJitiData.length - 1) + ")人";
        break;
      case "nianjin":
        title += month + "月年金明细表(" + (danweiJitiData.length - 1) + ")人";
        break;
      case "shengyubaoxian":
        title += month + "月企业生育保险明细表(" + (danweiJitiData.length - 1) + ")人";
        break;
      case "gongshangbaoxian":
        title += month + "月企业工伤保险明细表(" + (danweiJitiData.length - 1) + ")人";
        break;
      case "buchongyiliaobaoxian":
        title += month + "月补充医疗 保险明细表(" + (danweiJitiData.length - 1) + ")人";
        break;
      default:
        title += month + "月明细表(" + (danweiJitiData.length - 1) + ")人";
        break;
    }

    worksheet = createReportWorkSheet(workbook, "danweiJiti");
    worksheet = GeneralReportFormat(worksheet, title, setDanweiJitiColumns(), danweiJitiData);

    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSDanweiJiti001");
        throw err;
      });
  });
};
var setDeskAccountColumns = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 15, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工作岗位", key: "jobRole", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作类别", key: "workerCategory", width: 10, outlineLevel: 1, style: { bold: true } },
    { key: "JANXiaoji", header: "一月小计", width: 15, style: { bold: true } },
    { key: "JANGongzi", header: "一月工资", width: 15, style: { bold: true } },
    { key: "JANJiangjin", header: "一月奖金", width: 15, style: { bold: true } },
    { key: "JANWuxiangfuli", header: "一月福利", width: 15, style: { bold: true } },
    { key: "FEBXiaoji", header: "二月小计", width: 15, style: { bold: true } },
    { key: "FEBGongzi", header: "二月工资", width: 15, style: { bold: true } },
    { key: "FEBJiangjin", header: "二月奖金", width: 15, style: { bold: true } },
    { key: "FEBWuxiangfuli", header: "二月福利", width: 15, style: { bold: true } },
    { key: "MARXiaoji", header: "三月小计", width: 15, style: { bold: true } },
    { key: "MARGongzi", header: "三月工资", width: 15, style: { bold: true } },
    { key: "MARJiangjin", header: "三月奖金", width: 15, style: { bold: true } },
    { key: "MARWuxiangfuli", header: "三月福利", width: 15, style: { bold: true } },
    { key: "APRXiaoji", header: "四月小计", width: 15, style: { bold: true } },
    { key: "APRGongzi", header: "四月工资", width: 15, style: { bold: true } },
    { key: "APRJiangjin", header: "四月奖金", width: 15, style: { bold: true } },
    { key: "APRWuxiangfuli", header: "四月福利", width: 15, style: { bold: true } },
    { key: "MAYXiaoji", header: "五月小计", width: 15, style: { bold: true } },
    { key: "MAYGongzi", header: "五月工资", width: 15, style: { bold: true } },
    { key: "MAYJiangjin", header: "五月奖金", width: 15, style: { bold: true } },
    { key: "MAYWuxiangfuli", header: "五月福利", width: 15, style: { bold: true } },
    { key: "JUNXiaoji", header: "六月小计", width: 15, style: { bold: true } },
    { key: "JUNGongzi", header: "六月工资", width: 15, style: { bold: true } },
    { key: "JUNJiangjin", header: "六月奖金", width: 15, style: { bold: true } },
    { key: "JUNWuxiangfuli", header: "六月福利", width: 15, style: { bold: true } },
    { key: "JULXiaoji", header: "七月小计", width: 15, style: { bold: true } },
    { key: "JULGongzi", header: "七月工资", width: 15, style: { bold: true } },
    { key: "JULJiangjin", header: "七月奖金", width: 15, style: { bold: true } },
    { key: "JULWuxiangfuli", header: "七月福利", width: 15, style: { bold: true } },
    { key: "AUGXiaoji", header: "八月小计", width: 15, style: { bold: true } },
    { key: "AUGGongzi", header: "八月工资", width: 15, style: { bold: true } },
    { key: "AUGJiangjin", header: "八月奖金", width: 15, style: { bold: true } },
    { key: "AUGWuxiangfuli", header: "八月福利", width: 15, style: { bold: true } },
    { key: "SEPXiaoji", header: "九月小计", width: 15, style: { bold: true } },
    { key: "SEPGongzi", header: "九月工资", width: 15, style: { bold: true } },
    { key: "SEPJiangjin", header: "九月奖金", width: 15, style: { bold: true } },
    { key: "SEPWuxiangfuli", header: "九月福利", width: 15, style: { bold: true } },
    { key: "OCTXiaoji", header: "一十月小计", width: 15, style: { bold: true } },
    { key: "OCTGongzi", header: "一十月工资", width: 15, style: { bold: true } },
    { key: "OCTJiangjin", header: "一十月奖金", width: 15, style: { bold: true } },
    { key: "OCTWuxiangfuli", header: "一十月福利", width: 15, style: { bold: true } },
    { key: "NOVXiaoji", header: "十一月小计", width: 15, style: { bold: true } },
    { key: "NOVGongzi", header: "十一月工资", width: 15, style: { bold: true } },
    { key: "NOVJiangjin", header: "十一月奖金", width: 15, style: { bold: true } },
    { key: "NOVWuxiangfuli", header: "十一月福利", width: 15, style: { bold: true } },
    { key: "DECXiaoji", header: "十二月小计", width: 15, style: { bold: true } },
    { key: "DECGongzi", header: "十二月工资", width: 15, style: { bold: true } },
    { key: "DECJiangjin", header: "十二月奖金", width: 15, style: { bold: true } },
    { key: "DECWuxiangfuli", header: "十二月福利", width: 15, style: { bold: true } },
    { key: "JANTODECXiaoji", header: "1-12月小计", width: 15, style: { bold: true } },
    { key: "JANTODECGongzi", header: "1-12月工资", width: 15, style: { bold: true } },
    { key: "JANTODECJiangjin", header: "1-12月奖金", width: 15, style: { bold: true } },
    { key: "JANTODECWuxiangfuli", header: "1-12月福利", width: 15, style: { bold: true } }
  ];
  return columns;
};
exports.EmpDeskAccountToExcel = function(accountData, filename, calendarYear) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);

    let title = "献县光大电力实业有限责任公司员工工资台帐" + calendarYear + "年";
    worksheet = createReportWorkSheet(workbook, "EmpDeskAccount");
    worksheet = GeneralReportFormat(worksheet, title, setDeskAccountColumns(), accountData);

    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSDanweiJiti001");
        throw err;
      });
  });
};

/**
 * Funcitons for payroll full query
 * { header: '工资周期', key: 'salaryCycle', width: 10, outlineLevel: 1, style: { bold: true } },
 */

var setPayrollFullQueryColumns = function(columnsList) {
  var headerColumns = [
    { header: "员工号", key: "empId", width: 15, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工作岗位", key: "jobRole", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作类别", key: "workerCategory", width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  var columns = [
    { header: "技能工资", key: "jinengGongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "岗位工资", key: "gangweiGongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "基础补贴", key: "jichuButie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "洗理费", key: "xilifei", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工龄工资", key: "gonglingGongzi", width: 15, style: { bold: true } },
    { header: "日工资", key: "daySalary", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作天数", key: "workDays", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "基本工资", key: "jibengongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "职务津贴", key: "zhiwuJintie", width: 15, style: { bold: true } },
    { header: "公里补助", key: "gongliBuzhu", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "考核奖金", key: "kaoheJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "固定奖金", key: "gudingJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "通讯补贴", key: "tongxunButie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "其他奖励", key: "qitaJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "下乡补助", key: "xiaxiangBuzhu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "营业厅补助", key: "yingyetingBuzhu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "夜间值班", key: "NormalOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "周末值班", key: "WeekendOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "节假日值班", key: "HolidayOT", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "安全奖励(非全日制)", key: "anquanJiangli", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "无违章奖励(非全日制)", key: "wuweizhangJiangli", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "加班奖金(非全日制)", key: "OTJiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "扣工资", key: "kouchu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "其他罚款", key: "kaohekoukuan", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "应发工资", key: "yingfagongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年金", key: "nianjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "养老保险", key: "yanglaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "失业保险", key: "shiyebaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "住房公积金", key: "zhufanggongjijin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "医疗保险", key: "yiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业年金", key: "qiyeNianjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业养老保险", key: "qiyeYanglaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业失业保险", key: "qiyeShiyebaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业住房公积金", key: "qiyeZhufanggongjijin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业医疗保险", key: "qiyeYiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "应税工资", key: "yingshuigongzi", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "个人所得税", key: "tax", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年终奖金", key: "yicixingjiangjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年终奖金税", key: "yicixingjiangjinTax", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "补充医疗保险", key: "buchongyiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业生育保险", key: "shengyubaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业工伤保险", key: "gongshangbaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "实发工资", key: "netIncome", width: 10, outlineLevel: 1, style: { bold: true } }
  ];

  let newColumns = Object.assign([], headerColumns);

  if (columnsList.length === 0) {
    return newColumns.concat(columns);
  } else {
    for (let i = 0; i < columns.length; i++) {
      for (let k = 0; k < columnsList.length; k++) {
        if (columnsList[k].key === columns[i].key) {
          newColumns.push(columns[i]);
          break;
        }
      }
    }

    return newColumns;
  }
};
exports.PayrollQueryDataToExcel = function(SDDataLists, filename, columns) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("SalaryData", { views: [{ state: "frozen", xSplit: 2, ySplit: 1 }] });
    worksheet.columns = setPayrollFullQueryColumns(columns);

    worksheet.addRows(SDDataLists);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJS-PayrollFullQuery-001");
        throw err;
      });
  });
};
/**
 * Baoxian bulv related functions
 */
var setBaoxianbulvDataColumns = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 15, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工作岗位", key: "jobRole", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作类别", key: "workerCategory", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "周期", key: "salaryCycle", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "年金", key: "nianjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "养老保险", key: "yanglaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "失业保险", key: "shiyebaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "住房公积金", key: "zhufanggongjijin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "医疗保险", key: "yiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业年金", key: "qiyeNianjin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业养老保险", key: "qiyeYanglaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业失业保险", key: "qiyeShiyebaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业住房公积金", key: "qiyeZhufanggongjijin", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业医疗保险", key: "qiyeYiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "补充医疗保险", key: "buchongyiliaobaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业生育保险", key: "shengyubaoxian", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "企业工伤保险", key: "gongshangbaoxian", width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};
exports.BulvDataToExcel = function(WEDataLists, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("WelfareData", { views: [{ state: "frozen", xSplit: 2, ySplit: 1 }] });
    worksheet.columns = setBaoxianbulvDataColumns();

    worksheet.addRows(WEDataLists);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSOT001");
        throw err;
      });
  });
};

exports.BulvExcelToJSON = function(filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook.xlsx
      .readFile(filename)
      .then(function(excelDoc) {
        var worksheet = excelDoc.getWorksheet(1);
        rowCount = worksheet.rowCount;
        if (rowCount < 1) {
          logger.error("Do not find excel data");
          logger.error("Error Location EXCELJSOT002");
          throw new Error("Do not find excel data");
          return;
        }

        let WelfaresLists = [];

        worksheet.eachRow(function(row, rowNumber) {
          if (rowNumber === 1) return;
          let [
            ,
            empId,
            name,
            department,
            jobRole,
            workerCategory,
            salaryCycle,
            nianjin,
            yanglaobaoxian,
            shiyebaoxian,
            zhufanggongjijin,
            yiliaobaoxian,
            qiyeNianjin,
            qiyeYanglaobaoxian,
            qiyeShiyebaoxian,
            qiyeZhufanggongjijin,
            qiyeYiliaobaoxian,
            buchongyiliaobaoxian,
            shengyubaoxian,
            gongshangbaoxian
          ] = row.values;

          if (null === empId || empId === undefined || empId === "") {
            logger.error("Employee ID is not provided from the excel, will skip row: " + rowNumber);
            return;
          }
          if (null === salaryCycle || salaryCycle === undefined || salaryCycle === "") {
            logger.error("salaryCycle is not provided from the excel, will skip row: " + rowNumber);
            return;
          }
          let OT = {
            empId: empId ? empId : "",
            salaryCycle: salaryCycle ? salaryCycle : "",
            nianjin: nianjin ? nianjin : 0,
            yanglaobaoxian: yanglaobaoxian ? yanglaobaoxian : 0,
            shiyebaoxian: shiyebaoxian ? shiyebaoxian : 0,
            zhufanggongjijin: zhufanggongjijin ? zhufanggongjijin : 0,
            yiliaobaoxian: yiliaobaoxian ? yiliaobaoxian : 0,
            qiyeNianjin: qiyeNianjin ? qiyeNianjin : 0,
            qiyeYanglaobaoxian: qiyeYanglaobaoxian ? qiyeYanglaobaoxian : 0,
            qiyeShiyebaoxian: qiyeShiyebaoxian ? qiyeShiyebaoxian : 0,
            qiyeZhufanggongjijin: qiyeZhufanggongjijin ? qiyeZhufanggongjijin : 0,
            qiyeYiliaobaoxian: qiyeYiliaobaoxian ? qiyeYiliaobaoxian : 0,
            buchongyiliaobaoxian: buchongyiliaobaoxian ? buchongyiliaobaoxian : 0,
            shengyubaoxian: shengyubaoxian ? shengyubaoxian : 0,
            gongshangbaoxian: gongshangbaoxian ? gongshangbaoxian : 0
          };
          WelfaresLists.push(OT);
        });

        rel(WelfaresLists);
      })
      .catch(function(err) {
        logger.error("Error Location EXCELJSOT003");
        throw err;
      });
  });
};
/**
 * Welfares related functinos
 */

var setWelfareDataColumns = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 15, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工作岗位", key: "jobRole", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作类别", key: "workerCategory", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "福利周期", key: "salaryCycle", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "医疗费用", key: "Yiliaofeiyong", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "疗养费用", key: "Liaoyangfeiyong", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "供暖补贴", key: "Gongnuanbutie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "独生子女费", key: "Dushengzinv", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "丧葬补助", key: "Sangzangbuzhu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "抚恤费", key: "Fuxufei", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "防暑降温费", key: "Fangshujiangwen", width: 10, outlineLevel: 1, style: { bold: true } },
    //{ header: '食堂经费', key: 'Shitangjingfei', width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "个人其它福利", key: "Personalqitafuli", width: 10, outlineLevel: 1, style: { bold: true } }
    //{ header: '单位其它福利', key: 'CompanyQitafuli', width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};
exports.WEDataToExcel = function(WEDataLists, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("WelfareData", { views: [{ state: "frozen", xSplit: 2, ySplit: 1 }] });
    worksheet.columns = setWelfareDataColumns();

    worksheet.addRows(WEDataLists);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSOT001");
        throw err;
      });
  });
};

exports.WEExcelToJSON = function(filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook.xlsx
      .readFile(filename)
      .then(function(excelDoc) {
        var worksheet = excelDoc.getWorksheet(1);
        rowCount = worksheet.rowCount;
        if (rowCount < 1) {
          logger.error("Do not find excel data");
          logger.error("Error Location EXCELJSOT002");
          throw new Error("Do not find excel data");
          return;
        }

        let WelfaresLists = [];
        //CompanyQitafuli,Shitangjingfei
        worksheet.eachRow(function(row, rowNumber) {
          if (rowNumber === 1) return;
          let [
            ,
            empId,
            name,
            department,
            jobRole,
            workerCategory,
            salaryCycle,
            Yiliaofeiyong,
            Liaoyangfeiyong,
            Gongnuanbutie,
            Dushengzinv,
            Sangzangbuzhu,
            Fuxufei,
            Fangshujiangwen,
            Personalqitafuli
          ] = row.values;

          if (null === empId || empId === undefined || empId === "") {
            logger.error("Employee ID is not provided from the excel, will skip row: " + rowNumber);
            return;
          }
          if (null === salaryCycle || salaryCycle === undefined || salaryCycle === "") {
            logger.error("salaryCycle is not provided from the excel, will skip row: " + rowNumber);
            return;
          }
          let OT = {
            empId: empId ? empId : "",
            salaryCycle: salaryCycle ? salaryCycle : "",
            Yiliaofeiyong: Yiliaofeiyong ? Yiliaofeiyong : "",
            Liaoyangfeiyong: Liaoyangfeiyong ? Liaoyangfeiyong : "",
            Gongnuanbutie: Gongnuanbutie ? Gongnuanbutie : "",
            Dushengzinv: Dushengzinv ? Dushengzinv : "",
            Sangzangbuzhu: Sangzangbuzhu ? Sangzangbuzhu : "",
            Fuxufei: Fuxufei ? Fuxufei : "",
            Fangshujiangwen: Fangshujiangwen ? Fangshujiangwen : "",
            //Shitangjingfei: Shitangjingfei ? Shitangjingfei : '',
            Personalqitafuli: Personalqitafuli ? Personalqitafuli : ""
            //CompanyQitafuli: CompanyQitafuli ? CompanyQitafuli : ''
          };
          WelfaresLists.push(OT);
        });

        rel(WelfaresLists);
      })
      .catch(function(err) {
        logger.error("Error Location EXCELJSOT003");
        throw err;
      });
  });
};

var setWelColumnsByCategory = function() {
  var columns = [
    { header: "工作类别", key: "workerCategory", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "医疗费用", key: "Yiliaofeiyong", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "疗养费用", key: "Liaoyangfeiyong", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "供暖补贴", key: "Gongnuanbutie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "独生子女费", key: "Dushengzinv", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "丧葬补助", key: "Sangzangbuzhu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "抚恤费", key: "Fuxufei", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "防暑降温费", key: "Fangshujiangwen", width: 10, outlineLevel: 1, style: { bold: true } },
    //{ header: '食堂经费', key: 'Shitangjingfei', width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "个人其它福利", key: "Personalqitafuli", width: 10, outlineLevel: 1, style: { bold: true } }
    //{ header: '单位其它福利', key: 'CompanyQitafuli', width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};

exports.WelfaresToExcelByWorkerCategory = function(WelData, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("WelfaresByCategory", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
    worksheet.columns = setWelColumnsByCategory();

    worksheet.addRows(WelData);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSGZDDataToExcelByDepartment001");
        throw err;
      });
  });
};

var setWelColumnsByDepartment = function() {
  var columns = [
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "医疗费用", key: "Yiliaofeiyong", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "疗养费用", key: "Liaoyangfeiyong", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "供暖补贴", key: "Gongnuanbutie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "独生子女费", key: "Dushengzinv", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "丧葬补助", key: "Sangzangbuzhu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "抚恤费", key: "Fuxufei", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "防暑降温费", key: "Fangshujiangwen", width: 10, outlineLevel: 1, style: { bold: true } },
    //{ header: '食堂经费', key: 'Shitangjingfei', width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "个人其它福利", key: "Personalqitafuli", width: 10, outlineLevel: 1, style: { bold: true } }
    //{ header: '单位其它福利', key: 'CompanyQitafuli', width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};

exports.WelfaresToExcelByDepartment = function(WelData, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("WelfaresByCategory", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
    worksheet.columns = setWelColumnsByDepartment();

    worksheet.addRows(WelData);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSGZDDataToExcelByDepartment001");
        throw err;
      });
  });
};
var setWelColumnsByEmp = function() {
  var columns = [
    { header: "员工号", key: "empId", width: 15, style: { bold: true } },
    { header: "姓名", key: "name", width: 15, style: { bold: true } },
    { header: "工作部门", key: "department", width: 15, outlineLevel: 1, style: { bold: true } },
    { header: "工作岗位", key: "jobRole", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "工作类别", key: "workerCategory", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "医疗费用", key: "Yiliaofeiyong", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "疗养费用", key: "Liaoyangfeiyong", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "供暖补贴", key: "Gongnuanbutie", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "独生子女费", key: "Dushengzinv", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "丧葬补助", key: "Sangzangbuzhu", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "抚恤费", key: "Fuxufei", width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "防暑降温费", key: "Fangshujiangwen", width: 10, outlineLevel: 1, style: { bold: true } },
    //{ header: '食堂经费', key: 'Shitangjingfei', width: 10, outlineLevel: 1, style: { bold: true } },
    { header: "个人其它福利", key: "Personalqitafuli", width: 10, outlineLevel: 1, style: { bold: true } }
    //{ header: '单位其它福利', key: 'CompanyQitafuli', width: 10, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};

exports.WelfaresToExcelByEmp = function(WelData, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("WelfaresByCategory", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
    worksheet.columns = setWelColumnsByEmp();

    worksheet.addRows(WelData);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSGZDDataToExcelByDepartment001");
        throw err;
      });
  });
};

exports.WelfaresToExcelDetails = function(WelData, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("WelfaresByCategory", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
    worksheet.columns = setWelColumnsByEmp();

    worksheet.addRows(WelData);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSGZDDataToExcelByDepartment001");
        throw err;
      });
  });
};

var setDanweiWelColumns = function() {
  var columns = [
    { header: "福利周期", key: "salaryCycle", width: 15, style: { bold: true } },
    { header: "食堂经费", key: "Shitangjingfei", width: 15, style: { bold: true } },
    { header: "其他单位福利", key: "CompanyQitafuli", width: 15, outlineLevel: 1, style: { bold: true } }
  ];
  return columns;
};
exports.DanweiWelfaresQueryDataToExcel = function(welData, filename) {
  return new Promise(function(rel, rej) {
    var workbook = new Excel.Workbook();
    workbook = setDefaultWorkBookProperties(workbook);
    var worksheet = workbook.addWorksheet("DanweiWelfares", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
    worksheet.columns = setDanweiWelColumns();

    worksheet.addRows(welData);
    workbook.xlsx
      .writeFile(filename)
      .then(function() {
        logger.info("Successed write to file");
        rel(filename);
      })
      .catch(function(err) {
        logger.error(err);
        logger.error("Error Location EXCELJSDanweiWelfaresToExcel001");
        throw err;
      });
  });
};
