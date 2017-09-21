var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-SalaryCalculation');
logger.level = 'All';

const NIANJINXISHU = 'NIANJINXISHU';
const YANGLAOBAOXIANXISHU = 'YANGLAOBAOXIANXISHU';
const SHIYEBAOXIANXISHU = 'SHIYEBAOXIANXISHU';
const YILIAOBAOXIANXISHU = 'YILIAOBAOXIANXISHU';
const ZHUFANGGONGJIJINXISHU = 'ZHUFANGGONGJIJINXISHU';
const QIYENIANJINXISHU = 'QIYENIANJINXISHU';
const GERENSUODESHUISHUIJI = 'GERENSUODESHUISHUIJI';

var SalaryCalculation = {};

var SalaryDetailsModel = require('./Model/SalaryDetails');

SalaryCalculation.GenerateSalaryDetails = function (emps, salaryCycle) {
    let sds = [];
    emps.forEach(function (emp) {
        sds.push(SalaryDetailsModel(emp, salaryCycle));
    })
    return sds;
}
SalaryCalculation.fillGongZiXinXi = function (emps, senEmpData, categoryConfig) {
    // categoryConfig =JSON.parse(JSON.stringify(categoryConfig));
    let newemps = emps.map(function (emp) {
        let category = null;
        for (let i = 0; i < categoryConfig.length; i++) {
            if (emp.workerCategory.trim() === categoryConfig[i].WorkerCategory.trim()) {
                category = categoryConfig[i];
            }
        }
        if (category === null) {
            logger.error("没有找到所对应的工作类别配置项:  " + emp.workerCategory);
            logger.error("Error Location SalaryCalculation101")
            throw new Error("没有找到所对应的工作类别配置项:  " + emp.workerCategory);
            return;
        }

        let seEmp = null;
        for (let i = 0; i < senEmpData.length; i++) {
            if (emp.empId === senEmpData[i].empId) {
                seEmp = senEmpData[i];
            }
        }
        if (seEmp === null) {
            logger.error("没有找到所对应的员工工资数据:  " + emp.empId);
            logger.error("Error Location SalaryCalculation102")
            throw new Error("没有找到所对应的员工工资数据:  " + emp.empId);
            return;
        }
        for (let key in category) {
            if (category[key] === 'Y') {
                if (emp[key]) {
                    emp[key] = seEmp[key] ? seEmp[key] : '0';
                }
            } else {
                if (emp[key]) {
                    emp[key] = '0';
                }
            }
        }
        return emp;
    })
    return newemps;
}

SalaryCalculation.calculateJibengongzi = function (emps) {
    let newemps = [];
    for (let i = 0; i < emps.length; i++) {
        let emp = emps[i];
        emp.jibengongzi = (parseFloat(emp.jinengGongzi) + parseFloat(emp.gangweiGongzi) + parseFloat(emp.jichuButie) + parseFloat(emp.xilifei) + parseFloat(emp.gonglingGongzi)).toFixed(2) + '';
        emp.jibengongziComments = "技能工资(" + emp.jinengGongzi + ")+岗位工资(" + emp.gangweiGongzi + ")+基础补贴(" + emp.jichuButie + ")+洗理费(" + emp.xilifei + ")+工龄工资(" + emp.gonglingGongzi + ")=" + emp.jibengongzi;
        newemps.push(emp);
    }

    return newemps;

}


SalaryCalculation.categoryOT = function (emps, OTdata) {
    let newemps = emps.map(function (emp) {
        emp.NormalOTComments = '(技能工资+岗位工资）/21.75/8*150%*小时数';
        emp.WeekendOTComments = '(技能工资+岗位工资）/21.75/8*200%*小时数';
        emp.HolidayOTComments = '(技能工资+岗位工资）/21.75/8*300%*小时数';

        let empOT = null;
        let findOT = false
        for (let i = 0; i < OTdata.length && !findOT; i++) {
            if (emp.empId === OTdata[i].empId) {
                findOT = true;
                emp.NormalOT = ((parseFloat(emp.jinengGongzi) + parseFloat(emp.gangweiGongzi)) / 21.75 / 8 * 1.5 * parseFloat(OTdata[i].NormalOT)).toFixed(2) + '';
                emp.WeekendOT = ((parseFloat(emp.jinengGongzi) + parseFloat(emp.gangweiGongzi)) / 21.75 / 8 * 2 * parseFloat(OTdata[i].WeekendOT)).toFixed(2) + '';
                emp.HolidayOT = ((parseFloat(emp.jinengGongzi) + parseFloat(emp.gangweiGongzi)) / 21.75 / 8 * 3 * parseFloat(OTdata[i].HolidayOT)).toFixed(2) + '';
            }
        }
        return emp;

    })
    return newemps;
}

