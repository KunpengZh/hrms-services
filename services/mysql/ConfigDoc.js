var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-ConfigDoc');
logger.level = 'All';
var sequelize = require('./hrmsdb');
const ConfigDoc = sequelize.import("./dataModel/Config.js");

ConfigDoc.sync();
module.exports = ConfigDoc;