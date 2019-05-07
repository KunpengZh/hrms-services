var sequelize = require("../services/mysql/hrmsdb");
// var EmpSensitiveTable = require("../services/mysql/SensitiveEmpInfo");

// var empOTHistoryTable= require("../services/mysql/EmpOTHistory");
// var nonRegularEmpOTHistoryTable = require("../services/mysql/NonRegularSalaryHistory");
// var SDDetailsTable = require("../services/mysql/SalaryDetails");
// var SalaryCycle = require("../services/mysql/SalaryCycles");
// var SalaryCalculations = require("../services/mysql/SalaryCalculations");

var RemoveData = {};
RemoveData.patchdbtable = function(empIds) {
  return new Promise(function(rel, rej) {
    sequelize
      .query("delete from EmpOTHistories where OTCycle='201902'", { type: sequelize.QueryTypes.DELETE })
      .then(delres => {
        console.log("删除员工加班历史记录成功");
        console.log(delres);
      })
      .catch(err => {
        console.log("删除员工加班历史记录失败");
        console.log(err);
      });

    sequelize
      .query("delete from NonRegularSalaryHistories where salaryCycle='201902'", { type: sequelize.QueryTypes.DELETE })
      .then(delres => {
        console.log("删除non-regular员工加班历史记录成功");
        console.log(delres);
      })
      .catch(err => {
        console.log("删除non-regular员工加班历史记录失败");
        console.log(err);
      });

    sequelize
      .query("delete from SalaryCalculations where salaryCycle='201902'", { type: sequelize.QueryTypes.DELETE })
      .then(delres => {
        console.log("删除工资计算表成功");
        console.log(delres);
      })
      .catch(err => {
        console.log("删除工资计算表失败");
        console.log(err);
      });

    sequelize
      .query("delete from SalaryDetails where salaryCycle='201902'", { type: sequelize.QueryTypes.DELETE })
      .then(delres => {
        console.log("删除工资历史表成功");
        console.log(delres);
      })
      .catch(err => {
        console.log("删除工资历史表失败");
        console.log(err);
      });

    sequelize
      .query("delete from SalaryCycles where salaryCycle='201902'", { type: sequelize.QueryTypes.DELETE })
      .then(delres => {
        console.log("删除工资计算控制表成功");
        console.log(delres);
      })
      .catch(err => {
        console.log("删除工资计算控制表失败");
        console.log(err);
      });
  });
};

RemoveData.patchdbtable();
