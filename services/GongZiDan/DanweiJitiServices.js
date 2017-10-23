var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-DanweiJiti-Services');
logger.level = 'All';
var SalaryDetailServices = require("../SalaryDetails/SalaryDetails");
const NonRegularEmployeeCategory = "非全日制人员";
var DanweiJitiService = {};
var DanweiJitiModel = require("./Model/DanweiJitiModel");


DanweiJitiService.Yanglaobaoxian = function (criteria) {
    return new Promise(function (rel, rej) {
        SalaryDetailServices.queryByCriteria(criteria).then(empSAs => {

            let resultList = [];
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];

                    if (emp.workerCategory === NonRegularEmployeeCategory) {
                        /**
                         * 非全日制员工，没有养老保险
                         */
                    } else {

                        let danweiJiti = DanweiJitiModel(emp, "养老保险");
                        danweiJiti.personal = parseFloat(emp.yanglaobaoxian);
                        danweiJiti.company = parseFloat(emp.qiyeYanglaobaoxian);
                        danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                        gatherObj.personal += danweiJiti.personal;
                        gatherObj.company += danweiJiti.company;
                        gatherObj.total += danweiJiti.total;
                        resultList.push(danweiJiti);
                    }
                }
                resultList.push(gatherObj);
                rel({
                    status: 200,
                    data: resultList,
                    message: ''
                })
            } else {
                logger.error("Error Location DanweiJiti002, SalaryDetailServices.queryByCriteria rejected");
                logger.error(empSAs.message);
                rej(empSAs);
            }

        }, rejObj => {
            logger.error("Error Location DanweiJiti001, SalaryDetailServices.queryByCriteria rejected");
            logger.error(rejObj.message);
            rej(rejObj);
        })
    })
}

DanweiJitiService.Shiyebaoxian = function (criteria) {
    return new Promise(function (rel, rej) {
        SalaryDetailServices.queryByCriteria(criteria).then(empSAs => {
            let resultList = [];
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];
                    if (emp.workerCategory === NonRegularEmployeeCategory) {
                        /**
                         * 非全日制员工，没有养老保险
                         */
                    } else {
                        let danweiJiti = DanweiJitiModel(emp, "失业保险");
                        danweiJiti.personal = parseFloat(emp.shiyebaoxian);
                        danweiJiti.company = parseFloat(emp.qiyeShiyebaoxian);
                        danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                        gatherObj.personal += danweiJiti.personal;
                        gatherObj.company += danweiJiti.company;
                        gatherObj.total += danweiJiti.total;
                        resultList.push(danweiJiti);
                    }
                }
                resultList.push(gatherObj);
                rel({
                    status: 200,
                    data: resultList,
                    message: ''
                })
            } else {
                logger.error("Error Location DanweiJiti002, SalaryDetailServices.queryByCriteria rejected");
                logger.error(empSAs.message);
                rej(empSAs);
            }
        }, rejObj => {
            logger.error("Error Location DanweiJiti002, SalaryDetailServices.queryByCriteria rejected");
            logger.error(rejObj.message);
            rej(rejObj);
        })
    })
}

DanweiJitiService.Yiliaobaoxian = function (criteria) {
    return new Promise(function (rel, rej) {
        SalaryDetailServices.queryByCriteria(criteria).then(empSAs => {
            let resultList = [];
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];
                    if (emp.workerCategory === NonRegularEmployeeCategory) {
                        /**
                         * 非全日制员工，没有养老保险
                         */
                    } else {
                        let danweiJiti = DanweiJitiModel(emp, "医疗保险");
                        danweiJiti.personal = parseFloat(emp.yiliaobaoxian);
                        danweiJiti.company = parseFloat(emp.qiyeYiliaobaoxian);
                        danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                        gatherObj.personal += danweiJiti.personal;
                        gatherObj.company += danweiJiti.company;
                        gatherObj.total += danweiJiti.total;
                        resultList.push(danweiJiti);
                    }
                }
                resultList.push(gatherObj);
                rel({
                    status: 200,
                    data: resultList,
                    message: ''
                })
            } else {
                logger.error("Error Location DanweiJiti002, SalaryDetailServices.queryByCriteria rejected");
                logger.error(empSAs.message);
                rej(empSAs);
            }
        }, rejObj => {
            logger.error("Error Location DanweiJiti003, SalaryDetailServices.queryByCriteria rejected");
            logger.error(rejObj.message);
            rej(rejObj);
        })
    })
}

DanweiJitiService.Zhufanggongjijin = function (criteria) {
    return new Promise(function (rel, rej) {
        SalaryDetailServices.queryByCriteria(criteria).then(empSAs => {
            let resultList = [];
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];
                    if (emp.workerCategory === NonRegularEmployeeCategory) {
                        /**
                         * 非全日制员工，没有养老保险
                         */
                    } else {
                        let danweiJiti = DanweiJitiModel(emp, "住房公积金");
                        danweiJiti.personal = parseFloat(emp.zhufanggongjijin);
                        danweiJiti.company = parseFloat(emp.qiyeZhufanggongjijin);
                        danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                        gatherObj.personal += danweiJiti.personal;
                        gatherObj.company += danweiJiti.company;
                        gatherObj.total += danweiJiti.total;
                        resultList.push(danweiJiti);
                    }
                }
                resultList.push(gatherObj);
                rel({
                    status: 200,
                    data: resultList,
                    message: ''
                })
            } else {
                logger.error("Error Location DanweiJiti002, SalaryDetailServices.queryByCriteria rejected");
                logger.error(empSAs.message);
                rej(empSAs);
            }
        }, rejObj => {
            logger.error("Error Location DanweiJiti004, SalaryDetailServices.queryByCriteria rejected");
            logger.error(rejObj.message);
            rej(rejObj);
        })
    })
}

DanweiJitiService.Nianjin = function (criteria) {
    return new Promise(function (rel, rej) {
        SalaryDetailServices.queryByCriteria(criteria).then(empSAs => {
            let resultList = [];
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];
                    if (emp.workerCategory === NonRegularEmployeeCategory) {
                        /**
                         * 非全日制员工，没有养老保险
                         */
                    } else {
                        let danweiJiti = DanweiJitiModel(emp, "年金");
                        danweiJiti.personal = parseFloat(emp.nianjin);
                        danweiJiti.company = parseFloat(emp.qiyeNianjin);
                        danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                        gatherObj.personal += danweiJiti.personal;
                        gatherObj.company += danweiJiti.company;
                        gatherObj.total += danweiJiti.total;
                        resultList.push(danweiJiti);
                    }
                }
                resultList.push(gatherObj);
                rel({
                    status: 200,
                    data: resultList,
                    message: ''
                })
            } else {
                logger.error("Error Location DanweiJiti002, SalaryDetailServices.queryByCriteria rejected");
                logger.error(empSAs.message);
                rej(empSAs);
            }
        }, rejObj => {
            logger.error("Error Location DanweiJiti005, SalaryDetailServices.queryByCriteria rejected");
            logger.error(rejObj.message);
            rej(rejObj);
        })
    })
}

module.exports = DanweiJitiService;