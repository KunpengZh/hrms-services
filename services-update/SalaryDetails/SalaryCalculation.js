var log4js = require("log4js");
var logger = log4js.getLogger("HRMS-SalaryCalculation");
logger.level = "All";

const NIANJINXISHU = "NIANJINXISHU";
const YANGLAOBAOXIANXISHU = "YANGLAOBAOXIANXISHU";
const SHIYEBAOXIANXISHU = "SHIYEBAOXIANXISHU";
const YILIAOBAOXIANXISHU = "YILIAOBAOXIANXISHU";
const ZHUFANGGONGJIJINXISHU = "ZHUFANGGONGJIJINXISHU";
const QIYENIANJINXISHU = "QIYENIANJINXISHU";
const GERENSUODESHUISHUIJI = "GERENSUODESHUISHUIJI";
const SHANGNIANQUANSHIZHIGONGGONGZI = "SHANGNIANQUANSHIZHIGONGGONGZI";
const PINGRIJIABANXISHU = "PINGRIJIABANXISHU";
const JIEJIARIJIABANXISHU = "JIEJIARIJIABANXISHU";
const QIYEYANGLAOBAOXIANXISHU = "QIYEYANGLAOBAOXIANXISHU";
const QIYEYILIAOBAOXIANXISHU = "QIYEYILIAOBAOXIANXISHU";
const QIYESHIYEBAOXIANXISHU = "QIYESHIYEBAOXIANXISHU";
const QIYEZHUFANGGONGJIJINXISHU = "QIYEZHUFANGGONGJIJINXISHU";

var SalaryCalculation = {};
const ActiveEmpStatus = "Active";
const InActiveEmpStatus = "InActive";
var SalaryDetailsModel = require("./Model/SalaryDetails");
const NotApplicableRegularEmpColumns = ["daySalary", "workDays", "anquanJiangli", "wuweizhangJiangli", "OTJiangjin"];
// 'nianjin',
// 'nianjinComments', 'qiyeNianjin', 'qiyeNianJinComments', 'yanglaobaoxian', 'yanglaobaoxianComments',
// 'shiyebaoxian', 'shiyebaoxianComments','qieYanglaobaoxian', 'qiyeYanglaobaoxianComments',
//   'qiyeShiyebaoxian', 'qiyeShiyebaoxianComments','preAnnuallyIncom',
const NotApplicableNonRegularEmpColumns = [
  "jinengGongzi",
  "gangweiGongzi",
  "jichuButie",
  "xilifei",
  "gonglingGongzi",
  "jibengongzi",
  "zhiwuJintie",
  "gongliBuzhu",
  "kaoheJiangjin",
  "tongxunButie",
  "qitaJiangjin",
  "xiaxiangBuzhu",
  "yingyetingBuzhu",
  "NormalOT",
  "NormalOTComments",
  "WeekendOT",
  "WeekendOTComments",
  "HolidayOT",
  "HolidayOTComments",
  "kouchu",
  "kaohekoukuan",
  "zhufanggongjijin",
  "zhufanggongjijinComments",
  "yiliaobaoxian",
  "yiliaobaoxianComments",
  "netIncome",
  "netIncomeComments",
  "yicixingjiangjinTaxComments",
  "buchongyiliaobaoxian",
  "yicixingjiangjin",
  "yicixingjiangjinTax",
  "qiyeZhufanggongjijin",
  "qiyeZhufanggongjijinComments",
  "qiyeYiliaobaoxian",
  "qiyeYiliaobaoxianComments",
  "gudingJiangjin"
];

const RegularEmpGongZiInfo = [
  "jinengGongzi",
  "gangweiGongzi",
  "jichuButie",
  "xilifei",
  "gonglingGongzi",
  "zhiwuJintie"
];

const SharedFields = [
  "idCard",
  "bankAccount",
  "birthday",
  "preAnnuallyIncom",
  "nianjinJishu",
  "shiyebaoxianJishu",
  "yanglaobaoxianJishu",
  "zhufanggongjijinJishu",
  "personalIncomeTaxDeduction"
];

const NonRegularEmpGongZiInfo = [
  "daySalary",
  "workDays",
  "anquanJiangli",
  "wuweizhangJiangli",
  "OTJiangjin",
  "shengyubaoxian",
  "gongshangbaoxian"
];
const NonRegularEmployeeCategory = "非全日制人员";
const NotApplicableComments = "不适用";
const MonthlyEmpOTData = [
  "NormalOT",
  "WeekendOT",
  "HolidayOT",
  "kouchu",
  "kaohekoukuan",
  "yicixingjiangjin",
  "gongliBuzhu",
  "kaoheJiangjin",
  "tongxunButie",
  "qitaJiangjin",
  "xiaxiangBuzhu",
  "yingyetingBuzhu",
  "buchongyiliaobaoxian",
  "yiliaobaoxian",
  "gudingJiangjin",
  "qiyeYiliaobaoxian",
  "shengyubaoxian",
  "gongshangbaoxian"
];

var keepTwoDecimalFull = function(num) {
  var result = parseFloat(num);
  if (isNaN(result)) {
    return false;
  }
  result = Math.round(num * 100) / 100;
  var s_x = result.toString();
  var pos_decimal = s_x.indexOf(".");
  if (pos_decimal < 0) {
    pos_decimal = s_x.length;
    s_x += ".";
  }
  while (s_x.length <= pos_decimal + 2) {
    s_x += "0";
  }
  return s_x;
};

SalaryCalculation.GenerateSalaryDetails = function(emps, salaryCycle) {
  let sds = [];
  emps.forEach(function(emp) {
    sds.push(SalaryDetailsModel(emp, salaryCycle));
  });
  return sds;
};
SalaryCalculation.fillRegularEmployeeGongZiXinXi = function(emps, senEmpData, empOTs) {
  let newemps = emps.map(function(emp) {
    let seEmp = null;
    for (let i = 0; i < senEmpData.length; i++) {
      if (emp.empId === senEmpData[i].empId) {
        seEmp = senEmpData[i];
      }
    }

    /**
     * 填写员工的敏感信息，共享的信息
     */

    if (null !== seEmp) {
      SharedFields.forEach(function(element) {
        emp[element] = seEmp[element];
      });
    }

    /**
     * 非全日制人员,直接返回
     */
    if (emp.workerCategory.trim() === NonRegularEmployeeCategory) {
      return emp;
    }

    /**
     * 以下为全日制工作人员，把员工敏感信息里的信息复制到emp里来
     * 把不适用于全日制工作人员的字段替换为不适用
     */

    NotApplicableRegularEmpColumns.forEach(function(element) {
      emp[element] = NotApplicableComments;
    });

    /**
     * 如果这个员工没有所对应的工资数据，侧他的信息里全部为0，然后继续
     */
    if (seEmp === null) {
      logger.error("没有找到所对应的员工工资数据:  " + emp.empId);
      logger.error("Error Location SalaryCalculation102");
      return emp;
    }

    /**
     * 把工资数据填入这次的员工中
     */
    RegularEmpGongZiInfo.forEach(function(key) {
      emp[key] = seEmp[key] ? seEmp[key] : "0";
    });

    /**
     * 从 Monthly OT 中找到此员工的信息，并合并进去
     */
    let OTEmp = null;
    for (let i = 0; i < empOTs.length; i++) {
      if (emp.empId === empOTs[i].empId) {
        OTEmp = empOTs[i];
        break;
      }
    }

    if (OTEmp) {
      MonthlyEmpOTData.forEach(function(element) {
        emp[element] = OTEmp[element] ? OTEmp[element] : "0";
      });
    }

    return emp;
  });
  return newemps;
};

