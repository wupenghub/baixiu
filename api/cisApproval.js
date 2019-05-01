var express = require('express');
var router = express.Router();
var DbUtils = require('../DbUtils');
var md5 = require('md5-node');
var apiUtils = require('./apiUtils.js');
var fs=require('fs');
//下载模板
router.post('/baixiu/cisTemplateDownLoad',function (req,res) {
    var file = './' + req.body.filename;
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',//告诉浏览器这是一个二进制文件
        'Content-Disposition': 'attachment; filename=' + encodeURI(req.body.filename),//告诉浏览器这是一个需要下载的文件
    });//设置响应头
    var readStream = fs.createReadStream(file);//得到文件输入流
    readStream.on('data', (chunk) => {
        res.write(chunk, 'binary');//文档内容以二进制的格式写到response的输出流
    });
    readStream.on('end', () => {
        res.end();
    });

});
router.post('/baixiu/getExcel',function (req,res) {
   console.log(req.body);
});
/*DbUtils.queryCisData("select * from ci_acct a where a.acct_id in ('0016510000','0016530000')",function (result) {
    console.log(result[0]['CIS_DIVISION']);
},function (err) {
    console.log(err);
});*/
module.exports = router;