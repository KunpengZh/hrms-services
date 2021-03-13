module.exports = function (Emp, salaryCycle) {
    return {
        empId: Emp.empId,
        name: Emp.name,
        department: Emp.department,
        jobRole: Emp.jobRole,
        workerCategory: Emp.workerCategory,
        salaryCycle: salaryCycle,
        Yiliaofeiyong: 0,
        Liaoyangfeiyong: 0,
        Gongnuanbutie: 0,
        Dushengzinv: 0,
        Sangzangbuzhu: 0,
        Fuxufei: 0,
        Fangshujiangwen: 0,
        Shitangjingfei: 0,
        Personalqitafuli: 0,
        CompanyQitafuli: 0,
    }
}