SalaryCalculation.fillNonRegularEmployeeGongZiXinXi = function(emps, senEmpData, nonRegularData) {
  let newemps = emps.map(function(emp) {
    /**
     * 全日制人员,直接返回
     */
    if (emp.workerCategory.trim() !== NonRegularEmployeeCategory) {
      return emp;
    }

    /**
     * 非全日制人员，把不需要的字段替换为不适用，然后返回
     */
    NotApplicableNonRegularEmpColumns.forEach(function(element) {
      emp[element] = NotApplicableComments;
    });

    let noEmp = null;
    for (let i = 0; i < nonRegularData.length; i++) {
      if (emp.empId === nonRegularData[i].empId) {
        noEmp = nonRegularData[i];
      }
    }

    let seEmp = null;
    for (let i = 0; i < senEmpData.length; i++) {
      if (emp.empId === senEmpData[i].empId) {
        seEmp = senEmpData[i];
      }
    }

    /**
     * 如果这个员工没有所对应的工资数据，侧他的信息里全部为0，然后继续
     */
    if (noEmp === null) {
      logger.error("没有找到所对应的员工工资数据:  " + emp.empId);
      logger.error("Error Location SalaryCalculation1101");
      return emp;
    }

    /**
     * 把工资数据填入这次的员工中
     */
    NonRegularEmpGongZiInfo.forEach(function(key) {
      emp[key] = noEmp[key] ? noEmp[key] : "0";
    });

    return emp;
  });
  return newemps;
};

SalaryCalculation.calculateJibengongzi = function(emps) {
  let newemps = [];
  for (let i = 0; i < emps.length; i++) {
    let emp = emps[i];

    if (emp.workerCategory.trim() === NonRegularEmployeeCategory) {
      /**
       * 非全日制员工， 基本工资为日工资数 * 工作天数
       * 日工资数与工作天数为每月上传
       */
      emp.jibengongzi = keepTwoDecimalFull(parseFloat(emp.daySalary) * parseFloat(emp.workDays));
      emp.jibengongziComments = "日工资(" + emp.daySalary + ") * 工作天数(" + emp.workDays + ")=" + emp.jibengongzi;
    } else {
      /**
       * 全日制员工
       * 基本工资=技能工资+岗位工资+基础补贴+洗理费+工龄工资+基本工资
       */
      emp.jibengongzi =
        keepTwoDecimalFull(
          parseFloat(emp.jinengGongzi) +
            parseFloat(emp.gangweiGongzi) +
            parseFloat(emp.jichuButie) +
            parseFloat(emp.xilifei) +
            parseFloat(emp.gonglingGongzi)
        ) + "";
      emp.jibengongziComments =
        "技能工资(" +
        emp.jinengGongzi +
        ")+岗位工资(" +
        emp.gangweiGongzi +
        ")+基础补贴(" +
        emp.jichuButie +
        ")+洗理费(" +
        emp.xilifei +
        ")+工龄工资(" +
        emp.gonglingGongzi +
        ")=" +
        emp.jibengongzi;
    }
    newemps.push(emp);
  }

  return newemps;
};

SalaryCalculation.categoryOT = function(emps, configDoc) {
  /**
   * 从Configdoc 中获取加班系数，如果未能获取到，就用默认值
   * 默认平时与周末加班系数为：2
   * 默认节假日加班系数为：3
   * 最新计算方法是，直接上传加班费，不再需要计算，所以不再需加班系数
   */
  // let PINGRIJIABANXISHU = 2, JIEJIARIJIABANXISHU = 3;

  // let ConfigPercentage = configDoc.ConfigPercentage;
  // for (let i = 0; i < ConfigPercentage.length; i++) {
  //     if (ConfigPercentage[i].text.trim() === PINGRIJIABANXISHU) {
  //         PINGRIJIABANXISHU = parseFloat(ConfigPercentage[i].value);
  //     } else if (ConfigPercentage[i].text.trim() === JIEJIARIJIABANXISHU) {
  //         JIEJIARIJIABANXISHU = parseFloat(ConfigPercentage[i].value);
  //     }
  // }

  let newemps = emps.map(function(emp) {
    if (emp.workerCategory.trim() === NonRegularEmployeeCategory) {
      /**
       * 非全日制员工， 有加班奖金，没有平时与节假日加班
       */
    } else {
      /**
       * 全日制员工
       * 小时加班费基数为 (技能工资+岗位工资）/21.75/8
       * 加班系统分为平时加班系数，节假日加班系数， 平时加班与周六日加班都适用平时加班系数（客户要求）
       * 平时加班费=小时加班费基数*平时加班小时数*平时与周六日加班系统数
       * 周末加班费=小时加班费基数*周末加班小时数*平时与周六日加班系统数
       * 节假日加班费=小时加班费基数*节假日加班小时数*节假日加班系数
       *
       * 新算法，更新于217-11-09
       * normalOT 就是夜间值班的费用， 所以NormalOTComments不再需要
       * WeekendOT 就是周末值班的费用， 所以WeekendOTComments不瑞需
       * 节假日值班的计算工式为：（技能工资+岗位工资）/21.75*2*天数
       *
       */

      //emp.NormalOTComments = '[技能工资(' + emp.jinengGongzi + ')+岗位工资(' + emp.gangweiGongzi + ')]/21.75/8*平时加班系数(' + PINGRIJIABANXISHU + ')*小时数(' + emp.NormalOT + ')=';
      //emp.WeekendOTComments = '[技能工资(' + emp.jinengGongzi + ')+岗位工资(' + emp.gangweiGongzi + ')]/21.75/8*周末加班系数(' + PINGRIJIABANXISHU + ')*小时数(' + emp.WeekendOT + ')=';
      emp.HolidayOTComments =
        "[技能工资(" +
        emp.jinengGongzi +
        ")+岗位工资(" +
        emp.gangweiGongzi +
        ")]/21.75*2*节假日值班天数(" +
        emp.HolidayOT +
        ")=";

      //emp.NormalOT = ((parseFloat(emp.jinengGongzi) + parseFloat(emp.gangweiGongzi)) / 21.75 / 8 * PINGRIJIABANXISHU * parseFloat(emp.NormalOT)).toFixed(2) + '';
      //emp.WeekendOT = ((parseFloat(emp.jinengGongzi) + parseFloat(emp.gangweiGongzi)) / 21.75 / 8 * PINGRIJIABANXISHU * parseFloat(emp.WeekendOT)).toFixed(2) + '';

      emp.HolidayOT = Math.round(
        ((parseFloat(emp.jinengGongzi) + parseFloat(emp.gangweiGongzi)) / 21.75) * 2 * parseFloat(emp.HolidayOT)
      );

      emp.NormalOTComments += emp.NormalOT;
      emp.WeekendOTComments += emp.WeekendOT;
      emp.HolidayOTComments += emp.HolidayOT;
    }
    return emp;
  });
  return newemps;
};

