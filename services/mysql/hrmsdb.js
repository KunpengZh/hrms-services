var Sequelize = require('sequelize');
var dbconfig = require('./dbconfig.json');
// var log4js = require("log4js");
// var logger = log4js.getLogger('HRMS-HRMSDB-Controller');
// logger.level = 'All';
// logger.info("To connect with HRMS DB");
const sequelizeInstance= new Sequelize(dbconfig.database, dbconfig.username, dbconfig.password, {
    host: dbconfig.hostname,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
});

sequelizeInstance.import=function(file){
    return require(file)(sequelizeInstance, Sequelize.DataTypes)
}

module.exports= sequelizeInstance;

