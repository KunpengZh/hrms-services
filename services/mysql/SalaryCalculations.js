var sequelize = require('./hrmsdb');
const SalaryCalculations = sequelize.import("./dataModel/SalaryCalculation.js");

SalaryCalculations.sync();
module.exports = SalaryCalculations;