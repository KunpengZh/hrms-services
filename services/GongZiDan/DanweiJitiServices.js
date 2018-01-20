var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-DanweiJiti-Services');
logger.level = 'All';
var SalaryDetailServices = require("../SalaryDetails/SalaryDetails");
const NonRegularEmployeeCategory = "非全日制人员";
var DanweiJitiService = {};
var DanweiJitiModel = require("./Model/DanweiJitiModel");
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
var fixvalue = function (obj) {
    obj.personal = keepTwoDecimalFull(obj.personal);
    obj.company = keepTwoDecimalFull(obj.company);
    obj.total = keepTwoDecimalFull(obj.total);
    return obj;
}

DanweiJitiService.Yanglaobaoxian = function (criteria) {
    return new Promise(function (rel, rej) {
        SalaryDetailServices.queryByCriteria(criteria).then(empSAs => {

            let resultList = [];
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '', salaryCycle: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];

                    // if (emp.workerCategory === NonRegularEmployeeCategory) {
                    //     /**
                    //      * 非全日制员工，没有养老保险
                    //      */
                    // } else {

                    //     let danweiJiti = DanweiJitiModel(emp, "养老保险");
                    //     danweiJiti.personal = parseFloat(emp.yanglaobaoxian);
                    //     danweiJiti.company = parseFloat(emp.qiyeYanglaobaoxian);
                    //     danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                    //     gatherObj.personal += danweiJiti.personal;
                    //     gatherObj.company += danweiJiti.company;
                    //     gatherObj.total += danweiJiti.total;
                    //     resultList.push(fixvalue(danweiJiti));
                    // }

                    let isDataExist = false;
                    for (let k = 0; k < resultList.length; k++) {
                        if (resultList[k].empId === emp.empId) {

                            resultList[k].personal += parseFloat(emp.yanglaobaoxian);
                            resultList[k].company += parseFloat(emp.qiyeYanglaobaoxian);
                            resultList[k].total = resultList[k].personal + resultList[k].company;
                            gatherObj.personal += parseFloat(emp.yanglaobaoxian);
                            gatherObj.company += parseFloat(emp.qiyeYanglaobaoxian);
                            isDataExist = true;
                            break;
                        }
                    }

                    if (!isDataExist) {
                        let danweiJiti = DanweiJitiModel(emp, "养老保险");
                        danweiJiti.personal = parseFloat(emp.yanglaobaoxian);
                        danweiJiti.company = parseFloat(emp.qiyeYanglaobaoxian);
                        danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                        resultList.push(danweiJiti);
                        gatherObj.personal += danweiJiti.personal;
                        gatherObj.company += danweiJiti.company;
                    }
                }
                gatherObj.total = gatherObj.personal + gatherObj.company;
                resultList = resultList.map(function (obj) {
                    return fixvalue(obj);
                })
                resultList.push(fixvalue(gatherObj));
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
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '', salaryCycle: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];
                    // if (emp.workerCategory === NonRegularEmployeeCategory) {
                    //     /**
                    //      * 非全日制员工，没有养老保险
                    //      */
                    // } else {
                    //     let danweiJiti = DanweiJitiModel(emp, "失业保险");
                    //     danweiJiti.personal = parseFloat(emp.shiyebaoxian);
                    //     danweiJiti.company = parseFloat(emp.qiyeShiyebaoxian);
                    //     danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                    //     gatherObj.personal += danweiJiti.personal;
                    //     gatherObj.company += danweiJiti.company;
                    //     gatherObj.total += danweiJiti.total;
                    //     resultList.push(fixvalue(danweiJiti));
                    // }

                    let isDataExist = false;
                    for (let k = 0; k < resultList.length; k++) {
                        if (resultList[k].empId === emp.empId) {

                            resultList[k].personal += parseFloat(emp.shiyebaoxian);
                            resultList[k].company += parseFloat(emp.qiyeShiyebaoxian);
                            resultList[k].total = resultList[k].personal + resultList[k].company;
                            gatherObj.personal += parseFloat(emp.shiyebaoxian);
                            gatherObj.company += parseFloat(emp.qiyeShiyebaoxian);
                            isDataExist = true;
                            break;
                        }
                    }

                    if (!isDataExist) {
                        let danweiJiti = DanweiJitiModel(emp, "失业保险");
                        danweiJiti.personal = parseFloat(emp.shiyebaoxian);
                        danweiJiti.company = parseFloat(emp.qiyeShiyebaoxian);
                        danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                        resultList.push(danweiJiti);
                        gatherObj.personal += danweiJiti.personal;
                        gatherObj.company += danweiJiti.company;
                    }

                }
                gatherObj.total = gatherObj.personal + gatherObj.company;
                resultList = resultList.map(function (obj) {
                    return fixvalue(obj);
                })
                resultList.push(fixvalue(gatherObj));
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
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '', salaryCycle: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];
                    if (emp.workerCategory === NonRegularEmployeeCategory) {
                        /**
                         * 非全日制员工，没有养老保险
                         */
                    } else {

                        let isDataExist = false;
                        for (let k = 0; k < resultList.length; k++) {
                            if (resultList[k].empId === emp.empId) {

                                resultList[k].personal += parseFloat(emp.yiliaobaoxian);
                                resultList[k].company += parseFloat(emp.qiyeYiliaobaoxian);
                                resultList[k].total = resultList[k].personal + resultList[k].company;
                                gatherObj.personal += parseFloat(emp.yiliaobaoxian);
                                gatherObj.company += parseFloat(emp.qiyeYiliaobaoxian);
                                isDataExist = true;
                                break;
                            }
                        }

                        if (!isDataExist) {
                            let danweiJiti = DanweiJitiModel(emp, "医疗保险");
                            danweiJiti.personal = parseFloat(emp.yiliaobaoxian);
                            danweiJiti.company = parseFloat(emp.qiyeYiliaobaoxian);
                            danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                            resultList.push(danweiJiti);
                            gatherObj.personal += danweiJiti.personal;
                            gatherObj.company += danweiJiti.company;
                        }
                    }
                }
                gatherObj.total = gatherObj.personal + gatherObj.company;
                resultList = resultList.map(function (obj) {
                    return fixvalue(obj);
                })
                resultList.push(fixvalue(gatherObj));
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
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '', salaryCycle: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];
                    if (emp.workerCategory === NonRegularEmployeeCategory) {
                        /**
                         * 非全日制员工，没有养老保险
                         */
                    } else {

                        let isDataExist = false;
                        for (let k = 0; k < resultList.length; k++) {
                            if (resultList[k].empId === emp.empId) {

                                resultList[k].personal += parseFloat(emp.zhufanggongjijin);
                                resultList[k].company += parseFloat(emp.qiyeZhufanggongjijin);
                                resultList[k].total = resultList[k].personal + resultList[k].company;
                                gatherObj.personal += parseFloat(emp.zhufanggongjijin);
                                gatherObj.company += parseFloat(emp.qiyeZhufanggongjijin);
                                isDataExist = true;
                                break;
                            }
                        }

                        if (!isDataExist) {
                            let danweiJiti = DanweiJitiModel(emp, "住房公积金");
                            danweiJiti.personal = parseFloat(emp.zhufanggongjijin);
                            danweiJiti.company = parseFloat(emp.qiyeZhufanggongjijin);
                            danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                            resultList.push(danweiJiti);
                            gatherObj.personal += danweiJiti.personal;
                            gatherObj.company += danweiJiti.company;
                        }



                    }
                }
                gatherObj.total = gatherObj.personal + gatherObj.company;
                resultList = resultList.map(function (obj) {
                    return fixvalue(obj);
                })
                resultList.push(fixvalue(gatherObj));
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
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '', salaryCycle: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];
                    // if (emp.workerCategory === NonRegularEmployeeCategory) {
                    //     /**
                    //      * 非全日制员工，没有养老保险
                    //      */
                    // } else {
                    //     let danweiJiti = DanweiJitiModel(emp, "年金");
                    //     danweiJiti.personal = parseFloat(emp.nianjin);
                    //     danweiJiti.company = parseFloat(emp.qiyeNianjin);
                    //     danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                    //     gatherObj.personal += danweiJiti.personal;
                    //     gatherObj.company += danweiJiti.company;
                    //     gatherObj.total += danweiJiti.total;
                    //     resultList.push(fixvalue(danweiJiti));
                    // }
                    let isDataExist = false;
                    for (let k = 0; k < resultList.length; k++) {
                        if (resultList[k].empId === emp.empId) {

                            resultList[k].personal += parseFloat(emp.nianjin);
                            resultList[k].company += parseFloat(emp.qiyeNianjin);
                            resultList[k].total = resultList[k].personal + resultList[k].company;
                            gatherObj.personal += parseFloat(emp.nianjin);
                            gatherObj.company += parseFloat(emp.qiyeNianjin);
                            isDataExist = true;
                            break;
                        }
                    }

                    if (!isDataExist) {
                        let danweiJiti = DanweiJitiModel(emp, "年金");
                        danweiJiti.personal = parseFloat(emp.nianjin);
                        danweiJiti.company = parseFloat(emp.qiyeNianjin);
                        danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                        resultList.push(danweiJiti);
                        gatherObj.personal += danweiJiti.personal;
                        gatherObj.company += danweiJiti.company;
                    }
                }
                gatherObj.total = gatherObj.personal + gatherObj.company;
                resultList = resultList.map(function (obj) {
                    return fixvalue(obj);
                })
                resultList.push(fixvalue(gatherObj));
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



