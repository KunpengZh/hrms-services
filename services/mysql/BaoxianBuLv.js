var sequelize = require('./hrmsdb');
const Baoxianbulv = sequelize.import("./dataModel/BaoxianBuLv.js");

Baoxianbulv.sync();
module.exports = Baoxianbulv;