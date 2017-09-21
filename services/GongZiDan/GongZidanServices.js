var log4js = require("log4js");
var logger = log4js.getLogger('HRMS-GongZiDan-Services');
logger.level = 'All';
var EmpSenServices = require('../empInfoServices/SensitiveEmpInfoServices');
var SalaryDetailServices = require("../SalaryDetails/SalaryDetails");
var EmpBasicServices = require('../empInfoServices/EmpBasicServices');
let SalaryModel = require("./Model/GongziDan");

var GZDServices = {};

GZDServices.getDataByCycle = function (salaryCycle) {
    return new Promise(function (rel, rej) {
        let salarylist = [];
        let empbasics = [];
        let empsens = [];
        let empsalarys = [];


        let dataReady = 0;
        let startGenerationData = function () {
            for (let i = 0; i < empbasics.length; i++) {
                let emp = empbasics[i];
                let empsen = null;
                let empsalary = null;
                
                let find = false;
                for (let k = 0; k < empsens.length && !find; k++) {
                    if (emp.empId === empsens[k].empId) {
                        empsen = empsens[k];
                        find = true;
                    }
                }

                if (!find) {
                    logger.error("Error Location GongZiDanServices005");
                    logger.error("For Employee ID:" + emp.empId + " do not have a employee sensitive data matching");

                    rej("For Employee ID:" + emp.empId + " do not have a employee sensitive data matching");
                    return;
                }

                find = false;

                for (let k = 0; k < empsalarys.length && !find; k++) {
                    if (emp.empId === empsalarys[k].empId) {
                        empsalary = empsalarys[k];
                        find = true;
                    }
                }

                if (!find) {
                    logger.error("Error Location GongZiDanServices006");
                    logger.error("For Employee ID:" + emp.empId + " do not have salary data matching");

                    rej("For Employee ID:" + emp.empId + " do not have salary data matching");
                    return;
                }

                let newgongzidan = SalaryModel(emp, empsen, empsalary);

                salarylist.push(newgongzidan);
            }
            rel(salarylist);
        }

        let workFlowControl = function () {
            if (dataReady >= 3) {
                startGenerationData();
            }
        }

        EmpBasicServices.getAllBasicEmpInfo().then(empbs => {
            empbasics = JSON.parse(JSON.stringify(empbs));
            dataReady++;
            workFlowControl();
        }).catch(err => {
            logger.error("Error Location GongZiDanServices001");
            rej(err);
        });

        EmpSenServices.getAllSensitiveEmpInfo().then(empseninfo => {
            empsens = JSON.parse(JSON.stringify(empseninfo));
            dataReady++;
            workFlowControl();
        }).catch(err => {
            logger.error("Error Location GongZiDanServices002");
            rej(err);
        });

        SalaryDetailServices.getDataByCycle(salaryCycle).then(sdata => {
            empsalarys = JSON.parse(JSON.stringify(sdata));
            dataReady++;
            workFlowControl();
        }, err => {
            logger.error("Error Location GongZiDanServices003");
            rej(err);
        }).catch(err => {
            logger.error("Error Location GongZiDanServices004");
            rej(err);
        });
    })
}

module.exports = GZDServices;