SalaryCalculation.calculateYingfagongzi = function(emps) {
  let newemps = emps.map(function(emp) {
    if (emp.workerCategory.trim() === NonRegularEmployeeCategory) {
      /**
       * 非全日制员工
       *  应发工资=员工的基本工资+安全奖励+无违章奖励+加班奖金
       */

      emp.yingfagongzi = keepTwoDecimalFull(
        parseFloat(emp.jibengongzi) +
          parseFloat(emp.anquanJiangli) +
          parseFloat(emp.wuweizhangJiangli) +
          parseFloat(emp.OTJiangjin)
      );

      emp.yingfagongziComments =
        "基本工资(" +
        emp.jibengongzi +
        ")+安全奖励(" +
        emp.anquanJiangli +
        ")+无违章奖励(" +
        emp.wuweizhangJiangli +
        ")+加班奖金(" +
        emp.OTJiangjin +
        ")=应发工资(" +
        emp.yingfagongzi +
        ")";
    } else {
      /**
       * 全日制员工
       */
      emp.yingfagongzi = keepTwoDecimalFull(
        parseFloat(emp.jibengongzi) +
          parseFloat(emp.zhiwuJintie) +
          parseFloat(emp.gongliBuzhu) +
          parseFloat(emp.kaoheJiangjin) +
          parseFloat(emp.gudingJiangjin) +
          parseFloat(emp.tongxunButie) +
          parseFloat(emp.qitaJiangjin) +
          parseFloat(emp.xiaxiangBuzhu) +
          parseFloat(emp.yingyetingBuzhu) +
          parseFloat(emp.NormalOT) +
          parseFloat(emp.WeekendOT) +
          parseFloat(emp.HolidayOT) -
          parseFloat(emp.kouchu) -
          parseFloat(emp.kaohekoukuan)
      );

      emp.yingfagongziComments =
        "基本工资(" +
        emp.jibengongzi +
        ")+职务津贴(" +
        emp.zhiwuJintie +
        ")+公里补助(" +
        emp.gongliBuzhu +
        ")+考核奖金(" +
        emp.kaoheJiangjin +
        ")+固定奖金(" +
        emp.gudingJiangjin +
        ")+通讯补贴(" +
        emp.tongxunButie +
        ")+其他奖励(" +
        emp.qitaJiangjin +
        ")+下乡补助(" +
        emp.xiaxiangBuzhu +
        ")+营业厅补助(" +
        emp.yingyetingBuzhu +
        ")+平时加班(" +
        emp.NormalOT +
        ")+周末加班(" +
        emp.WeekendOT +
        ")+节假日加班(" +
        emp.HolidayOT +
        ")-扣除项(" +
        emp.kouchu +
        ")-考核扣款(" +
        emp.kaohekoukuan +
        ")=应发工资(" +
        emp.yingfagongzi +
        ")";
    }

    return emp;
  });
  return newemps;
};

