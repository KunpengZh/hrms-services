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
        HolidayOT: '0'
    }
}
