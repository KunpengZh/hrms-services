var sequelize = require('./hrmsdb');
const SensitiveEmpInfo = sequelize.import("./dataModel/SensitiveEmpInfo.js");

SensitiveEmpInfo.sync();
module.exports = SensitiveEmpInfo;