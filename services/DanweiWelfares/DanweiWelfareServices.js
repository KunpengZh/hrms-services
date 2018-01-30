
var Welfares = require('../mysql/DanweiWelfares');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-DanweiWelfares-Services');
logger.level = 'All';

var DanweiWelfareServices = {};


// var keepTwoDecimalFull = function (num) {
//     var result = parseFloat(num);
//     if (isNaN(result)) {
//         return false;
//     }
//     result = Math.round(num * 100) / 100;
//     var s_x = result.toString();
//     var pos_decimal = s_x.indexOf('.');
//     if (pos_decimal < 0) {
//         pos_decimal = s_x.length;
//         s_x += '.';
//     }
//     while (s_x.length <= pos_decimal + 2) {
//         s_x += '0';
//     }
//     return s_x;
// }

DanweiWelfareServices.getAllData = function () {
    return new Promise(function (rel, rej) {
        
        Welfares.findAll().then((welfareData) => {
            welfareData = JSON.parse(JSON.stringify(welfareData));
            rel({
                status: 200,
                data: welfareData
            });
        }, (err) => {
            logger.error("Error Location DanweiWelfareServices001")
            logger.error(err);
            rel({
                status: 200,
                data: welfareData
            });
        }).catch((err) => {
            logger.error("Error Location DanweiWelfareServices002")
            logger.error(err);
            rel({
                status: 200,
                data: welfareData
            });
        })
    })
}

DanweiWelfareServices.getWelfareByCycle = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            rel([]);
            return;
        }
        Welfares.findAll({
            where: {
                salaryCycle: salaryCycle
            }
        }).then((welfareData) => {
            welfareData = JSON.parse(JSON.stringify(welfareData));
            rel({
                status: 200,
                data: welfareData
            });
        }, (err) => {
            logger.error("Error Location DanweiWelfareServices001")
            logger.error(err);
            rel({
                status: 200,
                data: welfareData
            });
        }).catch((err) => {
            logger.error("Error Location DanweiWelfareServices002")
            logger.error(err);
            rel({
                status: 200,
                data: welfareData
            });
        })
    })
}

DanweiWelfareServices.queryByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {
        if (criteria === null) criteria = {};

        let wherecase = buildWhereCase(criteria);
        let data = [];
        sequelize.query("select * from danweiwelfares" + wherecase, { type: sequelize.QueryTypes.SELECT })
            .then(walfaredata => {
                data = JSON.parse(JSON.stringify(walfaredata));
                rel({
                    status: 200,
                    data: data,
                    message: ''
                });
            }, err => {
                logger.error("Error Location DanweiWelfareServicesQuery002")
                logger.error(err);
                rej({
                    status: 500,
                    data: [],
                    message: err
                });
            }).catch(err => {
                logger.error("Error Location DanweiWelfareServicesQuery003")
                logger.error(err);
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

    return wherecase;
}






DanweiWelfareServices.update = function (WelDataList) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < WelDataList.length; i++) {
            let WeEmp = WelDataList[i];
            let name = WeEmp.name;
            let id = WeEmp.id;
            if (id === null || id === undefined) id = -1;

            

            Welfares.findOne({
                where: {
                    id: id
                }
            }).then((WelData) => {
                if (WelData === null) {
                    Welfares.create(WeEmp).then(crres => {

                        processed++;
                        if (processed === WelDataList.length) {
                            logger.info("Upload danwei welfares  completed");
                            rel({
                                status: 200,
                                data: [],
                                message: "finished"
                            })
                        }
                    })
                } else {
                    Welfares.update(WeEmp, {
                        where: {
                            id: id
                        }
                    }).then((updateRes) => {
                        processed++;
                        if (processed === WelDataList.length) {
                            logger.info("Update danwei welfares Data running completed");
                            rel({
                                status: 200,
                                data: [],
                                message: "finished"
                            })
                        }
                    }, (err) => {
                        logger.error("Error Location DanweiWelfareServices301")
                        logger.error(err);
                        rel({
                            status: 500,
                            data: [],
                            message: err
                        });
                    }).catch(function (err) {
                        logger.error("Error Location DanweiWelfareServices301")
                        logger.error(err);
                        rel({
                            status: 500,
                            data: [],
                            message: err
                        });
                    })
                }
            })



        }
    })
}



DanweiWelfareServices.delete = function (ids) {
    return new Promise(function (rel, rej) {
        sequelize.query('DELETE FROM danweiwelfares WHERE id IN(:ids)',
            { replacements: { ids: ids } }
        ).spread((results, metadata) => {
            rel({
                status: 200,
                data: [],
                message: "finished"
            })
        }).catch((err) => {
            logger.error("Error Location DanweiWelfareServices401")
            logger.error(err);
            rel({
                status: 500,
                data: [],
                message: err
            });
        });
    })
}

module.exports = DanweiWelfareServices;