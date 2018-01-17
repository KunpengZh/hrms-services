var Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('SalaryCalculation', {
        empId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        department: {
            type: Sequelize.STRING,
        },
        jobRole: {
            type: Sequelize.STRING,
        },
        workerCategory: {
            type: Sequelize.STRING,
        },
        gender: {
            type: Sequelize.STRING,
        },
        idCard: {
            type: Sequelize.STRING,
        },
        bankAccount: {
            type: Sequelize.STRING,
        },
        birthday: {
            type: Sequelize.STRING,
        },
        workAge: {
            type: Sequelize.STRING,
        },
        comment: {
            type: Sequelize.STRING,
        },
        salaryCycle: {
            type: Sequelize.STRING,
        },
        jinengGongzi: {
            type: Sequelize.STRING,
        },
        gangweiGongzi: {
            type: Sequelize.STRING,
        },
        jichuButie: {
            type: Sequelize.STRING,
        },
        xilifei: {
            type: Sequelize.STRING,
        },
        gonglingGongzi: {
            type: Sequelize.STRING,
        },
        jibengongzi: {
            type: Sequelize.STRING,
        },
        jibengongziComments: {
            type: Sequelize.STRING,
        },
        zhiwuJintie: {
            type: Sequelize.STRING,
        },
        gongliBuzhu: {
            type: Sequelize.STRING,
        },
        kaoheJiangjin: {
            type: Sequelize.STRING,
        },
        gudingJiangjin: {
            type: Sequelize.STRING,
        },
        tongxunButie: {
            type: Sequelize.STRING,
        },
        qitaJiangjin: {
            type: Sequelize.STRING,
        },
        xiaxiangBuzhu: {
            type: Sequelize.STRING,
        },
        yingyetingBuzhu: {
            type: Sequelize.STRING,
        },
        NormalOT: {
            type: Sequelize.STRING,
        },
        NormalOTComments: {
            type: Sequelize.TEXT,
        },
        WeekendOT: {
            type: Sequelize.STRING,
        },
        WeekendOTComments: {
            type: Sequelize.TEXT,
        },
        HolidayOT: {
            type: Sequelize.STRING,
        },
        HolidayOTComments: {
            type: Sequelize.TEXT,
        },
        kouchu: {
            type: Sequelize.STRING,
        },
        kaohekoukuan: {
            type: Sequelize.STRING,
        },
        yingfagongzi: {
            type: Sequelize.STRING,
        },
        yingfagongziComments: {
            type: Sequelize.STRING,
        },
        preAnnuallyIncom: {
            type: Sequelize.STRING,
        },
        nianjin: {
            type: Sequelize.STRING,
        },
        nianjinComments: {
            type: Sequelize.TEXT,
        },
        qiyeNianjin: {
            type: Sequelize.STRING,
        },
        qiyeNianJinComments: {
            type: Sequelize.TEXT,
        },
        yanglaobaoxian: {
            type: Sequelize.STRING,
        },
        yanglaobaoxianComments: {
            type: Sequelize.TEXT,
        },
        qiyeYanglaobaoxian: {
            type: Sequelize.STRING,
        },
        qiyeYanglaobaoxianComments: {
            type: Sequelize.TEXT,
        },
        shiyebaoxian: {
            type: Sequelize.STRING,
        },
        shiyebaoxianComments: {
            type: Sequelize.TEXT,
        },
        qiyeShiyebaoxian: {
            type: Sequelize.STRING,
        },
        qiyeShiyebaoxianComments: {
            type: Sequelize.TEXT,
        },
        zhufanggongjijin: {
            type: Sequelize.STRING,
        },
        zhufanggongjijinComments: {
            type: Sequelize.TEXT,
        },
        qiyeZhufanggongjijin: {
            type: Sequelize.STRING,
        },
        qiyeZhufanggongjijinComments: {
            type: Sequelize.TEXT,
        },
        yiliaobaoxian: {
            type: Sequelize.STRING,
        },
        yiliaobaoxianComments: {
            type: Sequelize.TEXT,
        },
        qiyeYiliaobaoxian: {
            type: Sequelize.STRING,
        },
        qiyeYiliaobaoxianComments: {
            type: Sequelize.TEXT,
        },
        yingshuigongzi: {
            type: Sequelize.STRING,
        },
        yingshuigongziComments: {
            type: Sequelize.STRING,
        },
        tax: {
            type: Sequelize.STRING,
        },
        taxComments: {
            type: Sequelize.TEXT,
        },
        yicixingjiangjin: {
            type: Sequelize.STRING,
        },
        yicixingjiangjinTax: {
            type: Sequelize.STRING,
        },
        yicixingjiangjinTaxComments: {
            type: Sequelize.TEXT,
        },
        buchongyiliaobaoxian: {
            type: Sequelize.STRING,
        },
        netIncome: {
            type: Sequelize.STRING,
        },
        netIncomeComments: {
            type: Sequelize.STRING,
        },
        daySalary: {
            type: Sequelize.STRING,
        },
        workDays: {
            type: Sequelize.STRING,
        },
        anquanJiangli: {
            type: Sequelize.STRING,
        },
        wuweizhangJiangli: {
            type: Sequelize.STRING,
        },
        OTJiangjin: {
            type: Sequelize.STRING,
        },
        shengyubaoxian: {
            type: Sequelize.STRING,
        },
        gongshangbaoxian: {
            type: Sequelize.STRING,
        }
    })
}
