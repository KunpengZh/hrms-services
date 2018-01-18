
var Welfares = require('../mysql/EmpWelfares');
var EmpBasicServices = require('../empInfoServices/EmpBasicServices');
var WelfaresModel = require('./Model/WelfaresModel');
var empInfo = require('../mysql/EmpInfo');
var sequelize = require('../mysql/hrmsdb');
var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-Welfare-Services');
logger.level = 'All';

var WelfareServices = {};

const NonRegularEmployeeCategory = "非全日制人员";

var keepTwoDecimalFull = function (num) {
    var result = parseFloat(num);
    if (isNaN(result)) {
        return false;
    }
    result = Math.round(num * 100) / 100;
    var s_x = result.toString();
    var pos_decimal = s_x.indexOf('.');
    if (pos_decimal < 0) {
        pos_decimal = s_x.length;
        s_x += '.';
    }
    while (s_x.length <= pos_decimal + 2) {
        s_x += '0';
    }
    return s_x;
}

WelfareServices.getWelfareByCycle = function (salaryCycle) {
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
            logger.error("Error Location WelfareServices001")
            logger.error(err);
            rel({
                status: 200,
                data: welfareData
            });
        }).catch((err) => {
            logger.error("Error Location WelfareServices002")
            logger.error(err);
            rel({
                status: 200,
                data: welfareData
            });
        })
    })
}

