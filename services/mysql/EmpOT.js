var sequelize = require('./hrmsdb');
const EmpOT = sequelize.import("./dataModel/EmpOT.js");

EmpOT.sync();
module.exports = EmpOT;