module.exports = function (Emp, salaryCycle) {
    return {
        empId: Emp.empId,
        name: Emp.name,
        department: Emp.department,
        jobRole: Emp.jobRole,
        workerCategory: Emp.workerCategory,
        salaryCycle: salaryCycle,
        nianjin: 0,
        qiyeNianjin: 0,
        yanglaobaoxian: 0,
        qiyeYanglaobaoxian: 0,
        shiyebaoxian: 0,
        qiyeShiyebaoxian: 0,
        zhufanggongjijin: 0,
        qiyeZhufanggongjijin: 0,
        yiliaobaoxian: 0,
        qiyeYiliaobaoxian: 0,
        buchongyiliaobaoxian: 0,
        shengyubaoxian:0,
        gongshangbaoxian:0
    }
}