WelfareServices.tongJiDetails = function (criteria) {
    return new Promise(function (rel, rej) {
        WelfareServices.queryByCriteria(criteria).then(WelData => {
            if (WelData.status !== 200) {
                rel(welData);
                return;
            } else {

                let tongji = new WelfaresModel({
                    empId: '',
                    name: "统计汇总",
                    workerCategory: '',
                    department: '',
                    jobRole: ''
                }, '');

                WelData = WelData.data;
                WelData.forEach(wel => {
                    
                    tongji.Yiliaofeiyong = keepTwoDecimalFull(parseFloat(tongji.Yiliaofeiyong) + parseFloat(wel.Yiliaofeiyong));
                    tongji.Liaoyangfeiyong = keepTwoDecimalFull(parseFloat(tongji.Liaoyangfeiyong) + parseFloat(wel.Liaoyangfeiyong));
                    tongji.Gongnuanbutie = keepTwoDecimalFull(parseFloat(tongji.Gongnuanbutie) + parseFloat(wel.Gongnuanbutie));
                    tongji.Dushengzinv = keepTwoDecimalFull(parseFloat(tongji.Dushengzinv) + parseFloat(wel.Dushengzinv));
                    tongji.Sangzangbuzhu = keepTwoDecimalFull(parseFloat(tongji.Sangzangbuzhu) + parseFloat(wel.Sangzangbuzhu));
                    tongji.Fuxufei = keepTwoDecimalFull(parseFloat(tongji.Fuxufei) + parseFloat(wel.Fuxufei));
                    tongji.Fangshujiangwen = keepTwoDecimalFull(parseFloat(tongji.Fangshujiangwen) + parseFloat(wel.Fangshujiangwen));
                    //tongji.Shitangjingfei = keepTwoDecimalFull(parseFloat(tongji.Shitangjingfei) + parseFloat(wel.Shitangjingfei));
                    tongji.Personalqitafuli = keepTwoDecimalFull(parseFloat(tongji.Personalqitafuli) + parseFloat(wel.Personalqitafuli));
                    //tongji.CompanyQitafuli = keepTwoDecimalFull(parseFloat(tongji.CompanyQitafuli) + parseFloat(wel.CompanyQitafuli));
                    
                })
                WelData.push(tongji);
                rel({
                    status: 200,
                    data: WelData
                })
            }
        })
    })
}
WelfareServices.tongJiByCategory = function (criteria) {
    return new Promise(function (rel, rej) {
        WelfareServices.queryByCriteria(criteria).then(WelData => {
            if (WelData.status !== 200) {
                rel(welData);
                return;
            } else {
                let databycategory = [];
                let tongji = new WelfaresModel({
                    empId: '',
                    name: "统计汇总",
                    workerCategory: '统计汇总',
                    department: '',
                    jobRole: ''
                }, '');

                WelData = WelData.data;
                WelData.forEach(wel => {
                    let categoryExist = false;
                    for (let i = 0; i < databycategory.length; i++) {
                        if (wel.workerCategory === databycategory[i].workerCategory) {
                            categoryExist = true;
                            databycategory[i].Yiliaofeiyong = keepTwoDecimalFull(parseFloat(databycategory[i].Yiliaofeiyong) + parseFloat(wel.Yiliaofeiyong));
                            databycategory[i].Liaoyangfeiyong = keepTwoDecimalFull(parseFloat(databycategory[i].Liaoyangfeiyong) + parseFloat(wel.Liaoyangfeiyong));
                            databycategory[i].Gongnuanbutie = keepTwoDecimalFull(parseFloat(databycategory[i].Gongnuanbutie) + parseFloat(wel.Gongnuanbutie));
                            databycategory[i].Dushengzinv = keepTwoDecimalFull(parseFloat(databycategory[i].Dushengzinv) + parseFloat(wel.Dushengzinv));
                            databycategory[i].Sangzangbuzhu = keepTwoDecimalFull(parseFloat(databycategory[i].Sangzangbuzhu) + parseFloat(wel.Sangzangbuzhu));
                            databycategory[i].Fuxufei = keepTwoDecimalFull(parseFloat(databycategory[i].Fuxufei) + parseFloat(wel.Fuxufei));
                            databycategory[i].Fangshujiangwen = keepTwoDecimalFull(parseFloat(databycategory[i].Fangshujiangwen) + parseFloat(wel.Fangshujiangwen));
                            //databycategory[i].Shitangjingfei = keepTwoDecimalFull(parseFloat(databycategory[i].Shitangjingfei) + parseFloat(wel.Shitangjingfei));
                            databycategory[i].Personalqitafuli = keepTwoDecimalFull(parseFloat(databycategory[i].Personalqitafuli) + parseFloat(wel.Personalqitafuli));
                           // databycategory[i].CompanyQitafuli = keepTwoDecimalFull(parseFloat(databycategory[i].CompanyQitafuli) + parseFloat(wel.CompanyQitafuli));
                            break;
                        }
                    }

                    if (!categoryExist) {
                        wel.empId = '';
                        wel.name = '';
                        wel.department = '';
                        wel.jobRole = '';
                        databycategory.push(wel);
                    }

                    tongji.Yiliaofeiyong = keepTwoDecimalFull(parseFloat(tongji.Yiliaofeiyong) + parseFloat(wel.Yiliaofeiyong));
                    tongji.Liaoyangfeiyong = keepTwoDecimalFull(parseFloat(tongji.Liaoyangfeiyong) + parseFloat(wel.Liaoyangfeiyong));
                    tongji.Gongnuanbutie = keepTwoDecimalFull(parseFloat(tongji.Gongnuanbutie) + parseFloat(wel.Gongnuanbutie));
                    tongji.Dushengzinv = keepTwoDecimalFull(parseFloat(tongji.Dushengzinv) + parseFloat(wel.Dushengzinv));
                    tongji.Sangzangbuzhu = keepTwoDecimalFull(parseFloat(tongji.Sangzangbuzhu) + parseFloat(wel.Sangzangbuzhu));
                    tongji.Fuxufei = keepTwoDecimalFull(parseFloat(tongji.Fuxufei) + parseFloat(wel.Fuxufei));
                    tongji.Fangshujiangwen = keepTwoDecimalFull(parseFloat(tongji.Fangshujiangwen) + parseFloat(wel.Fangshujiangwen));
                    //tongji.Shitangjingfei = keepTwoDecimalFull(parseFloat(tongji.Shitangjingfei) + parseFloat(wel.Shitangjingfei));
                    tongji.Personalqitafuli = keepTwoDecimalFull(parseFloat(tongji.Personalqitafuli) + parseFloat(wel.Personalqitafuli));
                    //tongji.CompanyQitafuli = keepTwoDecimalFull(parseFloat(tongji.CompanyQitafuli) + parseFloat(wel.CompanyQitafuli));
                })
                databycategory.push(tongji);
                rel({
                    status: 200,
                    data: databycategory
                })
            }
        })
    })
}

