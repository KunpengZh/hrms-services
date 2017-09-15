var sequelize = require('./hrmsdb');
const ConfigDoc = sequelize.import("./dataModel/Config.js");

ConfigDoc.sync();
module.exports = ConfigDoc;