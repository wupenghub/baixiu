var express = require('express');
var router = express.Router();
var DbUtils = require('../DbUtils');
var md5 = require('md5-node');
var apiUtils = require('./apiUtils.js');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs=require('fs');
let ejsExcel=require('ejsexcel');
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
router.post('/baixiu/getExcel',multipartMiddleware,function (req,res) {
   var tmp_path = req.files.templateFile.path;
   // fs.readFile(tmp_path,function (err,data) {
   //     console.log(data.toString());
   // });
    let exBuf=fs.readFileSync(tmp_path);
    ejsExcel.getExcelArr(exBuf).then(exlJson=>{
        console.log("************  read success:getExcelArr");
        let workBook=exlJson;
        let workSheets=workBook[0];
        console.log(workSheets.length)
        // workSheets.forEach((item,index)=>{
        //     console.log((index+1)+" row:"+item.join('    '));
        // })
    }).catch(error=>{
        console.log("************** had error!");
        console.log(error);
    });
    /*fs.rename(tmp_path, targetParth, function(err) {
        if (err) throw err;
        // 删除临时文件夹文件,
        fs.unlink(tmp_path, function() {
            if (err) throw err;
            res.send('File uploaded to: ' + targetParth + ' - ' + req.files.templateFile.size + ' bytes');
        });
    });*/

});
/*DbUtils.queryCisData("select * from ci_acct a where a.acct_id in ('0016510000','0016530000')",function (result) {
    console.log(result[0]['CIS_DIVISION']);
},function (err) {
    console.log(err);
});*/
module.exports = router;