DanweiJitiService.Shengyubaoxian = function (criteria) {
    return new Promise(function (rel, rej) {
        SalaryDetailServices.queryByCriteria(criteria).then(empSAs => {
            let resultList = [];
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '', salaryCycle: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];
                    // if (emp.workerCategory === NonRegularEmployeeCategory) {
                    //     /**
                    //      * 非全日制员工，没有养老保险
                    //      */
                    // } else {
                    //     let danweiJiti = DanweiJitiModel(emp, "生育保险");
                    //     danweiJiti.personal = 0;
                    //     danweiJiti.company = parseFloat(emp.shengyubaoxian);
                    //     danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                    //     gatherObj.personal += danweiJiti.personal;
                    //     gatherObj.company += danweiJiti.company;
                    //     gatherObj.total += danweiJiti.total;
                    //     resultList.push(fixvalue(danweiJiti));
                    // }
                    let isDataExist = false;
                    for (let k = 0; k < resultList.length; k++) {
                        if (resultList[k].empId === emp.empId) {

                            //resultList[k].personal += parseFloat(emp.shengyubaoxian);
                            resultList[k].company += parseFloat(emp.shengyubaoxian);
                            resultList[k].total = resultList[k].personal + resultList[k].company;
                            //gatherObj.personal += parseFloat(emp.shengyubaoxian);
                            gatherObj.company += parseFloat(emp.shengyubaoxian);
                            isDataExist = true;
                            break;
                        }
                    }

                    if (!isDataExist) {
                        let danweiJiti = DanweiJitiModel(emp, "生育保险");
                        danweiJiti.personal = 0;
                        danweiJiti.company = parseFloat(emp.shengyubaoxian);
                        danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                        resultList.push(danweiJiti);
                        //gatherObj.personal += danweiJiti.personal;
                        gatherObj.company += danweiJiti.company;
                    }

                }
                gatherObj.total = gatherObj.personal + gatherObj.company;
                resultList = resultList.map(function (obj) {
                    return fixvalue(obj);
                })
                resultList.push(fixvalue(gatherObj));
                rel({
                    status: 200,
                    data: resultList,
                    message: ''
                })
            } else {
                logger.error("Error Location DanweiJiti Services, Shengyubaoxian ");
                logger.error(empSAs.message);
                rej(empSAs);
            }
        }, rejObj => {
            logger.error("Error Location DanweiJiti Services, Shengyubaoxian 2");
            logger.error(rejObj.message);
            rej(rejObj);
        })
    })
}

