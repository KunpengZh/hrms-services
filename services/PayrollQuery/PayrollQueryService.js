var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-PayrollQuery-Services');
logger.level = 'All';

let regularEmpModel = require('./Model/RegularEmpModel');
let nonRegularEmpModel = require('./Model/NonRegularEmpMode');

var sequelize = require('../mysql/hrmsdb');
var CoryptoEnpSen = require('../empInfoServices/CryptoEnpSen');
const NonRegularEmployeeCategory = "非全日制人员";
var PayrollQueryService = {};
function keepTwoDecimalFull(num) {
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

PayrollQueryService.getDataByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {
        getPayrollData(criteria).then(gzds => {
            rel(gzds);
        }).catch(err => {
            logger.error("Error Location PayrollQueryService001");
            logger.error(err);
            throw err;
        })
    })
}

var getPayrollData = function (criteria) {
    return new Promise(function (rel, rej) {
        let salarylist = [];
        let empsalarys = [];
        
        let startGenerationData = function () {
            let jinengGongzi = 0,
                gangweiGongzi = 0,
                jichuButie = 0,
                xilifei = 0,
                gonglingGongzi = 0,
                jibengongzi = 0,
                zhiwuJintie = 0,
                gongliBuzhu = 0,
                kaoheJiangjin = 0,
                gudingJiangjin = 0,
                tongxunButie = 0,
                qitaJiangjin = 0,
                xiaxiangBuzhu = 0,
                yingyetingBuzhu = 0,
                NormalOT = 0,
                WeekendOT = 0,
                HolidayOT = 0,
                kouchu = 0,
                kaohekoukuan = 0,
                yingfagongzi = 0,
                nianjin = 0,
                qiyeNianjin = 0,
                yanglaobaoxian = 0,
                qiyeYanglaobaoxian = 0,
                shiyebaoxian = 0,
                qiyeShiyebaoxian = 0,
                zhufanggongjijin = 0,
                qiyeZhufanggongjijin = 0,
                yiliaobaoxian = 0,
                qiyeYiliaobaoxian = 0,
                yingshuigongzi = 0,
                tax = 0,
                yicixingjiangjin = 0,
                yicixingjiangjinTax = 0,
                buchongyiliaobaoxian = 0,
                netIncome = 0,
                daySalary = 0,
                workDays = 0,
                anquanJiangli = 0,
                wuweizhangJiangli = 0,
                OTJiangjin = 0;

            for (let i = 0; i < empsalarys.length; i++) {
                let empsalary = empsalarys[i];
                if (empsalary.workerCategory === NonRegularEmployeeCategory) {
                    let newgongzidan = nonRegularEmpModel(empsalary);
                    jibengongzi += newgongzidan.jibengongzi;
                    yingfagongzi += newgongzidan.yingfagongzi;
                    nianjin += newgongzidan.nianjin;
                    qiyeNianjin += newgongzidan.qiyeNianjin;
                    yanglaobaoxian += newgongzidan.yanglaobaoxian;
                    qiyeYanglaobaoxian += newgongzidan.qiyeYanglaobaoxian;
                    shiyebaoxian += newgongzidan.shiyebaoxian;
                    qiyeShiyebaoxian += newgongzidan.qiyeShiyebaoxian;
                    yingshuigongzi += newgongzidan.yingshuigongzi;
                    tax += newgongzidan.tax;
                    netIncome += newgongzidan.netIncome;
                    daySalary += newgongzidan.daySalary;
                    workDays += newgongzidan.workDays;
                    anquanJiangli += newgongzidan.anquanJiangli;
                    wuweizhangJiangli += newgongzidan.wuweizhangJiangli;
                    OTJiangjin += newgongzidan.OTJiangjin;

                    let isempexist = false;
                    for (let k = 0; k < salarylist.length; k++) {
                        
                        if (salarylist[k].empId === empsalary.empId) {
                            salarylist[k].jibengongzi += newgongzidan.jibengongzi;
                            salarylist[k].yingfagongzi += newgongzidan.yingfagongzi;
                            salarylist[k].nianjin += newgongzidan.nianjin;
                            salarylist[k].qiyeNianjin += newgongzidan.qiyeNianjin;
                            salarylist[k].yanglaobaoxian += newgongzidan.yanglaobaoxian;
                            salarylist[k].qiyeYanglaobaoxian += newgongzidan.qiyeYanglaobaoxian;
                            salarylist[k].shiyebaoxian += newgongzidan.shiyebaoxian;
                            salarylist[k].qiyeShiyebaoxian += newgongzidan.qiyeShiyebaoxian;
                            salarylist[k].yingshuigongzi += newgongzidan.yingshuigongzi;
                            salarylist[k].tax += newgongzidan.tax;
                            salarylist[k].netIncome += newgongzidan.netIncome;
                            salarylist[k].daySalary += newgongzidan.daySalary;
                            salarylist[k].workDays += newgongzidan.workDays;
                            salarylist[k].anquanJiangli += newgongzidan.anquanJiangli;
                            salarylist[k].wuweizhangJiangli += newgongzidan.wuweizhangJiangli;
                            salarylist[k].OTJiangjin += newgongzidan.OTJiangjin;
                            isempexist=true;
                            break;
                        }
                    }
                    if (!isempexist) {
                        salarylist.push(newgongzidan);
                    }

                } else {
                    let newgongzidan = regularEmpModel(empsalary);
                    jinengGongzi += newgongzidan.jinengGongzi;
                    gangweiGongzi += newgongzidan.gangweiGongzi;
                    jichuButie += newgongzidan.jichuButie;
                    xilifei += newgongzidan.xilifei;
                    gonglingGongzi += newgongzidan.gonglingGongzi;
                    jibengongzi += newgongzidan.jibengongzi;
                    zhiwuJintie += newgongzidan.zhiwuJintie;
                    gongliBuzhu += newgongzidan.gongliBuzhu;
                    kaoheJiangjin += newgongzidan.kaoheJiangjin;
                    gudingJiangjin += newgongzidan.gudingJiangjin;
                    tongxunButie += newgongzidan.tongxunButie;
                    qitaJiangjin += newgongzidan.qitaJiangjin;
                    xiaxiangBuzhu += newgongzidan.xiaxiangBuzhu;
                    yingyetingBuzhu += newgongzidan.yingyetingBuzhu;
                    NormalOT += newgongzidan.NormalOT;
                    WeekendOT += newgongzidan.WeekendOT;
                    HolidayOT += newgongzidan.HolidayOT;
                    kouchu += newgongzidan.kouchu;
                    kaohekoukuan += newgongzidan.kaohekoukuan;
                    yingfagongzi += newgongzidan.yingfagongzi;
                    nianjin += newgongzidan.nianjin;
                    qiyeNianjin += newgongzidan.qiyeNianjin;
                    yanglaobaoxian += newgongzidan.yanglaobaoxian;
                    qiyeYanglaobaoxian += newgongzidan.qiyeYanglaobaoxian;
                    shiyebaoxian += newgongzidan.shiyebaoxian;
                    qiyeShiyebaoxian += newgongzidan.qiyeShiyebaoxian;
                    zhufanggongjijin += newgongzidan.zhufanggongjijin;
                    qiyeZhufanggongjijin += newgongzidan.qiyeZhufanggongjijin;
                    yiliaobaoxian += newgongzidan.yiliaobaoxian;
                    qiyeYiliaobaoxian += newgongzidan.qiyeYiliaobaoxian;
                    yingshuigongzi += newgongzidan.yingshuigongzi;
                    tax += newgongzidan.tax;
                    yicixingjiangjin += newgongzidan.yicixingjiangjin;
                    yicixingjiangjinTax += newgongzidan.yicixingjiangjinTax;
                    buchongyiliaobaoxian += newgongzidan.buchongyiliaobaoxian;
                    netIncome += newgongzidan.netIncome;


                    let isempexist = false;
                    for (let k = 0; k < salarylist.length; k++) {
                        if (salarylist[k].empId === empsalary.empId) {
                            salarylist[k].jinengGongzi += newgongzidan.jinengGongzi;
                            salarylist[k].gangweiGongzi += newgongzidan.gangweiGongzi;
                            salarylist[k].jichuButie += newgongzidan.jichuButie;
                            salarylist[k].xilifei += newgongzidan.xilifei;
                            salarylist[k].gonglingGongzi += newgongzidan.gonglingGongzi;
                            salarylist[k].jibengongzi += newgongzidan.jibengongzi;
                            salarylist[k].zhiwuJintie += newgongzidan.zhiwuJintie;
                            salarylist[k].gongliBuzhu += newgongzidan.gongliBuzhu;
                            salarylist[k].kaoheJiangjin += newgongzidan.kaoheJiangjin;
                            salarylist[k].gudingJiangjin += newgongzidan.gudingJiangjin;
                            salarylist[k].tongxunButie += newgongzidan.tongxunButie;
                            salarylist[k].qitaJiangjin += newgongzidan.qitaJiangjin;
                            salarylist[k].xiaxiangBuzhu += newgongzidan.xiaxiangBuzhu;
                            salarylist[k].yingyetingBuzhu += newgongzidan.yingyetingBuzhu;
                            salarylist[k].NormalOT += newgongzidan.NormalOT;
                            salarylist[k].WeekendOT += newgongzidan.WeekendOT;
                            salarylist[k].HolidayOT += newgongzidan.HolidayOT;
                            salarylist[k].kouchu += newgongzidan.kouchu;
                            salarylist[k].kaohekoukuan += newgongzidan.kaohekoukuan;
                            salarylist[k].yingfagongzi += newgongzidan.yingfagongzi;
                            salarylist[k].nianjin += newgongzidan.nianjin;
                            salarylist[k].qiyeNianjin += newgongzidan.qiyeNianjin;
                            salarylist[k].yanglaobaoxian += newgongzidan.yanglaobaoxian;
                            salarylist[k].qiyeYanglaobaoxian += newgongzidan.qiyeYanglaobaoxian;
                            salarylist[k].shiyebaoxian += newgongzidan.shiyebaoxian;
                            salarylist[k].qiyeShiyebaoxian += newgongzidan.qiyeShiyebaoxian;
                            salarylist[k].zhufanggongjijin += newgongzidan.zhufanggongjijin;
                            salarylist[k].qiyeZhufanggongjijin += newgongzidan.qiyeZhufanggongjijin;
                            salarylist[k].yiliaobaoxian += newgongzidan.yiliaobaoxian;
                            salarylist[k].qiyeYiliaobaoxian += newgongzidan.qiyeYiliaobaoxian;
                            salarylist[k].yingshuigongzi += newgongzidan.yingshuigongzi;
                            salarylist[k].tax += newgongzidan.tax;
                            salarylist[k].yicixingjiangjin += newgongzidan.yicixingjiangjin;
                            salarylist[k].yicixingjiangjinTax += newgongzidan.yicixingjiangjinTax;
                            salarylist[k].buchongyiliaobaoxian += newgongzidan.buchongyiliaobaoxian;
                            salarylist[k].netIncome += newgongzidan.netIncome;
                            isempexist=true;
                            break;
                        }
                    }
                    if (!isempexist) {
                        salarylist.push(newgongzidan);
                    }

                }
            }


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
                jinengGongzi: keepTwoDecimalFull(jinengGongzi),
                gangweiGongzi: keepTwoDecimalFull(gangweiGongzi),
                jichuButie: keepTwoDecimalFull(jichuButie),
                xilifei: keepTwoDecimalFull(xilifei),
                gonglingGongzi: keepTwoDecimalFull(gonglingGongzi),
                jibengongzi: keepTwoDecimalFull(jibengongzi),
                zhiwuJintie: keepTwoDecimalFull(zhiwuJintie),
                gongliBuzhu: keepTwoDecimalFull(gongliBuzhu),
                kaoheJiangjin: keepTwoDecimalFull(kaoheJiangjin),
                gudingJiangjin: keepTwoDecimalFull(gudingJiangjin),
                tongxunButie: keepTwoDecimalFull(tongxunButie),
                qitaJiangjin: keepTwoDecimalFull(qitaJiangjin),
                xiaxiangBuzhu: keepTwoDecimalFull(xiaxiangBuzhu),
                yingyetingBuzhu: keepTwoDecimalFull(yingyetingBuzhu),
                NormalOT: keepTwoDecimalFull(NormalOT),
                WeekendOT: keepTwoDecimalFull(WeekendOT),
                HolidayOT: keepTwoDecimalFull(HolidayOT),
                kouchu: keepTwoDecimalFull(kouchu),
                kaohekoukuan: keepTwoDecimalFull(kaohekoukuan),
                yingfagongzi: keepTwoDecimalFull(yingfagongzi),
                nianjin: keepTwoDecimalFull(nianjin),
                qiyeNianjin: keepTwoDecimalFull(qiyeNianjin),
                yanglaobaoxian: keepTwoDecimalFull(yanglaobaoxian),
                qiyeYanglaobaoxian: keepTwoDecimalFull(qiyeYanglaobaoxian),
                shiyebaoxian: keepTwoDecimalFull(shiyebaoxian),
                qiyeShiyebaoxian: keepTwoDecimalFull(qiyeShiyebaoxian),
                zhufanggongjijin: keepTwoDecimalFull(zhufanggongjijin),
                qiyeZhufanggongjijin: keepTwoDecimalFull(qiyeZhufanggongjijin),
                yiliaobaoxian: keepTwoDecimalFull(yiliaobaoxian),
                qiyeYiliaobaoxian: keepTwoDecimalFull(qiyeYiliaobaoxian),
                yingshuigongzi: keepTwoDecimalFull(yingshuigongzi),
                tax: keepTwoDecimalFull(tax),
                yicixingjiangjin: keepTwoDecimalFull(yicixingjiangjin),
                yicixingjiangjinTax: keepTwoDecimalFull(yicixingjiangjinTax),
                buchongyiliaobaoxian: keepTwoDecimalFull(buchongyiliaobaoxian),
                netIncome: keepTwoDecimalFull(netIncome),
                daySalary: keepTwoDecimalFull(daySalary),
                workDays: keepTwoDecimalFull(workDays),
                anquanJiangli: keepTwoDecimalFull(anquanJiangli),
                wuweizhangJiangli: keepTwoDecimalFull(wuweizhangJiangli),
                OTJiangjin: keepTwoDecimalFull(OTJiangjin)
            }

            salarylist.push(newEmpSA);


            rel(salarylist);
        }


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




module.exports = PayrollQueryService;