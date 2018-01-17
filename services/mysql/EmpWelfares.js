var sequelize = require('./hrmsdb');
const EmpWelfare = sequelize.import("./dataModel/EmpWelfare.js");

EmpWelfare.sync();
module.exports = EmpWelfare;