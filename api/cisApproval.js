var express = require('express');
var router = express.Router();
var DbUtils = require('../DbUtils');
var md5 = require('md5-node');
var apiUtils = require('./apiUtils.js');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
let excelUtils = require('../util/ExcelUtils.js');
var cisUtils = require('../util/CisUtils.js');
var async = require("async");
//下载模板
router.post('/baixiu/cisTemplateDownLoad', function (req, res) {
    exportFile(res, req.body.filename);
});
router.post('/baixiu/getExcel', multipartMiddleware, function (req, res) {
    var tmp_path = req.files.templateFile.path;
    var cisDivCode = req.body.cisdiv;
    var cisDivDesc = req.body.desc;
    var userArray = [];//定义一个人员数组，将人员放置在此集合中
    //['用户组权限','调度组','待办事项角色']
    var sheetNames = ['用户组权限', '调度组', '待办事项角色'];
    //添加人员并且配置人员的用户组权限，调度组，待办事项角色
    excelUtils.readExcel(tmp_path, sheetNames, function (data) {
        for (var item in data) {
            if (item == '用户组权限') {
                cisUtils.addUserGroupPermissions(userArray, data[item], cisDivDesc);
            }
            if (item == '调度组') {
                cisUtils.addUserDispAndRoll(userArray, data[item], cisDivDesc, true);
            }
            if (item == '待办事项角色') {
                cisUtils.addUserDispAndRoll(userArray, data[item], cisDivDesc, false);
            }
        }
    });
    //生成用户的cisId
    cisUtils.generateCisId(userArray, cisDivCode);
    cisUtils.matchCode(userArray,cisDivDesc,function () {
        var data = cisUtils.exportCisConfig(userArray);
        cisUtils.test(userArray);
        excelUtils.writeExcel(data, cisDivDesc + "人员配置.xlsx");
    });
    // cisUtils.test(userArray);
    //导出用户组权限，调度组，待办事项角色
    // var data = cisUtils.exportCisConfig(userArray);
    // excelUtils.writeExcel(data, cisDivDesc + "人员配置.xlsx");
    //将人员对应的调度组，用户组权限，待办事项角色中文与英文进行对应
  /*  setTimeout(function () {
        exportFile(res,cisDivDesc + "人员配置.xlsx");
    },1000);*/
    res.json({status:1})
    // var b = exportFile(res,cisDivDesc + "人员配置.xlsx");
    // async.series([a, b]);
});

function exportFile(res, fileName) {
    var file = './' + fileName;
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',//告诉浏览器这是一个二进制文件
        'Content-Disposition': 'attachment; filename=' + encodeURI(fileName),//告诉浏览器这是一个需要下载的文件
    });//设置响应头
    var readStream = fs.createReadStream(file);//得到文件输入流
    readStream.on('data', (chunk) => {
        res.write(chunk, 'binary');//文档内容以二进制的格式写到response的输出流
    });
    readStream.on('end', () => {
        res.end();
    });
    /*var file = './' + fileName;
    fs.exists(file, function (exists) {
        if (exists) {
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',//告诉浏览器这是一个二进制文件
                'Content-Disposition': 'attachment; filename=' + encodeURI(fileName),//告诉浏览器这是一个需要下载的文件
            });//设置响应头
            var readStream = fs.createReadStream(file);//得到文件输入流
            readStream.on('data', (chunk) => {
                res.write(chunk, 'binary');//文档内容以二进制的格式写到response的输出流
            });
            readStream.on('end', () => {
                res.end();
            });
        }
        else {
            res.end('文件还未生成，请稍等');
        }

    });*/
}


module.exports = router;