DanweiJitiService.Gongshangbaoxian = function (criteria) {
    return new Promise(function (rel, rej) {
        SalaryDetailServices.queryByCriteria(criteria).then(empSAs => {
            let resultList = [];
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '', salaryCycle: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];
                    // if (emp.workerCategory === NonRegularEmployeeCategory) {
                    //     /**
                    //      * 非全日制员工，没有养老保险
                    //      */
                    // } else {
                    //     let danweiJiti = DanweiJitiModel(emp, "工伤保险");
                    //     danweiJiti.personal = 0;
                    //     danweiJiti.company = parseFloat(emp.gongshangbaoxian);
                    //     danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                    //     gatherObj.personal += danweiJiti.personal;
                    //     gatherObj.company += danweiJiti.company;
                    //     gatherObj.total += danweiJiti.total;
                    //     resultList.push(fixvalue(danweiJiti));
                    // }
                    let isDataExist = false;
                    for (let k = 0; k < resultList.length; k++) {
                        if (resultList[k].empId === emp.empId) {

                            //resultList[k].personal += parseFloat(emp.shengyubaoxian);
                            resultList[k].company += parseFloat(emp.gongshangbaoxian);
                            resultList[k].total = resultList[k].personal + resultList[k].company;
                            //gatherObj.personal += parseFloat(emp.shengyubaoxian);
                            gatherObj.company += parseFloat(emp.gongshangbaoxian);
                            isDataExist = true;
                            break;
                        }
                    }

                    if (!isDataExist) {
                        let danweiJiti = DanweiJitiModel(emp, "工伤保险");
                        danweiJiti.personal = 0;
                        danweiJiti.company = parseFloat(emp.gongshangbaoxian);
                        danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                        resultList.push(danweiJiti);
                        //gatherObj.personal += danweiJiti.personal;
                        gatherObj.company += danweiJiti.company;
                    }

                }
                gatherObj.total = gatherObj.personal + gatherObj.company;
                resultList = resultList.map(function (obj) {
                    return fixvalue(obj);
                })
                resultList.push(fixvalue(gatherObj));
                rel({
                    status: 200,
                    data: resultList,
                    message: ''
                })
            } else {
                logger.error("Error Location DanweiJiti Services, Gongshangbaoxian ");
                logger.error(empSAs.message);
                rej(empSAs);
            }
        }, rejObj => {
            logger.error("Error Location DanweiJiti Services, Gongshangbaoxian 2");
            logger.error(rejObj.message);
            rej(rejObj);
        })
    })
}

