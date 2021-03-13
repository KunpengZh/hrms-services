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
        totalJiangjin: keepTwoDecimalFull(parseFloat(empsa.anquanJiangli) + parseFloat(empsa.wuweizhangJiangli)),
        totalOT: keepTwoDecimalFull(parseFloat(empsa.OTJiangjin)),
        tongxunButie: '',
        yingfagongzi:keepTwoDecimalFull(parseFloat(empsa.yingfagongzi)),
        nianjin: empsa.nianjin,
        yanglaobaoxian: empsa.yanglaobaoxian,
        shiyebaoxian: empsa.shiyebaoxian,
        zhufanggongjijin: '',
        yiliaobaoxian: '',
        totalKouchu: '',
        tax: empsa.tax,
        yicixingjiangjin: '',
        yicixingjiangjinTax: '',
        buchongyiliaobaoxian: '',
        netIncome: empsa.netIncome,
        gongziDesc:'工资+奖金+值班费-个人所得税=实发工资'
    }
};