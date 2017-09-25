module.exports = function (empsa) {
    return {
        empId: empsa.empId,
        name: empsa.name,
        gender: empsa.gender,
        idCard: empsa.idCard,
        bankAccount: empsa.bankAccount,
        workAge: empsa.workAge,
        comment: empsa.comment,
        department: empsa.department,
        jobRole: empsa.jobRole,
        workerCategory: empsa.workerCategory,
        salaryCycle: empsa.salaryCycle,
        jibengongzi: empsa.jibengongzi,
        totalJiangjin: (parseFloat(empsa.zhiwuJintie) + parseFloat(empsa.gongliBuzhu) + parseFloat(empsa.kaoheJiangjin) + parseFloat(empsa.qitaJiangjin) + parseFloat(empsa.xiaxiangBuzhu) + parseFloat(empsa.yingyetingBuzhu)).toFixed(2) + '',
        totalOT: (parseFloat(empsa.NormalOT) + parseFloat(empsa.WeekendOT) + parseFloat(empsa.HolidayOT)).toFixed(2) + '',
        tongxunButie: empsa.tongxunButie,
        nianjin: empsa.nianjin,
        yanglaobaoxian: empsa.yanglaobaoxian,
        shiyebaoxian: empsa.shiyebaoxian,
        zhufanggongjijin: empsa.zhufanggongjijin,
        yiliaobaoxian: empsa.yiliaobaoxian,
        totalKouchu: (parseFloat(empsa.kouchu) + parseFloat(empsa.kaohekoukuan)).toFixed(2) + '',
        tax: empsa.tax,
        yicixingjiangjin: empsa.yicixingjiangjin,
        yicixingjiangjinTax: empsa.yicixingjiangjinTax,
        buchongyiliaobaoxian: empsa.buchongyiliaobaoxian,
        netIncome: empsa.netIncome
    }
};