SalaryCalculation.calculateNianJinAndBaoXian = function(emps, configDoc) {
  /**
   * 2017-11-14
   * 员工的医疗保险分为如下几部分：
   * 1. yiliaobaoxian，这部会从员工工资中扣除，但不用系数来计算，为每月直接输入
   * 2. qiyeYiliaobaoxian， 不用系数来计算，为每月直接输入
   * 3. buchongyiliaobaoxian， 不用系数来计算，为每月直接输入，不从员工工资中扣除
   */

  /**
   * 从Configdoc 中获取加班系数，如果未能获取到，就用默认值
   * 默认平时与周末加班系数为：2
   * 默认节假日加班系数为：3
   */
  let ConfigPercentage = configDoc.ConfigPercentage;
  let nianjinxishu = 0.0125;
  let havenianjinxushu = false;
  let yanglaobaoxianxishu = 0.08;
  let haveyanglaobaoxianxishu = false;
  let shiyebaoxianxishu = 0.003;
  let haveshiyebaoxianxishu = false;
  let zhufanggongjijinxishu = 0.1;
  let havezhufanggongjijinxishu = false;
  let yiliaobaoxianxishu = 0.02;
  let haveyiliaobaoxianxishu = false;

  let shangnianquanshizhigonggongzi = 0;
  let haveshangnianquanshizhigonggongzi = false;

  let qiyenianjinxishu = 0.05;
  let haveqiyenianjinxishu = false;
  let qiyeyanglaobaoxianxishu = 0.2;
  let haveqiyeyanglaobaoxianxishu = false;
  let qiyeshiyebaoxianxishu = 0.007;
  let haveqiyeshiyebaoxianxishu = false;
  let qiyezhufanggongjijinxishu = 0.12;
  let haveqiyezhufanggongjijinxishu = false;
  let qiyeyiliaobaoxianxishu = 0.075;
  let haveqiyeyiliaobaoxianxishu = false;

  for (let i = 0; i < ConfigPercentage.length; i++) {
    switch (ConfigPercentage[i].text.trim()) {
      case NIANJINXISHU:
        nianjinxishu = parseFloat(ConfigPercentage[i].value);
        havenianjinxushu = true;
        break;
      case YANGLAOBAOXIANXISHU:
        yanglaobaoxianxishu = parseFloat(ConfigPercentage[i].value);
        haveyanglaobaoxianxishu = true;
        break;
      case YILIAOBAOXIANXISHU:
        yiliaobaoxianxishu = parseFloat(ConfigPercentage[i].value);
        haveyiliaobaoxianxishu = true;
        break;
      case SHIYEBAOXIANXISHU:
        shiyebaoxianxishu = parseFloat(ConfigPercentage[i].value);
        haveshiyebaoxianxishu = true;
        break;
      case ZHUFANGGONGJIJINXISHU:
        zhufanggongjijinxishu = parseFloat(ConfigPercentage[i].value);
        havezhufanggongjijinxishu = true;
        break;
      case SHANGNIANQUANSHIZHIGONGGONGZI:
        shangnianquanshizhigonggongzi = parseFloat(ConfigPercentage[i].value);
        haveshangnianquanshizhigonggongzi = true;
        break;
      case QIYENIANJINXISHU:
        qiyenianjinxishu = parseFloat(ConfigPercentage[i].value);
        haveqiyenianjinxishu = true;
        break;
      case QIYEYANGLAOBAOXIANXISHU:
        qiyeyanglaobaoxianxishu = parseFloat(ConfigPercentage[i].value);
        haveqiyeyanglaobaoxianxishu = true;
        break;
      case QIYESHIYEBAOXIANXISHU:
        qiyeshiyebaoxianxishu = parseFloat(ConfigPercentage[i].value);
        haveqiyeshiyebaoxianxishu = true;
        break;
      case QIYEYILIAOBAOXIANXISHU:
        qiyeyiliaobaoxianxishu = parseFloat(ConfigPercentage[i].value);
        haveqiyeyanglaobaoxianxishu = true;
        break;
      case QIYEZHUFANGGONGJIJINXISHU:
        qiyezhufanggongjijinxishu = parseFloat(ConfigPercentage[i].value);
        haveqiyezhufanggongjijinxishu = true;
        break;
    }
  }

  let newemps = emps.map(function(emp) {
    let preAnnuallyIncom = parseFloat(emp.preAnnuallyIncom);
    if (isNaN(preAnnuallyIncom)) preAnnuallyIncom = 0;

    /**
     * 2018-01-22
     * 用户要求将养老保险、失业保险、年金、和住房公积金的基数分开
     */
    let yanglaobaoxianJishu = parseFloat(emp.yanglaobaoxianJishu);
    if (isNaN(yanglaobaoxianJishu) || 0 === yanglaobaoxianJishu) yanglaobaoxianJishu = preAnnuallyIncom;

    let shiyebaoxianJishu = parseFloat(emp.shiyebaoxianJishu);
    if (isNaN(shiyebaoxianJishu) || 0 === shiyebaoxianJishu) shiyebaoxianJishu = preAnnuallyIncom;

    let nianjinJishu = parseFloat(emp.nianjinJishu);
    if (isNaN(nianjinJishu) || 0 === nianjinJishu) nianjinJishu = preAnnuallyIncom;

    let zhufanggongjijinJishu = parseFloat(emp.zhufanggongjijinJishu);
    if (isNaN(zhufanggongjijinJishu) || 0 === zhufanggongjijinJishu) zhufanggongjijinJishu = preAnnuallyIncom;

    if (emp.workerCategory.trim() === NonRegularEmployeeCategory) {
      /**
       * 非全日制员工，有养老保险，年金和失业保险
       */

      let preComments = "";
      emp.nianjin = keepTwoDecimalFull(nianjinJishu * nianjinxishu);
      emp.yanglaobaoxian = keepTwoDecimalFull(yanglaobaoxianJishu * yanglaobaoxianxishu);
      emp.shiyebaoxian = keepTwoDecimalFull(shiyebaoxianJishu * shiyebaoxianxishu);
      emp.nianjinComments =
        preComments + "上一年度月平均收入(" + nianjinJishu + ")*年金系数(" + nianjinxishu + ")=" + emp.nianjin;
      emp.yanglaobaoxianComments =
        preComments +
        "上一年度月平均收入(" +
        yanglaobaoxianJishu +
        ")*养老保险系数(" +
        yanglaobaoxianxishu +
        ")=" +
        emp.yanglaobaoxian;
      emp.shiyebaoxianComments =
        preComments +
        "上一年度月平均收入(" +
        shiyebaoxianJishu +
        ")*失业保险系数(" +
        shiyebaoxianxishu +
        ")=" +
        emp.shiyebaoxian;
      /**
       * 企业部分
       */
      emp.qiyeNianjin = keepTwoDecimalFull(nianjinJishu * qiyenianjinxishu);
      emp.qiyeNianJinComments =
        preComments +
        "上一年度月平均收入(" +
        nianjinJishu +
        ")*企业年金系数(" +
        qiyenianjinxishu +
        ")=" +
        emp.qiyeNianjin;
      // if (parseFloat(emp.nianjin) > 0) {
      //     emp.qiyeNianjin = keepTwoDecimalFull(preAnnuallyIncom * qiyenianjinxishu);
      //     emp.qiyeNianJinComments = preComments + '上一年度月平均收入(' + preAnnuallyIncom + ')*企业年金系数(' + qiyenianjinxishu + ')=' + emp.qiyeNianjin;
      // } else {
      //     emp.qiyeNianjin = '0';
      //     emp.qiyeNianJinComments = '本月无缴费';
      // }

      emp.qiyeYanglaobaoxian = keepTwoDecimalFull(yanglaobaoxianJishu * qiyeyanglaobaoxianxishu);
      emp.qiyeYanglaobaoxianComments =
        preComments +
        "上一年度月平均收入(" +
        yanglaobaoxianJishu +
        ")*企业养老保险系数(" +
        qiyeyanglaobaoxianxishu +
        ")=" +
        emp.qiyeYanglaobaoxian;
      // if (parseFloat(emp.yanglaobaoxian) > 0) {
      //     emp.qiyeYanglaobaoxian = keepTwoDecimalFull(preAnnuallyIncom * qiyeyanglaobaoxianxishu);
      //     emp.qiyeYanglaobaoxianComments = preComments + '上一年度月平均收入(' + preAnnuallyIncom + ')*企业养老保险系数(' + qiyeyanglaobaoxianxishu + ')=' + emp.qiyeYanglaobaoxian;
      // } else {
      //     emp.qiyeYanglaobaoxian = '0';
      //     emp.qiyeYanglaobaoxianComments = '本月无缴费';
      // }

      emp.qiyeShiyebaoxian = keepTwoDecimalFull(shiyebaoxianJishu * qiyeshiyebaoxianxishu);
      emp.qiyeShiyebaoxianComments =
        preComments +
        "上一年度月平均收入(" +
        shiyebaoxianJishu +
        ")*企业失业保险系数(" +
        qiyeshiyebaoxianxishu +
        ")=" +
        emp.qiyeShiyebaoxian;
      // if (parseFloat(emp.shiyebaoxian) > 0) {
      //     emp.qiyeShiyebaoxian = keepTwoDecimalFull(preAnnuallyIncom * qiyeshiyebaoxianxishu);
      //     emp.qiyeShiyebaoxianComments = preComments + '上一年度月平均收入(' + preAnnuallyIncom + ')*企业失业保险系数(' + qiyeshiyebaoxianxishu + ')=' + emp.qiyeShiyebaoxian;
      // } else {
      //     emp.qiyeShiyebaoxian = '0';
      //     emp.qiyeShiyebaoxianComments = '本月无缴费';
      // }
    } else {
      /**
       * 全日制员工
       */

      let preComments = "";

      /**
       * 如果上年度收入大于当地职工平均工资的300%，按上年度平均工资的300%计
       * 如果小于当地职工平均工资的60%，按上年度平均工资的60%计
       * 如果没有配置上年度当地职工平均工资，侧忽略些设置
       */

      // if (haveshangnianquanshizhigonggongzi) {
      //     if (preAnnuallyIncom > shangnianquanshizhigonggongzi * 3) {
      //         preAnnuallyIncom = shangnianquanshizhigonggongzi * 3;
      //         preComments = "上年度收入大于上年度职工月平均工资300%,调整为(" + preAnnuallyIncom + "),";
      //     } else if (preAnnuallyIncom < shangnianquanshizhigonggongzi * 0.6) {
      //         preAnnuallyIncom = shangnianquanshizhigonggongzi * 0.6;
      //         preComments = "上年度收入小于上年度职工月平均工资60%,调整为(" + preAnnuallyIncom + "),";
      //     }
      // } else {
      //     //preComments = "没有配置上年度职工月平均工资设置,";
      // }

      /**
       * 个人部分
       */
      emp.nianjin = keepTwoDecimalFull(nianjinJishu * nianjinxishu);
      emp.yanglaobaoxian = keepTwoDecimalFull(yanglaobaoxianJishu * yanglaobaoxianxishu);
      emp.shiyebaoxian = keepTwoDecimalFull(shiyebaoxianJishu * shiyebaoxianxishu);
      emp.zhufanggongjijin = keepTwoDecimalFull(zhufanggongjijinJishu * zhufanggongjijinxishu);
      //emp.yiliaobaoxian = (preAnnuallyIncom * yiliaobaoxianxishu).toFixed(2) + '';

      emp.nianjinComments =
        preComments + "上一年度月平均收入(" + nianjinJishu + ")*年金系数(" + nianjinxishu + ")=" + emp.nianjin;
      emp.yanglaobaoxianComments =
        preComments +
        "上一年度月平均收入(" +
        yanglaobaoxianJishu +
        ")*养老保险系数(" +
        yanglaobaoxianxishu +
        ")=" +
        emp.yanglaobaoxian;
      emp.shiyebaoxianComments =
        preComments +
        "上一年度月平均收入(" +
        shiyebaoxianJishu +
        ")*失业保险系数(" +
        shiyebaoxianxishu +
        ")=" +
        emp.shiyebaoxian;
      emp.zhufanggongjijinComments =
        preComments +
        "上一年度月平均收入(" +
        zhufanggongjijinJishu +
        ")*住房公积金系数(" +
        zhufanggongjijinxishu +
        ")=" +
        emp.zhufanggongjijin;
      // emp.yiliaobaoxianComments = preComments + '上一年度月平均收入(' + preAnnuallyIncom + ')*医疗保险系数(' + yiliaobaoxianxishu + ')=' + emp.yiliaobaoxian;

      /**
       * 企业部分
       */
      emp.qiyeNianjin = keepTwoDecimalFull(nianjinJishu * qiyenianjinxishu);
      emp.qiyeNianJinComments =
        preComments +
        "上一年度月平均收入(" +
        nianjinJishu +
        ")*企业年金系数(" +
        qiyenianjinxishu +
        ")=" +
        emp.qiyeNianjin;
      // if (parseFloat(emp.nianjin) > 0) {
      //     emp.qiyeNianjin = keepTwoDecimalFull(preAnnuallyIncom * qiyenianjinxishu);
      //     emp.qiyeNianJinComments = preComments + '上一年度月平均收入(' + preAnnuallyIncom + ')*企业年金系数(' + qiyenianjinxishu + ')=' + emp.qiyeNianjin;
      // } else {
      //     emp.qiyeNianjin = '0';
      //     emp.qiyeNianJinComments = '本月无缴费';
      // }

      emp.qiyeYanglaobaoxian = keepTwoDecimalFull(yanglaobaoxianJishu * qiyeyanglaobaoxianxishu);
      emp.qiyeYanglaobaoxianComments =
        preComments +
        "上一年度月平均收入(" +
        yanglaobaoxianJishu +
        ")*企业养老保险系数(" +
        qiyeyanglaobaoxianxishu +
        ")=" +
        emp.qiyeYanglaobaoxian;
      // if (parseFloat(emp.yanglaobaoxian) > 0) {
      //     emp.qiyeYanglaobaoxian = keepTwoDecimalFull(preAnnuallyIncom * qiyeyanglaobaoxianxishu);
      //     emp.qiyeYanglaobaoxianComments = preComments + '上一年度月平均收入(' + preAnnuallyIncom + ')*企业养老保险系数(' + qiyeyanglaobaoxianxishu + ')=' + emp.qiyeYanglaobaoxian;
      // } else {
      //     emp.qiyeYanglaobaoxian = '0';
      //     emp.qiyeYanglaobaoxianComments = '本月无缴费';
      // }

      emp.qiyeShiyebaoxian = keepTwoDecimalFull(shiyebaoxianJishu * qiyeshiyebaoxianxishu);
      emp.qiyeShiyebaoxianComments =
        preComments +
        "上一年度月平均收入(" +
        shiyebaoxianJishu +
        ")*企业失业保险系数(" +
        qiyeshiyebaoxianxishu +
        ")=" +
        emp.qiyeShiyebaoxian;
      // if (parseFloat(emp.shiyebaoxian) > 0) {
      //     emp.qiyeShiyebaoxian = keepTwoDecimalFull(preAnnuallyIncom * qiyeshiyebaoxianxishu);
      //     emp.qiyeShiyebaoxianComments = preComments + '上一年度月平均收入(' + preAnnuallyIncom + ')*企业失业保险系数(' + qiyeshiyebaoxianxishu + ')=' + emp.qiyeShiyebaoxian;
      // } else {
      //     emp.qiyeShiyebaoxian = '0';
      //     emp.qiyeShiyebaoxianComments = '本月无缴费';
      // }

      emp.qiyeZhufanggongjijin = keepTwoDecimalFull(zhufanggongjijinJishu * qiyezhufanggongjijinxishu);
      emp.qiyeZhufanggongjijinComments =
        preComments +
        "上一年度月平均收入(" +
        zhufanggongjijinJishu +
        ")*企业住房公积金系数(" +
        qiyezhufanggongjijinxishu +
        ")=" +
        emp.qiyeZhufanggongjijin;
      // if (parseFloat(emp.zhufanggongjijin) > 0) {
      //     emp.qiyeZhufanggongjijin = keepTwoDecimalFull(preAnnuallyIncom * qiyezhufanggongjijinxishu);
      //     emp.qiyeZhufanggongjijinComments = preComments + '上一年度月平均收入(' + preAnnuallyIncom + ')*企业住房公积金系数(' + qiyezhufanggongjijinxishu + ')=' + emp.qiyeZhufanggongjijin;
      // } else {
      //     emp.qiyeZhufanggongjijin = '0';
      //     emp.qiyeZhufanggongjijinComments = '本月无缴费';
      // }

      // if (parseFloat(emp.yiliaobaoxian) > 0) {
      //     emp.qiyeYiliaobaoxian = (preAnnuallyIncom * qiyeyiliaobaoxianxishu).toFixed(2) + '';
      //     emp.qiyeYiliaobaoxianComments = preComments + '上一年度月平均收入(' + preAnnuallyIncom + ')*企业医疗保险系数(' + qiyeyiliaobaoxianxishu + ')=' + emp.qiyeYiliaobaoxian;
      // } else {
      //     emp.qiyeYiliaobaoxian = '0';
      //     emp.qiyeYiliaobaoxianComments = '本月无缴费';
      // }
    }

    return emp;
  });

  return newemps;
};

