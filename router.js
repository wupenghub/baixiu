var express = require('express');
var router = express.Router();
var DbUtils = require('./DbUtils');
var utils = require('./util/utils');
//访问管理后台首页
router.get('/', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req,res);
    if(!user){
        //session不存在，则需要直接返回登录界面
        return;
    }
    // 2、查询对应的菜单数据
    var sql = 'select * from mnues m where m.model_id = 1';
    DbUtils.queryData(sql,function (result) {
        for(var i = 0;i<result.length;i++){
            utils.addList(result,result[i]);
        }
        // 将result中所有节点parent_id值不为空的给踢出掉
        var array = [];
        for(var i = 0;i<result.length;i++){
            if(!result[i]['parent_id']){
                array.push(result[i]);
            }
        }
        var dataJsonArr = JSON.stringify(array);
        res.render('index.html',{dataJsonArr:dataJsonArr});
    });
});
router.post('/baixiu/login',function (req,res) {
    var emil = req.body.email;
    var password = req.body.password;
    console.log(emil+"======="+password);
    var loginSql = 'select * from users u where u.`email` = "'+emil+'" and u.`password` = "'+password+'" ';
    DbUtils.queryData(loginSql,function (result) {
        var loginData = {};
        if(result&&result.length > 0){
            //登录成功，保存session
            req.session.user = result;
            //冲定向到主页
            // res.redirect(301, '/');
            loginData.login_state = '0';
            loginData.login_desc = '成功';
            loginData.user = result[0];
        }else{
            //未找到用户
            loginData.login_state = '1';
            loginData.login_desc = '失败';
            loginData.user = null;
        }
        res.json(loginData);
    });
});
module.exports = router;