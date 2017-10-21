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
        totalJiangjin: (parseFloat(empsa.anquanJiangli) + parseFloat(empsa.wuweizhangJiangli)).toFixed(2) + '',
        totalOT: (parseFloat(empsa.OTJiangjin)).toFixed(2) + '',
        tongxunButie: '',
        nianjin: '',
        yanglaobaoxian: '',
        shiyebaoxian: '',
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