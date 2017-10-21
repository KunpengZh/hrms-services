module.exports = function (empId, empName, department, jobRole, workerCategory, empStatus, unEmpDate) {
    return {
        empId: empId,
        name: empName,
        department: department,
        jobRole: jobRole,
        workerCategory: workerCategory,
        idCard: '',
        birthday: '',
        age: '',
        bankAccount: '',
        jinengGongzi: '',
        gangweiGongzi: '',
        jichuButie: '',
        xilifei: '',
        gonglingGongzi: '',
        zhiwuJintie: '',
        gongliBuzhu: '',
        kaoheJiangjin: '',
        tongxunButie: '',
        qitaJiangjin: '',
        xiaxiangBuzhu: '',
        yingyetingBuzhu: '',
        preAnnuallyIncom: '',
        buchongyiliaobaoxian: '',
        empStatus: empStatus ? empStatus : '',
        unEmpDate: unEmpDate ? unEmpDate : ''
    }
}
