var sequelize = require('./hrmsdb');
const SalaryDetails = sequelize.import("./dataModel/SalaryDetail.js");

SalaryDetails.sync();
module.exports = SalaryDetails;