WelfareServices.tongJiByDepartment = function (criteria) {
    return new Promise(function (rel, rej) {
        WelfareServices.queryByCriteria(criteria).then(WelData => {
            if (WelData.status !== 200) {
                rel(welData);
                return;
            } else {
                let databydepartment = [];
                let tongji = new WelfaresModel({
                    empId: '',
                    name: "统计汇总",
                    workerCategory: '',
                    department: '统计汇总',
                    jobRole: ''
                }, '');

                WelData = WelData.data;
                WelData.forEach(wel => {
                    let categoryExist = false;
                    for (let i = 0; i < databydepartment.length; i++) {
                        if (wel.department === databydepartment[i].department) {
                            categoryExist = true;
                            databydepartment[i].Yiliaofeiyong = keepTwoDecimalFull(parseFloat(databydepartment[i].Yiliaofeiyong) + parseFloat(wel.Yiliaofeiyong));
                            databydepartment[i].Liaoyangfeiyong = keepTwoDecimalFull(parseFloat(databydepartment[i].Liaoyangfeiyong) + parseFloat(wel.Liaoyangfeiyong));
                            databydepartment[i].Gongnuanbutie = keepTwoDecimalFull(parseFloat(databydepartment[i].Gongnuanbutie) + parseFloat(wel.Gongnuanbutie));
                            databydepartment[i].Dushengzinv = keepTwoDecimalFull(parseFloat(databydepartment[i].Dushengzinv) + parseFloat(wel.Dushengzinv));
                            databydepartment[i].Sangzangbuzhu = keepTwoDecimalFull(parseFloat(databydepartment[i].Sangzangbuzhu) + parseFloat(wel.Sangzangbuzhu));
                            databydepartment[i].Fuxufei = keepTwoDecimalFull(parseFloat(databydepartment[i].Fuxufei) + parseFloat(wel.Fuxufei));
                            databydepartment[i].Fangshujiangwen = keepTwoDecimalFull(parseFloat(databydepartment[i].Fangshujiangwen) + parseFloat(wel.Fangshujiangwen));
                            //databydepartment[i].Shitangjingfei = keepTwoDecimalFull(parseFloat(databydepartment[i].Shitangjingfei) + parseFloat(wel.Shitangjingfei));
                            databydepartment[i].Personalqitafuli = keepTwoDecimalFull(parseFloat(databydepartment[i].Personalqitafuli) + parseFloat(wel.Personalqitafuli));
                            //databydepartment[i].CompanyQitafuli = keepTwoDecimalFull(parseFloat(databydepartment[i].CompanyQitafuli) + parseFloat(wel.CompanyQitafuli));
                            break;
                        }
                    }

                    if (!categoryExist) {
                        wel.empId = '';
                        wel.name = '';
                        wel.workerCategory = '';
                        wel.jobRole = '';
                        databydepartment.push(wel);
                    }
                    tongji.Yiliaofeiyong = keepTwoDecimalFull(parseFloat(tongji.Yiliaofeiyong) + parseFloat(wel.Yiliaofeiyong));
                    tongji.Liaoyangfeiyong = keepTwoDecimalFull(parseFloat(tongji.Liaoyangfeiyong) + parseFloat(wel.Liaoyangfeiyong));
                    tongji.Gongnuanbutie = keepTwoDecimalFull(parseFloat(tongji.Gongnuanbutie) + parseFloat(wel.Gongnuanbutie));
                    tongji.Dushengzinv = keepTwoDecimalFull(parseFloat(tongji.Dushengzinv) + parseFloat(wel.Dushengzinv));
                    tongji.Sangzangbuzhu = keepTwoDecimalFull(parseFloat(tongji.Sangzangbuzhu) + parseFloat(wel.Sangzangbuzhu));
                    tongji.Fuxufei = keepTwoDecimalFull(parseFloat(tongji.Fuxufei) + parseFloat(wel.Fuxufei));
                    tongji.Fangshujiangwen = keepTwoDecimalFull(parseFloat(tongji.Fangshujiangwen) + parseFloat(wel.Fangshujiangwen));
                    //tongji.Shitangjingfei = keepTwoDecimalFull(parseFloat(tongji.Shitangjingfei) + parseFloat(wel.Shitangjingfei));
                    tongji.Personalqitafuli = keepTwoDecimalFull(parseFloat(tongji.Personalqitafuli) + parseFloat(wel.Personalqitafuli));
                    //tongji.CompanyQitafuli = keepTwoDecimalFull(parseFloat(tongji.CompanyQitafuli) + parseFloat(wel.CompanyQitafuli));
                })
                databydepartment.push(tongji);
                rel({
                    status: 200,
                    data: databydepartment
                })
            }
        })
    })
}

