var sequelize = require('./hrmsdb');
const UnicID = sequelize.import("./dataModel/UnicID.js");

UnicID.sync();
UnicID.findOrCreate({
    where: {
        configKey: 'EmpID'
    },
    defaults: {
        configKey: 'EmpID',
        unicID: 10000
    }
});
UnicID.findOrCreate({
    where: {
        configKey: 'ConfigDocID'
    },
    defaults: {
        configKey: 'ConfigDocID',
        unicID: 9000
    }
});
module.exports = UnicID;