SalaryCalculation.calculateYingfagongzi = function (emps) {
    let newemps = emps.map(function (emp) {
        emp.yingfagongzi = (parseFloat(emp.jibengongzi) + parseFloat(emp.zhiwuJintie) + parseFloat(emp.gongliBuzhu) +
            parseFloat(emp.kaoheJiangjin) + parseFloat(emp.tongxunButie) + parseFloat(emp.qitaJiangjin) + parseFloat(emp.xiaxiangBuzhu) +
            parseFloat(emp.yingyetingBuzhu) + parseFloat(emp.NormalOT) + parseFloat(emp.WeekendOT) + parseFloat(emp.HolidayOT)
            - parseFloat(emp.kouchu) - parseFloat(emp.kaohekoukuan)).toFixed(2) + '';

        emp.yingfagongziComments = "基本工资+职务津贴+公里补助+考核奖金+通讯补贴+其他津贴+下乡补助+营业厅补助+平时加班+周末加班+节假日加班-扣除项-考核扣款=应发工资";
        return emp;
    });
    return newemps;
}

SalaryCalculation.calculateNianJinAndBaoXian = function (emps, configDoc) {
    let newemps = emps.map(function (emp) {
        let ConfigPercentage = configDoc.ConfigPercentage;
        let nianjinxishu = 0;
        let havenianjinxushu = false;
        let yanglaobaoxianxishu = 0;
        let haveyanglaobaoxianxishu = false;
        let shiyebaoxianxishu = 0;
        let haveshiyebaoxianxishu = false;
        let zhufanggongjijinxishu = 0;
        let havezhufanggongjijinxishu = false;
        let yiliaobaoxianxishu = 0;
        let haveyiliaobaoxianxishu = false;
        let qiyenianjinxishu = 0;
        let haveqiyenianjinxishu = false;


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
                case QIYENIANJINXISHU:
                    qiyenianjinxishu = parseFloat(ConfigPercentage[i].value);
                    haveqiyenianjinxishu = true;
            }
        }
        if (!havenianjinxushu || !haveyanglaobaoxianxishu || !haveyiliaobaoxianxishu || !haveshiyebaoxianxishu || !havezhufanggongjijinxishu || !haveqiyenianjinxishu) {
            logger.error("没有找到相对的系数配置，请核查配置信息");
            logger.error("Error Location SalaryCalculation302")
            throw new Error("没有找到相对的系数配置，请核查配置信息");
            return;
        }

        let preAnnuallyIncom = parseFloat(emp.preAnnuallyIncom);
        emp.nianjin = (preAnnuallyIncom * nianjinxishu).toFixed(2) + '';
        emp.qiyeNianjin = (preAnnuallyIncom * qiyenianjinxishu).toFixed(2) + '';
        emp.yanglaobaoxian = (preAnnuallyIncom * yanglaobaoxianxishu).toFixed(2) + '';
        emp.shiyebaoxian = (preAnnuallyIncom * shiyebaoxianxishu).toFixed(2) + '';
        emp.zhufanggongjijin = (preAnnuallyIncom * zhufanggongjijinxishu).toFixed(2) + '';
        emp.yiliaobaoxian = (preAnnuallyIncom * yiliaobaoxianxishu).toFixed(2) + '';

        emp.nianjinComments = '上一年度总收入(' + preAnnuallyIncom + ')*年金系数(' + nianjinxishu + ')=' + emp.nianjin;
        emp.qiyeNianJinComments = '上一年度总收入(' + preAnnuallyIncom + ')*企业年金系数(' + qiyenianjinxishu + ')=' + emp.qiyeNianjin;
        emp.yanglaobaoxianComments = '上一年度总收入(' + preAnnuallyIncom + ')*养老保险系数(' + yanglaobaoxianxishu + ')=' + emp.yanglaobaoxian;
        emp.shiyebaoxianComments = '上一年度总收入(' + preAnnuallyIncom + ')*失业保险系数(' + shiyebaoxianxishu + ')=' + emp.shiyebaoxian;
        emp.zhufanggongjijinComments = '上一年度总收入(' + preAnnuallyIncom + ')*住房公积金系数(' + zhufanggongjijinxishu + ')=' + emp.zhufanggongjijin;
        emp.yiliaobaoxianComments = '上一年度总收入(' + preAnnuallyIncom + ')*医疗保险系数(' + yiliaobaoxianxishu + ')=' + emp.yiliaobaoxian;
        return emp;
    });

    return newemps;
}

