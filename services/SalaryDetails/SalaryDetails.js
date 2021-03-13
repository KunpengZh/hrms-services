var SalaryDetails = require('../mysql/SalaryDetails');
var SalaryCycles = require('../mysql/SalaryCycles');
var CoryptoEnpSen = require('../empInfoServices/CryptoEnpSen');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-SalaryDetails-Services');
logger.level = 'All';



var SDServices = {};

SDServices.getAllAvailableCycles = function () {
    return new Promise(function (rel, rej) {
        SalaryCycles.findAll({
            where: {
                status: 'Closed'
            }
        }).then(sacycles => {
            sacycles = sacycles.map(function (cycle) {
                return {
                    label: cycle.salaryCycle,
                    value: cycle.salaryCycle
                }
            });
            rel({
                status: 200,
                data: sacycles
            })
        }).catch((err) => {
            logger.error("Error Location SalaryDetails002")
            logger.error(err);
            rel({
                status: 500,
                data: [],
                message: err
            })
        })
    })
}

SDServices.getDataByCycle = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            rel([]);
            return;
        }
        SalaryDetails.findAll({
            where: {
                salaryCycle: salaryCycle
            }
        }).then((SDData) => {
           
            rel(CoryptoEnpSen.DeEncrypteEmps(JSON.parse(JSON.stringify(SDData))));
        }, (err) => {
            logger.error("Error Location SalaryDetails001")
            throw err;
        }).catch((err) => {
            logger.error("Error Location SalaryDetails002")
            throw err;
        })
    })
}

SDServices.queryByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {
        if (criteria === null) criteria = {};

        let wherecase = buildWhereCase(criteria);
        let data = [];
        sequelize.query("select * from SalaryDetails" + wherecase, { type: sequelize.QueryTypes.SELECT })
            .then(sdata => {
                data = CoryptoEnpSen.DeEncrypteEmps(JSON.parse(JSON.stringify(sdata)));
                rel({
                    status: 200,
                    data: data,
                    message: ''
                });
            }, err => {
                logger.error("Error Location SalaryDetailsQuery01")
                rej({
                    status: 500,
                    data: [],
                    message: err
                });
            }).catch(err => {
                logger.error("Error Location SalaryDetailsQuery02")
                rej({
                    status: 500,
                    data: [],
                    message: err
                });
            });
    })
}
var buildWhereCase = function (criteria) {

    let wherecase = '';
    if (criteria.workerCategory) {
        if (wherecase === '') {
            wherecase = " where workerCategory ='" + criteria.workerCategory + "'";
        } else {
            wherecase += " and workerCategory ='" + criteria.workerCategory + "'";
        }
    }

    if (criteria.department) {
        if (wherecase === '') {
            wherecase = " where department ='" + criteria.department + "'";
        } else {
            wherecase += " and department ='" + criteria.department + "'";
        }
    }
    if (criteria.jobRole) {
        if (wherecase === '') {
            wherecase = " where jobRole ='" + criteria.jobRole + "'";
        } else {
            wherecase += " and jobRole ='" + criteria.jobRole + "'";
        }
    }
    if (criteria.salaryCycle) {
        if (wherecase === '') {
            wherecase = " where salaryCycle ='" + criteria.salaryCycle + "'";
        } else {
            wherecase += " and salaryCycle ='" + criteria.salaryCycle + "'";
        }
    }

    if (criteria.startSalaryCycle) {
        if (wherecase === '') {
            wherecase = "  where salaryCycle >='" + criteria.startSalaryCycle + "'";
        } else {
            wherecase += " and salaryCycle >='" + criteria.startSalaryCycle + "'";
        }
    }
    if (criteria.endSalaryCycle) {

        if (wherecase === '') {
            wherecase = " where salaryCycle <='" + criteria.endSalaryCycle + "'";
        } else {

            wherecase += " and salaryCycle <='" + criteria.endSalaryCycle + "'";
        }
    }

    if (criteria.name) {

        if (wherecase === '') {
            wherecase = " where name='" + criteria.name + "'";
        } else {

            wherecase += " and name ='" + criteria.name + "'";
        }
    }

    return wherecase;
}





module.exports = SDServices;