SalaryCalculation.baoxianbulvData = function(emps, bulvData) {
  let newemps = emps.map(function(emp) {
    let bulvEmp = {};
    let isbulvEmpExist = false;
    for (let i = 0; i < bulvData.length; i++) {
      if (bulvData[i].empId === emp.empId) {
        bulvEmp = bulvData[i];
        isbulvEmpExist = true;
        break;
      }
    }

    if (!isbulvEmpExist) {
      return emp;
    }

    /**
     * 全日制员工和非全日制员工都有的保险部分
     */
    if (bulvEmp.nianjin && parseFloat(bulvEmp.nianjin) > 0) {
      emp.nianjin = keepTwoDecimalFull(parseFloat(emp.nianjin) + parseFloat(bulvEmp.nianjin));
      emp.nianjinComments += " + 本月补录数据(" + bulvEmp.nianjin + ")=" + emp.nianjin;
      emp.nianjinBulv = bulvEmp.nianjin;
    }
    if (bulvEmp.yanglaobaoxian && parseFloat(bulvEmp.yanglaobaoxian) > 0) {
      emp.yanglaobaoxian = keepTwoDecimalFull(parseFloat(emp.yanglaobaoxian) + parseFloat(bulvEmp.yanglaobaoxian));
      emp.yanglaobaoxianComments += " + 本月补录数据(" + bulvEmp.yanglaobaoxian + ")=" + emp.yanglaobaoxian;
      emp.yanglaobaoxianBulv = bulvEmp.yanglaobaoxian;
    }
    if (bulvEmp.shiyebaoxian && parseFloat(bulvEmp.shiyebaoxian) > 0) {
      emp.shiyebaoxian = keepTwoDecimalFull(parseFloat(emp.shiyebaoxian) + parseFloat(bulvEmp.shiyebaoxian));
      emp.shiyebaoxianComments += " + 本月补录数据(" + bulvEmp.shiyebaoxian + ")=" + emp.shiyebaoxian;
      emp.shiyebaoxianBulv = bulvEmp.shiyebaoxian;
    }

    if (bulvEmp.qiyeNianjin && parseFloat(bulvEmp.qiyeNianjin) > 0) {
      emp.qiyeNianjin = keepTwoDecimalFull(parseFloat(emp.qiyeNianjin) + parseFloat(bulvEmp.qiyeNianjin));
      emp.qiyeNianJinComments += " + 本月补录数据(" + bulvEmp.qiyeNianjin + ")=" + emp.qiyeNianjin;
      emp.qiyeNianjinBulv = bulvEmp.qiyeNianjin;
    }

    if (bulvEmp.qiyeShiyebaoxian && parseFloat(bulvEmp.qiyeShiyebaoxian) > 0) {
      emp.qiyeShiyebaoxian = keepTwoDecimalFull(
        parseFloat(emp.qiyeShiyebaoxian) + parseFloat(bulvEmp.qiyeShiyebaoxian)
      );
      emp.qiyeShiyebaoxianComments += " + 本月补录数据(" + bulvEmp.qiyeShiyebaoxian + ")=" + emp.qiyeShiyebaoxian;
      emp.qiyeShiyebaoxianBulv = bulvEmp.qiyeShiyebaoxian;
    }

    if (bulvEmp.qiyeYanglaobaoxian && parseFloat(bulvEmp.qiyeYanglaobaoxian) > 0) {
      emp.qiyeYanglaobaoxian = keepTwoDecimalFull(
        parseFloat(emp.qiyeYanglaobaoxian) + parseFloat(bulvEmp.qiyeYanglaobaoxian)
      );
      emp.qiyeYanglaobaoxianComments += " + 本月补录数据(" + bulvEmp.qiyeYanglaobaoxian + ")=" + emp.qiyeYanglaobaoxian;
      emp.qiyeYanglaobaoxianBulv = bulvEmp.qiyeYanglaobaoxian;
    }

    if (bulvEmp.shengyubaoxian && parseFloat(bulvEmp.shengyubaoxian) > 0) {
      emp.shengyubaoxian = keepTwoDecimalFull(parseFloat(emp.shengyubaoxian) + parseFloat(bulvEmp.shengyubaoxian));
      emp.shengyubaoxianBulv = bulvEmp.shengyubaoxian;
    }
    if (bulvEmp.gongshangbaoxian && parseFloat(bulvEmp.gongshangbaoxian) > 0) {
      emp.gongshangbaoxian = keepTwoDecimalFull(
        parseFloat(emp.gongshangbaoxian) + parseFloat(bulvEmp.gongshangbaoxian)
      );
      emp.gongshangbaoxianBulv = bulvEmp.gongshangbaoxian;
    }

    if (emp.workerCategory.trim() === NonRegularEmployeeCategory) {
      /**
       * 非全日制员工，有养老保险，年金和失业保险
       * 已经包括在上面的共享部分
       */
    } else {
      /**
       * 全日制员工, 只有全日制员工有的保险，住房公积金，医疗保险，补充医疗保险，生育保险，工伤保险
       */

      if (bulvEmp.zhufanggongjijin && parseFloat(bulvEmp.zhufanggongjijin) > 0) {
        emp.zhufanggongjijin = keepTwoDecimalFull(
          parseFloat(emp.zhufanggongjijin) + parseFloat(bulvEmp.zhufanggongjijin)
        );
        emp.zhufanggongjijinComments += " + 本月补录数据(" + bulvEmp.zhufanggongjijin + ")=" + emp.zhufanggongjijin;
        emp.zhufanggongjijinBulv = bulvEmp.zhufanggongjijin;
      }
      if (bulvEmp.qiyeZhufanggongjijin && parseFloat(bulvEmp.qiyeZhufanggongjijin) > 0) {
        emp.qiyeZhufanggongjijin = keepTwoDecimalFull(
          parseFloat(emp.qiyeZhufanggongjijin) + parseFloat(bulvEmp.qiyeZhufanggongjijin)
        );
        emp.qiyeZhufanggongjijinComments +=
          " + 本月补录数据(" + bulvEmp.qiyeZhufanggongjijin + ")=" + emp.qiyeZhufanggongjijin;
        emp.qiyeZhufanggongjijinBulv = bulvEmp.qiyeZhufanggongjijin;
      }
      if (bulvEmp.yiliaobaoxian && parseFloat(bulvEmp.yiliaobaoxian) > 0) {
        emp.yiliaobaoxianComments += "本月医疗保险（" + emp.yiliaobaoxian + ")";
        emp.yiliaobaoxian = keepTwoDecimalFull(parseFloat(emp.yiliaobaoxian) + parseFloat(bulvEmp.yiliaobaoxian));
        emp.yiliaobaoxianComments += "+本月补录数据(" + bulvEmp.yiliaobaoxian + ")=" + emp.yiliaobaoxian;
        emp.yiliaobaoxianBulv = bulvEmp.yiliaobaoxian;
      }
      if (bulvEmp.qiyeYiliaobaoxian && parseFloat(bulvEmp.qiyeYiliaobaoxian) > 0) {
        emp.qiyeYiliaobaoxianComments += "本月企业医疗保险（" + emp.qiyeYiliaobaoxian + ")";
        emp.qiyeYiliaobaoxian = keepTwoDecimalFull(
          parseFloat(emp.qiyeYiliaobaoxian) + parseFloat(bulvEmp.qiyeYiliaobaoxian)
        );
        emp.qiyeYiliaobaoxianComments += "+本月补录数据(" + bulvEmp.qiyeYiliaobaoxian + ")=" + emp.qiyeYiliaobaoxian;
        emp.qiyeYiliaobaoxianBulv = bulvEmp.qiyeYiliaobaoxian;
      }
      /**
       * 因为数据库里没有为补充医疗保险，生育保险，工伤保险设置 comments字段，所以斩时不保存comments
       */
      if (bulvEmp.buchongyiliaobaoxian && parseFloat(bulvEmp.buchongyiliaobaoxian) > 0) {
        emp.buchongyiliaobaoxian = keepTwoDecimalFull(
          parseFloat(emp.buchongyiliaobaoxian) + parseFloat(bulvEmp.buchongyiliaobaoxian)
        );
        emp.buchongyiliaobaoxianBulv = bulvEmp.buchongyiliaobaoxian;
      }
    }
    return emp;
  });
  return newemps;
};

