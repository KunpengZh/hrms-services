var sequelize = require("../services/mysql/hrmsdb");
var EmpSensitiveTable = require("../services/mysql/SensitiveEmpInfo");

var PersonalIncomeTax = {};
PersonalIncomeTax.patchdbtable = function(empIds) {
  return new Promise(function(rel, rej) {
    sequelize
      .query("select * from SensitiveEmpInfos", { type: sequelize.QueryTypes.SELECT })
      .then(empSenData => {
        data = JSON.parse(JSON.stringify(empSenData));
        if (data[0] && data[0].personalIncomeTaxDeduction) {
          console.log("already have the field: personalIncomeTaxDeduction");
        } else {
          console.log("start to patching.....");
          sequelize
            .query("alter table hrms.SensitiveEmpInfos add personalIncomeTaxDeduction varchar(255)", {
              type: sequelize.QueryTypes.UPDATE
            })
            .then(sdata => {
              console.log(JSON.stringify(sdata));
            })
            .catch(err => {
              console.log("failed when patching sensitive table");
              console.log(err);
            });
        }
      })
      .catch(err => {
        logger.error("Error When patching sentive emp information table");
        console.log(err);
      });
  });
};

PersonalIncomeTax.patchdbtable();
