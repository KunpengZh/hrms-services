var sequelize = require('./hrmsdb');
const NonRegularSalary = sequelize.import("./dataModel/NonRegularSalary.js");

NonRegularSalary.sync();
module.exports = NonRegularSalary;