SalaryCalculation.calculateYingshuigongzi = function(emps, configDoc) {
  let ConfigPercentage = configDoc.ConfigPercentage;
  let gerensuodeshuishuiji = 5000;
  let haveShuiJi = false;
  for (let i = 0; i < ConfigPercentage.length; i++) {
    if (ConfigPercentage[i].text === GERENSUODESHUISHUIJI) {
      gerensuodeshuishuiji = parseInt(ConfigPercentage[i].value);
      haveShuiJi = true;
      break;
    }
  }

  if (!haveShuiJi) {
    logger.error("没有找到个人所得税税基数据,将会使用默认值5000来计算个税");
  }

  let newemps = emps.map(function(emp) {
    /**
     * 2019-01-24, 增加个人所得税扣除项， personalIncomeTaxDeduction，人工录入到sensitive emp information表中
     */
    //判断是否需要扣除，如果不需要扣除，侧置为0
    if (
      isNaN(emp.personalIncomeTaxDeduction) ||
      emp.personalIncomeTaxDeduction === "" ||
      emp.personalIncomeTaxDeduction == null
    ) {
      emp.personalIncomeTaxDeduction = 0;
    }

    if (emp.workerCategory.trim() === NonRegularEmployeeCategory) {
      /**
       * 非全日制员工，应税工资等于应发工资-个人所得税税基
       * 2017-11-14, 增加养老保险,失业保险和年金
       * 2018-Sep-19, 员工的年金及企业年金在税前扣除
       */

      let yingshuigongzi =
        parseFloat(emp.yingfagongzi) - // + parseFloat(emp.qiyeNianjin)
        parseFloat(emp.yanglaobaoxian) -
        parseFloat(emp.shiyebaoxian) -
        parseFloat(emp.nianjin) -
        gerensuodeshuishuiji -
        parseFloat(emp.personalIncomeTaxDeduction);

      yingshuigongzi = yingshuigongzi < 0 ? 0 : yingshuigongzi;
      emp.yingshuigongzi = keepTwoDecimalFull(yingshuigongzi);
      emp.yingshuigongziComments =
        "应发工资(" +
        emp.yingfagongzi +
        ")-个人年金(" +
        emp.nianjin +
        ")-养老保险(" +
        emp.yanglaobaoxian +
        ")-失业保险(" +
        emp.shiyebaoxian +
        ")-个人所得税专项抵扣(" +
        emp.personalIncomeTaxDeduction +
        ")-个人所得税税基(" +
        gerensuodeshuishuiji +
        ")=" +
        emp.yingshuigongzi;
    } else {
      /**
       * 全日制员工
       * 2018-Sep-19, 员工的年金及企业年金在税前扣除
       */
      let yingshuigongzi =
        parseFloat(emp.yingfagongzi) -
        parseFloat(emp.nianjin) -
        parseFloat(emp.yanglaobaoxian) -
        parseFloat(emp.shiyebaoxian) -
        parseFloat(emp.zhufanggongjijin) -
        parseFloat(emp.yiliaobaoxian) -
        parseFloat(emp.tongxunButie) -
        parseFloat(emp.personalIncomeTaxDeduction) -
        gerensuodeshuishuiji;
      yingshuigongzi = yingshuigongzi < 0 ? 0 : yingshuigongzi;
      emp.yingshuigongzi = keepTwoDecimalFull(yingshuigongzi);
      emp.yingshuigongziComments =
        "应发工资(" +
        emp.yingfagongzi +
        ")- 个人年金(" +
        emp.nianjin +
        ")-养老保险(" +
        emp.yanglaobaoxian +
        ")-失业保险(" +
        emp.shiyebaoxian +
        ")-医疗保险(" +
        emp.yiliaobaoxian +
        ")-住房公积金(" +
        emp.zhufanggongjijin +
        ")-通讯补贴(" +
        emp.tongxunButie +
        ")-个人所得税专项抵扣(" +
        emp.personalIncomeTaxDeduction +
        ")-个人所得税税基(" +
        gerensuodeshuishuiji +
        ")=" +
        emp.yingshuigongzi;
    }

    return emp;
  });

  return newemps;
};

