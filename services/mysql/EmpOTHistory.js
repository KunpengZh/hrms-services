var sequelize = require('./hrmsdb');
const EmpOTHistory = sequelize.import("./dataModel/EmpOTHistory.js");

EmpOTHistory.sync();
module.exports = EmpOTHistory;