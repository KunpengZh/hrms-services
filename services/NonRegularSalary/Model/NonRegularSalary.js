module.exports = function (emp, salaryCycle) {
    return {
        empId: emp.empId,
        name: emp.name,
        department: emp.department,
        jobRole: emp.jobRole,
        workerCategory: emp.workerCategory,
        gender: emp.gender,
        workAge: emp.workAge,
        salaryCycle: salaryCycle,
        entryTime: emp.entryTime,
        daySalary: "",
        workDays: "",
        anquanJiangli: "",
        wuweizhangJiangli: "",
        OTJiangjin: "",
        yiliaobaoxian:"",
        qiyeYiliaobaoxian:""
    }
};