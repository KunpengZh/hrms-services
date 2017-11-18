var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-PayrollQuery-Services');
logger.level = 'All';

let regularEmpModel = require('./Model/RegularEmpModel');
let nonRegularEmpModel = require('./Model/NonRegularEmpMode');

var sequelize = require('../mysql/hrmsdb');
var CoryptoEnpSen = require('../empInfoServices/CryptoEnpSen');
const NonRegularEmployeeCategory = "非全日制人员";
var PayrollQueryService = {};


PayrollQueryService.getDataByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {
        getGongZiDanData(criteria).then(gzds => {
            rel(gzds);
        }).catch(err => {
            logger.error("Error Location PayrollQueryService001");
            logger.error(err);
            throw err;
        })
    })
}

getGongZiDanData = function (criteria) {
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

                    salarylist.push(newgongzidan);
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

                    salarylist.push(newgongzidan);

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
                jinengGongzi: jinengGongzi.toFixed(2) + '',
                gangweiGongzi: gangweiGongzi.toFixed(2) + '',
                jichuButie: jichuButie.toFixed(2) + '',
                xilifei: xilifei.toFixed(2) + '',
                gonglingGongzi: gonglingGongzi.toFixed(2) + '',
                jibengongzi: jibengongzi.toFixed(2) + '',
                zhiwuJintie: zhiwuJintie.toFixed(2) + '',
                gongliBuzhu: gongliBuzhu.toFixed(2) + '',
                kaoheJiangjin: kaoheJiangjin.toFixed(2) + '',
                gudingJiangjin: gudingJiangjin.toFixed(2) + '',
                tongxunButie: tongxunButie.toFixed(2) + '',
                qitaJiangjin: qitaJiangjin.toFixed(2) + '',
                xiaxiangBuzhu: xiaxiangBuzhu.toFixed(2) + '',
                yingyetingBuzhu: yingyetingBuzhu.toFixed(2) + '',
                NormalOT: NormalOT.toFixed(2) + '',
                WeekendOT: WeekendOT.toFixed(2) + '',
                HolidayOT: HolidayOT.toFixed(2) + '',
                kouchu: kouchu.toFixed(2) + '',
                kaohekoukuan: kaohekoukuan.toFixed(2) + '',
                yingfagongzi: yingfagongzi.toFixed(2) + '',
                nianjin: nianjin.toFixed(2) + '',
                qiyeNianjin: qiyeNianjin.toFixed(2) + '',
                yanglaobaoxian: yanglaobaoxian.toFixed(2) + '',
                qiyeYanglaobaoxian: qiyeYanglaobaoxian.toFixed(2) + '',
                shiyebaoxian: shiyebaoxian.toFixed(2) + '',
                qiyeShiyebaoxian: qiyeShiyebaoxian.toFixed(2) + '',
                zhufanggongjijin: zhufanggongjijin.toFixed(2) + '',
                qiyeZhufanggongjijin: qiyeZhufanggongjijin.toFixed(2) + '',
                yiliaobaoxian: yiliaobaoxian.toFixed(2) + '',
                qiyeYiliaobaoxian: qiyeYiliaobaoxian.toFixed(2) + '',
                yingshuigongzi: yingshuigongzi.toFixed(2) + '',
                tax: tax.toFixed(2) + '',
                yicixingjiangjin: yicixingjiangjin.toFixed(2) + '',
                yicixingjiangjinTax: yicixingjiangjinTax.toFixed(2) + '',
                buchongyiliaobaoxian: buchongyiliaobaoxian.toFixed(2) + '',
                netIncome: netIncome.toFixed(2) + '',
                daySalary: daySalary.toFixed(2) + '',
                workDays: workDays.toFixed(2) + '',
                anquanJiangli: anquanJiangli.toFixed(2) + '',
                wuweizhangJiangli: wuweizhangJiangli.toFixed(2) + '',
                OTJiangjin: OTJiangjin.toFixed(2) + '',
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