SalaryCalculation.calculateGerensuodeshui = function(emps, configDoc) {
  let newemps = emps.map(function(emp) {
    let yingshuigongzi = parseFloat(emp.yingshuigongzi);
    let tax = 0;
    let taxComments = "";
    if (yingshuigongzi <= 3000) {
      tax = yingshuigongzi * 0.03;
      taxComments = "应税工资(" + emp.yingshuigongzi + ") * 3%=";
    } else if (yingshuigongzi <= 12000) {
      tax = yingshuigongzi * 0.1 - 210;
      taxComments = "应税工资(" + emp.yingshuigongzi + ") * 10%-210=";
    } else if (yingshuigongzi <= 25000) {
      tax = yingshuigongzi * 0.2 - 1410;
      taxComments = "应税工资(" + emp.yingshuigongzi + ") * 20%-1410=";
    } else if (yingshuigongzi <= 35000) {
      tax = yingshuigongzi * 0.25 - 2660;
      taxComments = "应税工资(" + emp.yingshuigongzi + ") * 25%-2660=";
    } else if (yingshuigongzi <= 55000) {
      tax = yingshuigongzi * 0.3 - 4410;
      taxComments = "应税工资(" + emp.yingshuigongzi + ") * 30%-4410=";
    } else if (yingshuigongzi <= 80000) {
      tax = yingshuigongzi * 0.35 - 7160;
      taxComments = "应税工资(" + emp.yingshuigongzi + ") * 35%-7160=";
    } else if (yingshuigongzi > 80000) {
      tax = yingshuigongzi * 0.45 - 15160;
      taxComments = "应税工资(" + emp.yingshuigongzi + ") * 45%-15160=";
    }

    emp.tax = "" + keepTwoDecimalFull(tax);
    emp.taxComments = taxComments + emp.tax;
    return emp;
  });

  return newemps;
};

