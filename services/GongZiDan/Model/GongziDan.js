module.exports = function (empsa) {
    var keepTwoDecimalFull = function (num) {
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
        totalJiangjin: keepTwoDecimalFull(parseFloat(empsa.zhiwuJintie) + parseFloat(empsa.gongliBuzhu) + parseFloat(empsa.kaoheJiangjin) + parseFloat(empsa.qitaJiangjin) + parseFloat(empsa.xiaxiangBuzhu) + parseFloat(empsa.yingyetingBuzhu) + parseFloat(empsa.gudingJiangjin)),
        totalOT: keepTwoDecimalFull(parseFloat(empsa.NormalOT) + parseFloat(empsa.WeekendOT) + parseFloat(empsa.HolidayOT)),
        tongxunButie: empsa.tongxunButie,
        yingfagongzi: empsa.yingfagongzi,
        nianjin: empsa.nianjin,
        yanglaobaoxian: empsa.yanglaobaoxian,
        shiyebaoxian: empsa.shiyebaoxian,
        zhufanggongjijin: empsa.zhufanggongjijin,
        yiliaobaoxian: empsa.yiliaobaoxian,
        totalKouchu: keepTwoDecimalFull(parseFloat(empsa.kouchu) + parseFloat(empsa.kaohekoukuan)),
        tax: empsa.tax,
        yicixingjiangjin: empsa.yicixingjiangjin,
        yicixingjiangjinTax: empsa.yicixingjiangjinTax,
        buchongyiliaobaoxian: empsa.buchongyiliaobaoxian,
        netIncome: empsa.netIncome,
        gongziDesc: '工资+奖金+值班费+通讯补贴-扣款-养老保险-医疗保险-失业保险-住房公积金-个人所得税-补充医疗保险+一次性奖金-奖金税=实发工资'
    }
};