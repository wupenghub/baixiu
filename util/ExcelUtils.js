var fs = require('fs');
var xlsx = require('xlsx');
var ejsExcel = require('ejsexcel');
var path = require('path');
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
    },
    writeExcel(data,fileName) {
        var sheetNames = [];
        var sheets = [];
        console.log(JSON.stringify(data))
        for (var item in data) {
            sheetNames.push(item);
            sheets.push(xlsx.utils.aoa_to_sheet(data[item]));
        }
        this.sheet2blob(sheets, sheetNames,fileName);
    },
    // 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
    sheet2blob(sheets, sheetNames,fileName) {
        var workbook = {
            SheetNames: sheetNames,
            Sheets: {}
        };
        for (var i = 0; i < sheets.length; i++) {
            workbook.Sheets[sheetNames[i]] = sheets[i];
        }
        // 生成excel的配置项
        var wopts = {
            bookType: 'xlsx', // 要生成的文件类型
            bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
            type: 'binary'
        };
        xlsx.writeFile(workbook, fileName);
    },
    renderExcel(result,success,error,outPut){
        //判断是否有bxFile文件夹
        let dirpath = path.join(__dirname,'../bxFile');
        if(!fs.existsSync(dirpath)){
            fs.mkdirSync(dirpath);
        }
        //获取Excel模板的buffer对象
        var exlBuf = fs.readFileSync(path.join(__dirname,'../差旅费计算表.xlsx'));
        ejsExcel.renderExcel(exlBuf,result).then(function (exlBuf2) {
            fs.writeFile(path.join(__dirname,'../bxFile/'+outPut),exlBuf2,function (err) {
                if(!err){
                    success();
                }else{
                    error(err);
                }
            });
        }).catch(function (err) {

        })
    }
};