SalaryCalculation.calculateYicixingjiangjinTax = function(emps, configDoc) {
  let ConfigPercentage = configDoc.ConfigPercentage;
  let gerensuodeshuishuiji = 5000;
  let haveShuiJi = false;

  for (let i = 0; i < ConfigPercentage.length; i++) {
    if (ConfigPercentage[i].text === GERENSUODESHUISHUIJI) {
      gerensuodeshuishuiji = parseInt(ConfigPercentage[i].value);
      haveShuiJi = true;
      break;
    }
  }

  if (!haveShuiJi) {
    logger.error("没有找到个人所得税税基数据,将会使用默认值5000来计算个税");
  }

  let newemps = emps.map(function(emp) {
    if (emp.workerCategory.trim() === NonRegularEmployeeCategory) {
      /**
       * 非全日制员工, 没有一次性奖金
       *  +parseFloat(emp.qiyeNianjin)
       */
    } else {
      let yicixingjiangjin = parseFloat(emp.yicixingjiangjin);

      if (yicixingjiangjin > 0) {
        let comments = "";
        let dangyueshouru =
          parseFloat(emp.yingfagongzi) -
          parseFloat(emp.yanglaobaoxian) -
          parseFloat(emp.shiyebaoxian) -
          parseFloat(emp.zhufanggongjijin) -
          parseFloat(emp.yiliaobaoxian) -
          parseFloat(emp.nianjin) -
          parseFloat(emp.tongxunButie);

        if (dangyueshouru < gerensuodeshuishuiji) {
          let newyicixingjiangjin = yicixingjiangjin - (gerensuodeshuishuiji - dangyueshouru);
          newyicixingjiangjin = newyicixingjiangjin > 0 ? newyicixingjiangjin : 0;

          comments =
            "当月收入(应发工资-养老保险-失业保险-住房公积金-医疗保险-通讯补贴-年金):" +
            dangyueshouru +
            "小于个人所得税税基(" +
            gerensuodeshuishuiji +
            "), 一次性奖金应税额更新为: " +
            yicixingjiangjin +
            "-(" +
            gerensuodeshuishuiji +
            "-" +
            dangyueshouru +
            ")=" +
            newyicixingjiangjin +
            "  ";
          yicixingjiangjin = newyicixingjiangjin;
        }

        let yingshuigongzi = parseFloat(yicixingjiangjin / 12);
        yingshuigongzi = yingshuigongzi < 0 ? 0 : yingshuigongzi;
        let tax = 0;
        let taxComments = "";
        if (yingshuigongzi <= 3000) {
          tax = yicixingjiangjin * 0.03;
          taxComments = comments + "一次性奖金(" + yicixingjiangjin + ") * 3%";
        } else if (yingshuigongzi <= 12000) {
          tax = yicixingjiangjin * 0.1 - 210;
          taxComments = comments + "一次性奖金(" + yicixingjiangjin + ") * 10%-210";
        } else if (yingshuigongzi <= 25000) {
          tax = yicixingjiangjin * 0.2 - 1410;
          taxComments = comments + "一次性奖金(" + yicixingjiangjin + ") * 20%-1410";
        } else if (yingshuigongzi <= 35000) {
          tax = yicixingjiangjin * 0.25 - 2660;
          taxComments = comments + "一次性奖金(" + yicixingjiangjin + ") * 25%-2660";
        } else if (yingshuigongzi <= 55000) {
          tax = yicixingjiangjin * 0.3 - 4410;
          taxComments = comments + "一次性奖金(" + yicixingjiangjin + ") * 30%-4410";
        } else if (yingshuigongzi <= 80000) {
          tax = yicixingjiangjin * 0.35 - 7160;
          taxComments = comments + "一次性奖金(" + yicixingjiangjin + ") * 35%-7160";
        } else if (yingshuigongzi > 80000) {
          tax = yicixingjiangjin * 0.45 - 15160;
          taxComments = comments + "一次性奖金(" + yicixingjiangjin + ") * 45%-15160";
        }

        emp.yicixingjiangjinTax = "" + keepTwoDecimalFull(tax);
        emp.yicixingjiangjinTaxComments = taxComments + "=" + emp.yicixingjiangjinTax;
      }
    }

    return emp;
  });
  return newemps;
};

SalaryCalculation.calculateNetIncome = function(emps) {
  for (let i = 0; i < emps.length; i++) {
    let emp = emps[i];
    if (emp.workerCategory.trim() === NonRegularEmployeeCategory) {
      /**
       * 非全日制员工
       */

      let netIncome =
        parseFloat(emp.yingfagongzi) -
        parseFloat(emp.nianjin) -
        parseFloat(emp.yanglaobaoxian) -
        parseFloat(emp.shiyebaoxian) -
        parseFloat(emp.tax);

      emps[i].netIncome = keepTwoDecimalFull(netIncome);
      emps[i].netIncomeComments =
        "应发工资(" +
        emp.yingfagongzi +
        ")-年金(" +
        emp.nianjin +
        ")-养老保险(" +
        emp.yanglaobaoxian +
        ")-失业保险(" +
        emp.shiyebaoxian +
        ")-个人所得税(" +
        emp.tax +
        ") = " +
        keepTwoDecimalFull(netIncome);
    } else {
      /**
       * 全日制员工
       */

      let netIncome =
        parseFloat(emp.yingfagongzi) -
        parseFloat(emp.nianjin) -
        parseFloat(emp.yanglaobaoxian) -
        parseFloat(emp.shiyebaoxian) -
        parseFloat(emp.zhufanggongjijin) -
        parseFloat(emp.yiliaobaoxian) -
        parseFloat(emp.tax) +
        parseFloat(emp.yicixingjiangjin) -
        parseFloat(emp.yicixingjiangjinTax);

      /**
       * 2017-11-14, 补充医疗保险不从员工工资中扣除
       */
      //- parseFloat(emp.buchongyiliaobaoxian);

      emps[i].netIncome = keepTwoDecimalFull(netIncome);
      emps[i].netIncomeComments =
        "应发工资(" +
        emp.yingfagongzi +
        ")-年金(" +
        emp.nianjin +
        ")-养老保险(" +
        emp.yanglaobaoxian +
        ")-失业保险(" +
        emp.shiyebaoxian +
        ")-住房公积金(" +
        emp.zhufanggongjijin +
        ")-医疗保险(" +
        emp.yiliaobaoxian +
        ")-个人所得税(" +
        emp.tax +
        ")+一次性奖金(" +
        emp.yicixingjiangjin +
        ")-一次性奖金税(" +
        emp.yicixingjiangjinTax +
        ") = " +
        keepTwoDecimalFull(netIncome);

      //+ ")-补充医疗保险(" + emp.buchongyiliaobaoxian
    }
  }
  return emps;
};

module.exports = SalaryCalculation;