WelfareServices.tongJiByEmp = function (criteria) {
    return new Promise(function (rel, rej) {
        WelfareServices.queryByCriteria(criteria).then(WelData => {
            if (WelData.status !== 200) {
                rel(welData);
                return;
            } else {

                let tongji = new WelfaresModel({
                    empId: '',
                    name: "统计汇总",
                    workerCategory: '',
                    department: '',
                    jobRole: ''
                }, '');

                let newWelData = [];

                WelData = WelData.data;
                WelData.forEach(wel => {
                    let isExist = false;
                    for (let i = 0; i < newWelData.length; i++) {
                        if (wel.empId === newWelData[i].empId) {
                            isExist = true;
                            newWelData[i].Yiliaofeiyong = keepTwoDecimalFull(parseFloat(newWelData[i].Yiliaofeiyong) + parseFloat(wel.Yiliaofeiyong));
                            newWelData[i].Liaoyangfeiyong = keepTwoDecimalFull(parseFloat(newWelData[i].Liaoyangfeiyong) + parseFloat(wel.Liaoyangfeiyong));
                            newWelData[i].Gongnuanbutie = keepTwoDecimalFull(parseFloat(newWelData[i].Gongnuanbutie) + parseFloat(wel.Gongnuanbutie));
                            newWelData[i].Dushengzinv = keepTwoDecimalFull(parseFloat(newWelData[i].Dushengzinv) + parseFloat(wel.Dushengzinv));
                            newWelData[i].Sangzangbuzhu = keepTwoDecimalFull(parseFloat(newWelData[i].Sangzangbuzhu) + parseFloat(wel.Sangzangbuzhu));
                            newWelData[i].Fuxufei = keepTwoDecimalFull(parseFloat(newWelData[i].Fuxufei) + parseFloat(wel.Fuxufei));
                            newWelData[i].Fangshujiangwen = keepTwoDecimalFull(parseFloat(newWelData[i].Fangshujiangwen) + parseFloat(wel.Fangshujiangwen));
                            //newWelData[i].Shitangjingfei = keepTwoDecimalFull(parseFloat(newWelData[i].Shitangjingfei) + parseFloat(wel.Shitangjingfei));
                            newWelData[i].Personalqitafuli = keepTwoDecimalFull(parseFloat(newWelData[i].Personalqitafuli) + parseFloat(wel.Personalqitafuli));
                            //newWelData[i].CompanyQitafuli = keepTwoDecimalFull(parseFloat(newWelData[i].CompanyQitafuli) + parseFloat(wel.CompanyQitafuli));
                            break;
                        }
                    }

                    if (!isExist) {
                        newWelData.push(wel);
                    }

                    tongji.Yiliaofeiyong = keepTwoDecimalFull(parseFloat(tongji.Yiliaofeiyong) + parseFloat(wel.Yiliaofeiyong));
                    tongji.Liaoyangfeiyong = keepTwoDecimalFull(parseFloat(tongji.Liaoyangfeiyong) + parseFloat(wel.Liaoyangfeiyong));
                    tongji.Gongnuanbutie = keepTwoDecimalFull(parseFloat(tongji.Gongnuanbutie) + parseFloat(wel.Gongnuanbutie));
                    tongji.Dushengzinv = keepTwoDecimalFull(parseFloat(tongji.Dushengzinv) + parseFloat(wel.Dushengzinv));
                    tongji.Sangzangbuzhu = keepTwoDecimalFull(parseFloat(tongji.Sangzangbuzhu) + parseFloat(wel.Sangzangbuzhu));
                    tongji.Fuxufei = keepTwoDecimalFull(parseFloat(tongji.Fuxufei) + parseFloat(wel.Fuxufei));
                    tongji.Fangshujiangwen = keepTwoDecimalFull(parseFloat(tongji.Fangshujiangwen) + parseFloat(wel.Fangshujiangwen));
                    //tongji.Shitangjingfei = keepTwoDecimalFull(parseFloat(tongji.Shitangjingfei) + parseFloat(wel.Shitangjingfei));
                    tongji.Personalqitafuli = keepTwoDecimalFull(parseFloat(tongji.Personalqitafuli) + parseFloat(wel.Personalqitafuli));
                    //tongji.CompanyQitafuli = keepTwoDecimalFull(parseFloat(tongji.CompanyQitafuli) + parseFloat(wel.CompanyQitafuli));
                })

                newWelData.push(tongji);
                rel({
                    status: 200,
                    data: newWelData
                })
            }
        })
    })
}

