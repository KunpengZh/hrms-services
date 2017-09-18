var sequelize = require('./hrmsdb');
const CategoryConfig = sequelize.import("./dataModel/CategoryConfig.js");

CategoryConfig.sync();
module.exports = CategoryConfig;