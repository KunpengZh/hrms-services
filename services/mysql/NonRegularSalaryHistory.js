var sequelize = require('./hrmsdb');
const NonRegularSalaryHistory = sequelize.import("./dataModel/NonRegularSalaryHistory.js");

NonRegularSalaryHistory.sync();
module.exports = NonRegularSalaryHistory;