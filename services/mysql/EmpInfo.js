var sequelize = require('./hrmsdb');
const EmpInfo = sequelize.import("./dataModel/EmpInfo.js");

EmpInfo.sync();
module.exports = EmpInfo;