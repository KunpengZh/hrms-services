var sequelize = require('./hrmsdb');
const SalaryCycles = sequelize.import("./dataModel/SalaryCycle.js");

SalaryCycles.sync();
module.exports = SalaryCycles;