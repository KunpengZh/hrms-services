module.exports = function (Emp, OTCycle) {
    return {
        empId: Emp.empId,
        name: Emp.name,
        department: Emp.department,
        jobRole: Emp.jobRole,
        workerCategory: Emp.workerCategory,
        OTCycle: OTCycle,
        NormalOT: '0',
        WeekendOT: "0",
        HolidayOT: '0',
        kouchu: '0',
        kaohekoukuan: '0',
        yicixingjiangjin: '0',
        gongliBuzhu: '0',
        kaoheJiangjin: '0',
        tongxunButie: '0',
        qitaJiangjin: '0',
        xiaxiangBuzhu: '0',
        yingyetingBuzhu: '0',
        buchongyiliaobaoxian: '0',
    }
}