SalaryCalculation.calculateYingshuigongzi = function (emps, configDoc) {
    let ConfigPercentage = configDoc.ConfigPercentage;
    let gerensuodeshuishuiji = 0;
    let haveShuiJi = false;
    for (let i = 0; i < ConfigPercentage.length && !haveShuiJi; i++) {
        if (ConfigPercentage[i].text === GERENSUODESHUISHUIJI) {
            gerensuodeshuishuiji = parseInt(ConfigPercentage[i].value);
            haveShuiJi = true;
        }
    }

    if (!haveShuiJi) {
        logger.error("没有找到个人所得税税基数据");
        logger.error("Error Location SalaryCalculation401")
        throw new Error("没有找到个人所得税税基数据");
        return;
    }

    let newemps = emps.map(function (emp) {
        let yingshuigongzi = parseFloat(emp.yingfagongzi) - parseFloat(emp.nianjin) + parseFloat(emp.qiyeNianjin) - parseFloat(emp.yanglaobaoxian)
            - parseFloat(emp.shiyebaoxian) - parseFloat(emp.zhufanggongjijin) - parseFloat(emp.yiliaobaoxian) - parseFloat(emp.tongxunButie) - gerensuodeshuishuiji;
        yingshuigongzi = yingshuigongzi < 0 ? 0 : yingshuigongzi;
        emp.yingshuigongzi = yingshuigongzi.toFixed(2) + '';
        emp.yingshuigongziComments = "应发工资-年金+企业年金-养老保险-失业保险-医疗保险-住房公积金-通讯补贴-个人所得税税基(" + gerensuodeshuishuiji + ")";
        return emp;
    })

    return newemps;
}

SalaryCalculation.calculateGerensuodeshui = function (emps, configDoc) {
    // let ConfigPercentage = configDoc.ConfigPercentage;
    // let gerensuodeshuishuiji = 0;
    // let haveShuiJi = false;
    // for (let i = 0; i < ConfigPercentage.length && !haveShuiJi; i++) {
    //     if (ConfigPercentage[i].text === GERENSUODESHUISHUIJI) {
    //         gerensuodeshuishuiji = parseInt(ConfigPercentage[i].value);
    //         haveShuiJi = true;
    //     }
    // }

    // if (!haveShuiJi) {
    //     logger.error("没有找到个人所得税税基数据");
    //     logger.error("Error Location SalaryDetails201")
    //     throw new Error("没有找到个人所得税税基数据");
    //     return;
    // }

    let newemps = emps.map(function (emp) {

        let yingshuigongzi = parseFloat(emp.yingshuigongzi);
        let tax = 0;
        let taxComments = '';
        if (yingshuigongzi <= 1500) {
            tax = yingshuigongzi * 0.03;
            taxComments = "应税工资 * 3%";
        } else if (yingshuigongzi < 4500) {
            tax = yingshuigongzi * 0.1 - 105;
            taxComments = "应税工资 * 10%-105";
        } else if (yingshuigongzi < 9000) {
            tax = yingshuigongzi * 0.2 - 555;
            taxComments = "应税工资 * 20%-555";
        } else if (yingshuigongzi < 35000) {
            tax = yingshuigongzi * 0.25 - 1005;
            taxComments = "应税工资 * 25%-1005";
        } else if (yingshuigongzi < 55000) {
            tax = yingshuigongzi * 0.3 - 2755;
            taxComments = "应税工资 * 30%-2755";
        } else if (yingshuigongzi < 80000) {
            tax = yingshuigongzi * 0.35 - 5505;
            taxComments = "应税工资 * 35%-5505";
        } else if (yingshuigongzi > 80000) {
            tax = yingshuigongzi * 0.45 - 13505;
            taxComments = "应税工资 * 45%-13505";
        }

        emp.tax = '' + tax.toFixed(2);
        emp.taxComments = taxComments;
        return emp;
    })

    return newemps;

}

