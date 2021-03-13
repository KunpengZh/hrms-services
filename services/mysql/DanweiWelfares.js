var sequelize = require('./hrmsdb');
const EmpWelfare = sequelize.import("./dataModel/DanweiWelfare.js");

EmpWelfare.sync();
module.exports = EmpWelfare;