WelfareServices.queryByCriteria = function (criteria) {
    return new Promise(function (rel, rej) {
        if (criteria === null) criteria = {};

        let wherecase = buildWhereCase(criteria);
        let data = [];
        sequelize.query("select * from EmpWelfares" + wherecase, { type: sequelize.QueryTypes.SELECT })
            .then(walfaredata => {
                data = JSON.parse(JSON.stringify(walfaredata));
                rel({
                    status: 200,
                    data: data,
                    message: ''
                });
            }, err => {
                logger.error("Error Location WelfareServicesQuery002")
                logger.error(err);
                rej({
                    status: 500,
                    data: [],
                    message: err
                });
            }).catch(err => {
                logger.error("Error Location WelfareServicesQuery003")
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




WelfareServices.InitialWithEmps = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
            logger.error("The give salaryCycle is null,will return");
            rel([]);
            return;
        }
        EmpBasicServices.queryActiveByCriteria({
            NonWorkerCategory: NonRegularEmployeeCategory
        }).then(emps => {
            if (emps.length <= 0) {
                rel({
                    status: 500,
                    data: [],
                    message: "没有符合条件的数据"
                });
            }
            let processed = 0;
            emps.forEach(function (emp) {
                let empId = emp.empId;
                Welfares.findOne({
                    where: {
                        empId: empId,
                        salaryCycle: salaryCycle
                    }
                }).then((WelData) => {
                    if (WelData === null) {
                        WelData = WelfaresModel(emp, salaryCycle);
                        Welfares.create(WelData).then(creationRes => {
                            logger.info("New Welfare data created for " + emp.name + " , on salary Cycle: " + salaryCycle);
                            processed++;
                            if (processed === emps.length) {
                                logger.info("Initial Welfares Data for Cycle:" + salaryCycle + " completed")
                                WelfareServices.getWelfareByCycle(salaryCycle).then(data => {
                                    rel({
                                        status: 200,
                                        data: data
                                    });
                                }).catch((err) => {
                                    logger.error("Error Location WelfareServices204")
                                    logger.error(err);
                                    rel({
                                        status: 500,
                                        data: [],
                                        message: err
                                    });
                                })
                            }
                        }).catch((err) => {
                            logger.error("Error Location WelfareServices203")
                            logger.error(err);
                            rel({
                                status: 500,
                                data: [],
                                message: err
                            });
                        })
                    } else {
                        processed++;
                        if (processed === emps.length) {
                            logger.info("Initial OT Data for Cycle:" + salaryCycle + " completed")
                            WelfareServices.getWelfareByCycle(salaryCycle).then(data => {
                                rel({
                                    status: 200,
                                    data: data
                                });
                            }).catch((err) => {
                                logger.error("Error Location WelfareServices204")
                                logger.error(err);
                                rel({
                                    status: 500,
                                    data: [],
                                    message: err
                                });
                            })
                        }
                    }
                }).catch((err) => {
                    logger.error("Error Location WelfareServices202")
                    logger.error(err);
                    rel({
                        status: 500,
                        data: [],
                        message: err
                    });
                })
            });
        }).catch((err) => {
            logger.error("Error Location WelfareServices201")
            logger.error(err);
            rel({
                status: 500,
                data: [],
                message: err
            });
        })
    })
}

WelfareServices.update = function (salaryCycle, WelDataList) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < WelDataList.length; i++) {
            let WeEmp = WelDataList[i];
            let empId = WeEmp.empId;
            logger.info("To Update Welfares Data for : " + WeEmp.name + " on salary Cycle:" + salaryCycle);
            if (empId === null || empId === undefined || empId === '') {
                logger.error("The give empID is null,will skip");
                processed++;
                continue;
            }
            if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
                logger.error("The give salaryCycle is null,will skip");

                rel({
                    status: 500,
                    data: [],
                    message: "The give salaryCycle is null"
                });
                continue;
            }

            Welfares.findOne({
                where: {
                    empId: empId,
                    salaryCycle: salaryCycle
                }
            }).then((WelData) => {
                if (WelData === null) {
                    EmpBasicServices.getEmpById(empId).then(emps => {
                        if (emps.length > 0) {
                            let emp = emps[0];
                            WeEmp.name = emp.name;
                            WeEmp.workerCategory = emp.workerCategory;
                            WeEmp.department = emp.department;
                            WeEmp.jobRole = emp.jobRole;
                            Welfares.create(WeEmp).then(crres => {
                                logger.info("Created new employee Welfare for emp: " + emp.empId + " , " + emp.name);
                                processed++;
                                if (processed === WelDataList.length) {
                                    logger.info("Upload Employee welfares  completed");
                                    rel({
                                        status: 200,
                                        data: [],
                                        message: "finished"
                                    })
                                }
                            })
                        } else {
                            logger.error("The given emp ID not exist :" + empId)
                        }
                    })
                } else {
                    Welfares.update(WeEmp, {
                        where: {
                            empId: empId,
                            salaryCycle: salaryCycle
                        }
                    }).then((updateRes) => {
                        processed++;
                        if (processed === WelDataList.length) {
                            logger.info("Update Welfare Data for Cycle:" + salaryCycle + " running completed");
                            rel({
                                status: 200,
                                data: [],
                                message: "finished"
                            })
                        }
                    }, (err) => {
                        logger.error("Error Location WelfareServices301")
                        logger.error(err);
                        rel({
                            status: 500,
                            data: [],
                            message: err
                        });
                    }).catch(function (err) {
                        logger.error("Error Location WelfareServices301")
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

/**
 * Allow user to speicify salaryCycle within the data
 */
WelfareServices.upload = function (WelDataList) {
    return new Promise(function (rel, rej) {
        let processed = 0;
        for (let i = 0; i < WelDataList.length; i++) {
            let WeEmp = WelDataList[i];
            let empId = WeEmp.empId;
            let salaryCycle = WeEmp.salaryCycle;
            logger.info("To Upload Welfare Data on salary Cycle:" + salaryCycle);
            if (empId === null || empId === undefined || empId === '') {
                logger.error("Error Location WelfareServices501")
                logger.error("The give empID is null,will skip");
                processed++;
                continue;
            }
            if (salaryCycle === null || salaryCycle === undefined || salaryCycle === '') {
                logger.error("Error Location WelfareServices502")
                logger.error("The give salaryCycle is null,will skip");
                processed++;
                continue;
            }

            Welfares.findOne({
                where: {
                    empId: empId,
                    salaryCycle: salaryCycle
                }
            }).then((WelData) => {
                if (WelData === null) {
                    EmpBasicServices.getEmpById(empId).then(emps => {
                        if (emps.length > 0) {
                            let emp = emps[0];
                            WeEmp.name = emp.name;
                            WeEmp.workerCategory = emp.workerCategory;
                            WeEmp.department = emp.department;
                            WeEmp.jobRole = emp.jobRole;
                            Welfares.create(WeEmp).then(crres => {
                                logger.info("Created new employee Welfare for emp: " + emp.empId + " , " + emp.name);
                                processed++;
                                if (processed === WelDataList.length) {
                                    logger.info("Upload Employee welfares  completed");
                                    rel({
                                        status: 200,
                                        data: [],
                                        message: "finished"
                                    })
                                }
                            })
                        } else {
                            logger.error("The given emp ID not exist :" + empId)
                        }
                    })
                } else {
                    Welfares.update(WeEmp, {
                        where: {
                            empId: empId,
                            salaryCycle: salaryCycle
                        }
                    }).then((updateRes) => {
                        processed++;
                        if (processed === WelDataList.length) {
                            logger.info("Upload Employee welfares  completed");
                            rel({
                                status: 200,
                                data: [],
                                message: "finished"
                            })
                        }
                    }, (err) => {
                        logger.error("Error Location WelfareServices505")
                        logger.error(err);
                        rel({
                            status: 500,
                            data: [],
                            message: err
                        });
                    }).catch(function (err) {
                        logger.error("Error Location WelfareServices504")
                        logger.error(err);
                        rel({
                            status: 500,
                            data: [],
                            message: err
                        });
                    })
                }
            });


        }
    })
}

WelfareServices.delete = function (empIds, salaryCycle) {
    return new Promise(function (rel, rej) {
        sequelize.query('DELETE FROM EmpWelfares WHERE empId IN(:empIds) and salaryCycle=:salaryCycle',
            { replacements: { empIds: empIds, salaryCycle: salaryCycle } }
        ).spread((results, metadata) => {
            rel({
                status: 200,
                data: [],
                message: "finished"
            })
        }).catch((err) => {
            logger.error("Error Location WelfareServices401")
            logger.error(err);
            rel({
                status: 500,
                data: [],
                message: err
            });
        });
    })
}

module.exports = WelfareServices;