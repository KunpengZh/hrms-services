var CategoryConfig = require('../mysql/CategoryConfig');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-CategoryConfig-Services');
logger.level = 'All';
//var CategoryConfigModel = require('./Model/CategoryConfigModel')
var CategoryConfigServices = {};

CategoryConfigServices.getAllCategoryConfig = function () {
    return new Promise(function (rel, rej) {
        CategoryConfig.findAll().then((categoryConfig) => {
            rel(categoryConfig);
        }, (err) => {
            logger.error("Error Location CategoryConfigServices001")
            throw err;
        }).catch((err) => {
            logger.error("Error Location CategoryConfigServices002")
            throw err;
        })
    })
}


CategoryConfigServices.updatedCategoryConfig = function (categoryConfigs) {
    return new Promise(function (rel, rej) {
        var processed = 0;

        for (let i = 0; i < categoryConfigs.length; i++) {
            let WorkerCategory = categoryConfigs[i]["WorkerCategory"];
            if (WorkerCategory === null || WorkerCategory === undefined || WorkerCategory === '') {
                logger.error("WorkerCategory is not provided , will skip categoryConfig: " + JSON.stringify(categoryConfigs[i]));
                processed++;
                continue;
            }
            CategoryConfig.findOne({
                where: {
                    WorkerCategory: WorkerCategory
                }
            }).then((configdoc) => {
                if (configdoc === null) {
                    logger.info("To Create new CategoryConfig : " + JSON.stringify(categoryConfigs[i]));

                    CategoryConfig.create(categoryConfigs[i]).then((nConfigDoc) => {
                        logger.info("new WorkerCategory Created :" + JSON.stringify(nConfigDoc));
                        processed++;
                        if (processed === categoryConfigs.length) {
                            CategoryConfigServices.getAllCategoryConfig().then((configdocs) => {
                                rel(configdocs);
                            }).catch((err) => {
                                logger.error("Error Location CategoryConfigServices011")
                                throw err;
                            })
                        }
                    }, (err) => {
                        logger.error("Error Location CategoryConfigServices012")
                        throw err;
                    }).catch(function (err) {
                        logger.error("Error Location CategoryConfigServices013")
                        throw err;
                    })
                } else {
                    logger.info("To Update CategoryConfig : " + JSON.stringify(categoryConfigs[i]));

                    CategoryConfig.update(categoryConfigs[i], {
                        where: {
                            WorkerCategory: WorkerCategory
                        }
                    }).then((nConfigDoc) => {
                        processed++;
                        if (processed === categoryConfigs.length) {
                            CategoryConfigServices.getAllCategoryConfig().then((configdocs) => {
                                rel(configdocs);
                            }).catch((err) => {
                                logger.error("Error Location CategoryConfigServices014")
                                throw err;
                            })
                        }

                    }, (err) => {
                        logger.error("Error Location CategoryConfigServices015")
                        throw err;
                    }).catch(function (err) {
                        logger.error("Error Location CategoryConfigServices016")
                        throw err;
                    })
                }
            }, (err) => {
                logger.error("Error Location CategoryConfigServices017")
                throw err;
            }).catch(function (err) {
                logger.error("Error Location CategoryConfigServices018")
                throw err;
            })
        }
    })
}
CategoryConfigServices.delete = function (WorkerCategoryKeys) {
    return new Promise(function (rel, rej) {
        logger.info("To delete Category Configs.....")
        sequelize.query("DELETE FROM CategoryConfigs WHERE WorkerCategory IN(:WorkerCategoryKeys) ", { replacements: { WorkerCategoryKeys: WorkerCategoryKeys }, type: sequelize.QueryTypes.DELETE })
            .then((delres) => {
                logger.info("WorkCategory deleted for :" + JSON.stringify(WorkerCategoryKeys));
                logger.info("Deletion Response: " + delres);

            }).catch((err) => {
                logger.error("Error Location EmpBasicService011")
                throw err;
            });
    })
}


module.exports = CategoryConfigServices;