module.exports = function(
  empId,
  empName,
  department,
  jobRole,
  workerCategory,
  empStatus,
  unEmpDate,
  personalIncomeTaxDeduction
) {
  return {
    empId: empId,
    name: empName,
    department: department,
    jobRole: jobRole,
    workerCategory: workerCategory,
    idCard: "",
    birthday: "",
    age: "",
    bankAccount: "",
    jinengGongzi: "",
    gangweiGongzi: "",
    jichuButie: "",
    xilifei: "",
    gonglingGongzi: "",
    zhiwuJintie: "",
    preAnnuallyIncom: "",
    empStatus: empStatus ? empStatus : "",
    unEmpDate: unEmpDate ? unEmpDate : "",
    personalIncomeTaxDeduction: personalIncomeTaxDeduction ? personalIncomeTaxDeduction : ""
  };
};