SalaryCalculation.calculateYicixingjiangjinTax = function (emps, configDoc) {

    let ConfigPercentage = configDoc.ConfigPercentage;
    let gerensuodeshuishuiji = 0;
    let haveShuiJi = false;
    for (let i = 0; i < ConfigPercentage.length && !haveShuiJi; i++) {
        if (ConfigPercentage[i].text === GERENSUODESHUISHUIJI) {
            gerensuodeshuishuiji = parseInt(ConfigPercentage[i].value);
            haveShuiJi = true;
        }
    }

    if (!haveShuiJi) {
        logger.error("没有找到个人所得税税基数据");
        logger.error("Error Location SalaryCalculation501")
        throw new Error("没有找到个人所得税税基数据");
        return;
    }

    let newemps = emps.map(function (emp) {
        let yicixingjiangjin = parseFloat(emp.yicixingjiangjin);
        if (yicixingjiangjin > 0) {
            let comments = '';
            let dangyueshouru = parseFloat(emp.yingfagongzi) + parseFloat(emp.nianjin) + parseFloat(emp.qiyeNianjin) + parseFloat(emp.yanglaobaoxian)
                + parseFloat(emp.shiyebaoxian) + parseFloat(emp.zhufanggongjijin) + parseFloat(emp.yiliaobaoxian) - parseFloat(emp.tongxunButie);
            if (dangyueshouru < gerensuodeshuishuiji) {
                let newyicixingjiangjin = yicixingjiangjin - (gerensuodeshuishuiji - dangyueshouru);
                newyicixingjiangjin = newyicixingjiangjin > 0 ? newyicixingjiangjin : 0;

                comments = "当月收入:" + dangyueshouru + "小于个人所得税税基, 一次性奖金应税额更新为: " + yicixingjiangjin + "-(" + gerensuodeshuishuiji + "-" + dangyueshouru + ")=" + newyicixingjiangjin + "  ";
                yicixingjiangjin = newyicixingjiangjin;
            }

            let yingshuigongzi = parseFloat(yicixingjiangjin / 12) - gerensuodeshuishuiji;
            yingshuigongzi = yingshuigongzi < 0 ? 0 : yingshuigongzi;
            let tax = 0;
            let taxComments = '';
            if (yingshuigongzi <= 1500) {
                tax = yingshuigongzi * 0.03;
                taxComments = comments + "一次性奖金(" + yicixingjiangjin + ")/12-个人所得税税基(" + gerensuodeshuishuiji + ") * 3%";
            } else if (yingshuigongzi < 4500) {
                tax = yingshuigongzi * 0.1 - 105;
                taxComments = comments + "一次性奖金(" + yicixingjiangjin + ")/12-个人所得税税基(" + gerensuodeshuishuiji + ") * 10%-105";
            } else if (yingshuigongzi < 9000) {
                tax = yingshuigongzi * 0.2 - 555;
                taxComments = comments + "一次性奖金(" + yicixingjiangjin + ")/12-个人所得税税基(" + gerensuodeshuishuiji + ") * 20%-555";
            } else if (yingshuigongzi < 35000) {
                tax = yingshuigongzi * 0.25 - 1005;
                taxComments = comments + "一次性奖金(" + yicixingjiangjin + ")/12-个人所得税税基(" + gerensuodeshuishuiji + ") * 25%-1005";
            } else if (yingshuigongzi < 55000) {
                tax = yingshuigongzi * 0.3 - 2755;
                taxComments = comments + "一次性奖金(" + yicixingjiangjin + ")/12-个人所得税税基(" + gerensuodeshuishuiji + ") * 30%-2755";
            } else if (yingshuigongzi < 80000) {
                tax = yingshuigongzi * 0.35 - 5505;
                taxComments = comments + "一次性奖金(" + yicixingjiangjin + ")/12-个人所得税税基(" + gerensuodeshuishuiji + ") * 35%-5505";
            } else if (yingshuigongzi > 80000) {
                tax = yingshuigongzi * 0.45 - 13505;
                taxComments = comments + "一次性奖金(" + yicixingjiangjin + ")/12-个人所得税税基(" + gerensuodeshuishuiji + ") * 45%-13505";
            }

            emp.yicixingjiangjinTax = '' + tax.toFixed(2);
            emp.yicixingjiangjinTaxComments = taxComments;

        }
        return emp;
    })
    return newemps;
}

SalaryCalculation.calculateNetIncome = function (emps) {
    for (let i = 0; i < emps.length; i++) {
        let emp = emps[i];
        let netIncome = parseFloat(emp.yingfagongzi) - parseFloat(emp.nianjin) - parseFloat(emp.yanglaobaoxian)
            - parseFloat(emp.shiyebaoxian) - parseFloat(emp.zhufanggongjijin) - parseFloat(emp.yiliaobaoxian)
            - parseFloat(emp.tax) + parseFloat(emp.yicixingjiangjin) - parseFloat(emp.yicixingjiangjinTax) - parseFloat(emp.buchongyiliaobaoxian);

        emps[i].netIncome = netIncome.toFixed(2) + '';
        emps[i].netIncomeComments = "应发工资(" + emp.yingfagongzi + ")-年金(" + emp.nianjin + ")-养老保险(" + emp.yanglaobaoxian
            + ")-失业保险(" + emp.shiyebaoxian + ")-住房公积金(" + emp.zhufanggongjijin + ")-医疗保险(" + emp.yiliaobaoxian
            + ")-个人所得税(" + emp.tax + ")+一次性奖金(" + emp.yicixingjiangjin + ")-一次性奖金税("
            + emp.yicixingjiangjinTax + ")-补充医疗保险(" + emp.buchongyiliaobaoxian + ") = " + netIncome.toFixed(2);
    }
    return emps;
}

module.exports = SalaryCalculation;