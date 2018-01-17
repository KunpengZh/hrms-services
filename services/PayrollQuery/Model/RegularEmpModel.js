module.exports = function (empsa) {
    return {
        empId: empsa.empId,
        name: empsa.name,
        department: empsa.department,
        jobRole: empsa.jobRole,
        workerCategory: empsa.workerCategory,
        gender: empsa.gender,
        salaryCycle: empsa.salaryCycle,
        jinengGongzi : parseFloat(empsa.jinengGongzi),
        gangweiGongzi : parseFloat(empsa.gangweiGongzi),
        jichuButie : parseFloat(empsa.jichuButie),
        xilifei : parseFloat(empsa.xilifei),
        gonglingGongzi : parseFloat(empsa.gonglingGongzi),
        jibengongzi : parseFloat(empsa.jibengongzi),
        zhiwuJintie : parseFloat(empsa.zhiwuJintie),
        gongliBuzhu : parseFloat(empsa.gongliBuzhu),
        kaoheJiangjin : parseFloat(empsa.kaoheJiangjin),
        gudingJiangjin : parseFloat(empsa.gudingJiangjin),
        tongxunButie : parseFloat(empsa.tongxunButie),
        qitaJiangjin : parseFloat(empsa.qitaJiangjin),
        xiaxiangBuzhu : parseFloat(empsa.xiaxiangBuzhu),
        yingyetingBuzhu : parseFloat(empsa.yingyetingBuzhu),
        NormalOT : parseFloat(empsa.NormalOT),
        WeekendOT : parseFloat(empsa.WeekendOT),
        HolidayOT : parseFloat(empsa.HolidayOT),
        kouchu : parseFloat(empsa.kouchu),
        kaohekoukuan : parseFloat(empsa.kaohekoukuan),
        yingfagongzi : parseFloat(empsa.yingfagongzi),
        nianjin : parseFloat(empsa.nianjin),
        qiyeNianjin : parseFloat(empsa.qiyeNianjin),
        yanglaobaoxian : parseFloat(empsa.yanglaobaoxian),
        qiyeYanglaobaoxian : parseFloat(empsa.qiyeYanglaobaoxian),
        shiyebaoxian : parseFloat(empsa.shiyebaoxian),
        qiyeShiyebaoxian : parseFloat(empsa.qiyeShiyebaoxian),
        zhufanggongjijin : parseFloat(empsa.zhufanggongjijin),
        qiyeZhufanggongjijin : parseFloat(empsa.qiyeZhufanggongjijin),
        yiliaobaoxian : parseFloat(empsa.yiliaobaoxian),
        qiyeYiliaobaoxian : parseFloat(empsa.qiyeYiliaobaoxian),
        yingshuigongzi : parseFloat(empsa.yingshuigongzi),
        tax : parseFloat(empsa.tax),
        yicixingjiangjin : parseFloat(empsa.yicixingjiangjin),
        yicixingjiangjinTax : parseFloat(empsa.yicixingjiangjinTax),
        buchongyiliaobaoxian : parseFloat(empsa.buchongyiliaobaoxian),
        netIncome : parseFloat(empsa.netIncome),
        daySalary : '',
        workDays : '',
        anquanJiangli : '',
        wuweizhangJiangli : '',
        OTJiangjin : '',
    }
};