DanweiJitiService.Buchongyiliaobaoxian = function (criteria) {
    return new Promise(function (rel, rej) {
        SalaryDetailServices.queryByCriteria(criteria).then(empSAs => {
            let resultList = [];
            let gatherObj = DanweiJitiModel({ empId: '汇总:', name: '', salaryCycle: '' }, '合计汇总');
            if (empSAs.status === 200) {
                empSAs = empSAs.data;
                for (let i = 0; i < empSAs.length; i++) {
                    let emp = empSAs[i];
                    if (emp.workerCategory === NonRegularEmployeeCategory) {
                        /**
                         * 非全日制员工，没有补充医疗保险
                         */
                    } else {

                        let isDataExist = false;
                        for (let k = 0; k < resultList.length; k++) {
                            if (resultList[k].empId === emp.empId) {

                                //resultList[k].personal += parseFloat(emp.shengyubaoxian);
                                resultList[k].company += parseFloat(emp.buchongyiliaobaoxian);
                                resultList[k].total = resultList[k].personal + resultList[k].company;
                                //gatherObj.personal += parseFloat(emp.shengyubaoxian);
                                gatherObj.company += parseFloat(emp.buchongyiliaobaoxian);
                                isDataExist = true;
                                break;
                            }
                        }

                        if (!isDataExist) {
                            let danweiJiti = DanweiJitiModel(emp, "补充医疗保险");
                            danweiJiti.personal = 0;
                            danweiJiti.company = parseFloat(emp.buchongyiliaobaoxian);
                            danweiJiti.total = danweiJiti.personal + danweiJiti.company;
                            resultList.push(danweiJiti);
                            //gatherObj.personal += danweiJiti.personal;
                            gatherObj.company += danweiJiti.company;
                        }
                    }

                }
                gatherObj.total = gatherObj.personal + gatherObj.company;
                resultList = resultList.map(function (obj) {
                    return fixvalue(obj);
                })
                resultList.push(fixvalue(gatherObj));
                rel({
                    status: 200,
                    data: resultList,
                    message: ''
                })
            } else {
                logger.error("Error Location DanweiJiti Services, Buchongyiliaobaoxian ");
                logger.error(empSAs.message);
                rej(empSAs);
            }
        }, rejObj => {
            logger.error("Error Location DanweiJiti Services, Buchongyiliaobaoxian 2");
            logger.error(rejObj.message);
            rej(rejObj);
        })
    })
}

module.exports = DanweiJitiService;