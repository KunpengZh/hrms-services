module.exports = function (empsa, comments) {
    return {
        empId: empsa.empId,
        name: empsa.name,
        personal: 0,
        company: 0,
        total: 0,
        comments: comments
    }
};