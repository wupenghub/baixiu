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
    var sql = 'select * from mnues m where m.model_id = 1 and m.del_flag = 0';
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
        var dataJson = {};
        dataJson.user = req.session.user[0];
        dataJson.dataJsonArr = array;
        req.session.userInfo = JSON.stringify(dataJson);
        res.render('index.html',{dataJson:JSON.stringify(dataJson)});
    });
});
//登录接口
router.post('/baixiu/login',function (req,res) {
    var emil = req.body.email;
    var password = req.body.password;
    var loginSql = 'select * from users u where u.`email` = "'+emil+'" and u.`password` = "'+password+'" ';
    DbUtils.queryData(loginSql,function (result) {
        var loginData = {};
        if(result&&result.length > 0){
            //登录成功，保存session
            req.session.user = result;
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
//退出登录
router.get('/baixiu/loginout',function (req,res) {
    req.session.destroy();
    //重定向到主页
    res.redirect(301, '/');
});
//菜单管理
router.get('/baixiu/MenuManger',function (req,res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req,res);
    if(!user){
        //session不存在，则需要直接返回登录界面
        return;
    }
    res.render('mnueManger.html',{dataJsonArr:req.session.userInfo});
});
//菜单管理->菜单删除
router.get('/baixiu/menuDelete',function (req,res) {
   var sql = 'select *  from mnues m where m.parent_id = '+req.query.id+' and m.del_flag = 0';
    DbUtils.queryData(sql,function (result) {
       if(result.length == 0){
            //查不出结果说明满足删除条件，执行修改数据库的sql
           var updateSql = 'update mnues m set m.del_flag = 1 where m.id = '+req.query.id;
           DbUtils.queryData(updateSql,function (updateResult) {
               var sql = 'select * from mnues m where m.model_id = 1 and m.del_flag = 0';
               DbUtils.queryData(sql,function (queryResult) {
                   for(var i = 0;i<queryResult.length;i++){
                       utils.addList(queryResult,queryResult[i]);
                   }
                   // 将result中所有节点parent_id值不为空的给踢出掉
                   var array = [];
                   for(var i = 0;i<queryResult.length;i++){
                       if(!queryResult[i]['parent_id']){
                           array.push(queryResult[i]);
                       }
                   }
                   var sessionJson = {};
                   sessionJson.user = req.session.user[0];
                   sessionJson.dataJsonArr = array;
                   req.session.userInfo = JSON.stringify(sessionJson);
                   var dataJson = {};
                   dataJson.dataJsonArr = array;
                   dataJson.status = 0;
                   dataJson.desc = '成功';
                   res.json(dataJson);
               });
           });
       }else{
           //可以查出结果集，说明改节点为父节点，并且对应的部分子节点没有删除完
           var errResult = {};
           errResult.status = 1;
           errResult.desc = '该目录下的部分子目录未被删除，请先删除对应的子目录';
           res.json(errResult);
       }
    });
});
//菜单管理->菜单添加与修改
router.post('/baixiu/sonMnueAdd',function (req,res) {
    //先判断此id在数据库中是否存在
    var querySql = 'select count(1) count from mnues m where m.id = '+req.body.id+' and m.del_flag = 0';
    DbUtils.queryData(querySql,function (result) {
        var data = {};
        if(result && result[0].count > 0 ){
            //查询有此记录，执行添加目录sql
            var inserSql = '';
            if(req.body.isUpdate == 'N') {
                inserSql = 'insert into mnues value(null,1,"' + req.body.mnueDesc + '",' + req.body.id + ',"' + req.body.url + '",0)';
            }else{
                inserSql = 'UPDATE mnues m set m.mnue_desc = "'+ req.body.mnueDesc +'",m.parent_id = '+req.body.parentId+',m.url="'+req.body.url+'" where m.id ='+req.body.id;
            }
            console.log(inserSql);
            DbUtils.queryData(inserSql,function (result) {
                data.status = 0;
                data.desc= req.body.isUpdate == 'N'?'添加成功':'修改成功';
                var sql = 'select * from mnues m where m.model_id = 1 and m.del_flag = 0';
                DbUtils.queryData(sql,function (queryResult) {
                    for(var i = 0;i<queryResult.length;i++){
                        utils.addList(queryResult,queryResult[i]);
                    }
                    // 将result中所有节点parent_id值不为空的给踢出掉
                    var array = [];
                    for(var i = 0;i<queryResult.length;i++){
                        if(!queryResult[i]['parent_id']){
                            array.push(queryResult[i]);
                        }
                    }
                    var sessionJson = {};
                    sessionJson.user = req.session.user[0];
                    sessionJson.dataJsonArr = array;
                    req.session.userInfo = JSON.stringify(sessionJson);
                    data.dataJsonArr = array;
                    res.json(data);
                });
            });
        }else{
            //查询无记录
            data.status = 1;
            data.desc='数据库中无此目录';
            res.json(data);
        }
    });
});
module.exports = router;