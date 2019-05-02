var fs = require('fs');
var xlsx = require('xlsx');
module.exports = {
    readExcel(path, sheetNameArr, readSuccess) {
        const workbook = xlsx.readFile(path);
        // 根据表名获取对应某张表
        const excelInfoData = {};
        for (var i = 0; i < sheetNameArr.length; i++) {
            const worksheet = workbook.Sheets[sheetNameArr[i]];
            var sheetInfo = xlsx.utils.sheet_to_json(worksheet);
            excelInfoData[sheetNameArr[i]] = sheetInfo;
        }
        readSuccess(excelInfoData);
    }

};