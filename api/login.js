var express = require('express');
var router = express.Router();
var DbUtils = require('../DbUtils');
var md5 = require('md5-node');
var apiUtils = require('./apiUtils.js');
router.post('/leTao/login',function (req,res) {
    var userName = req.body.userName;
    var password = req.body.password;
    var returnData = {};
    if(!userName || !password){
        returnData.status = 1;
        returnData.desc = '请确认用户名和密码是否输入';
        res.status(200).json(returnData);
        return;
    }
    var loginSql = 'SELECT\n' +
        '\t*\n' +
        'FROM\n' +
        '\tletao_users l\n' +
        'WHERE\n' +
        '\tl.`email` = "'+userName+'"\n' +
        'AND l.`password` = "'+password+'"\n' +
        'AND l.`status` = 0';
    DbUtils.queryData(loginSql,function (result) {
        if(result.length > 0){
            returnData.status = 0;
            returnData.desc = '登录成功';
            returnData.loginUser = result[0];
            req.session[userName] = returnData.loginUser;
            console.log('登录：'+JSON.stringify(req.session['wupengforIT@163.com']));
        }else{
            returnData.status = 1;
            returnData.desc = '用户名或密码不存在！';
        }
        res.status(200).json(returnData);
    },function (error) {

    });
});
module.exports = router;