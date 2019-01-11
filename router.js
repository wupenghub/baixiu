var express = require('express');
var router = express.Router();
var DbUtils = require('./DbUtils');
var utils = require('./util/utils');
var mail = require('./util/mail');
var md5=require('md5-node');
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
    password = md5(md5(password))+'p~1i';
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
//忘记密码
router.get('/baixiu/forgetPwd',function (req,res) {
    res.render('forgetPwd.html');
});
//重置密码接口
router.get('/baixiu/resetPwd',function (req,res) {
    var html = '<p>尊敬的'+req.query.email+'您好，欢迎使用密码找回功能,请点击<a href="http://10.1.16.162:3000/baixiu/pwdReset?userName='+req.query.email+'">密码重置</a>链接进行密码重置</p>';
    mail.sendMain(req.query.email,'找回密码',html,function (data) {
        res.json(data);
    });
});
//修改密码界面路由
router.get('/baixiu/pwdReset',function (req,res) {
    var userName = req.query.userName;
    DbUtils.queryData('select * from users u where u.email = "'+userName+'"',function (result) {
        res.render('resetpwd.html',{user:result[0]});
    });
});
//修改密码路由
router.post('/baixiu/pwdUpdate',function (req,res) {
    var userName = req.body.userName;
    var passWord = req.body.passWord;
    passWord = md5(md5(passWord))+'p~1i';
    var updateSql = 'UPDATE users u set u.`password` = "'+passWord+'" WHERE u.email = "'+userName+'"';
    DbUtils.queryData(updateSql,function (result) {
        console.log(updateSql);
        console.log(result);
    });
});
//验证用户名是否存在
router.post('/baixiu/isExitUser',function (req,res) {
    var userName = req.body.userName;
    var querySql = 'select * from users u where u.email ="'+userName+'"';
    DbUtils.queryData(querySql,function (result) {
        var returnData = {};
       if(result && result.length>0){
           returnData.status = 0;
           returnData.desc = '查询存有此用户';
           returnData.user = result[0];
       }else{
           returnData.status = 1;
           returnData.desc = '查询不存在此用户';
       }
       res.json(returnData);
    });
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
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req,res);
    if(!user){
        //session不存在，则需要直接返回登录界面
        return;
    }
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
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req,res);
    if(!user){
        //session不存在，则需要直接返回登录界面
        return;
    }
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
//功能->文章->文章发表
router.get('/baixiu/articlePublished',function (req,res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req,res);
    if(!user){
        return;
    }
    res.render('post-add.html',{dataJsonArr:req.session.userInfo});
});
//功能->文章->文章审批
router.get('/baixiu/articleApproval',function (req,res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req,res);
    if(!user){
        return;
    }
    res.render('posts.html',{dataJsonArr:req.session.userInfo});
});
//获取文章审批的列表
router.get('/baixiu/getArticleApprovalList',function (req,res) {
    var returnObj = {};
    returnObj.returnData = {categoryId:req.query.categoryId,postId:req.query.postId,offset:req.query.offset,pageSize:req.query.pageSize};
    var queryCountSql = 'SELECT\n' +
        '\tcount(1) "count"\n' +
        'FROM\n' +
        '\tposts p\n' +
        'LEFT JOIN users u ON p.user_id = u.id\n' +
        'LEFT JOIN categories c ON p.category_id = c.id\n' +
        'LEFT JOIN baixiu_status_l s ON s.baixiu_key = p.`status`'+
        ' where p.del_flag = 0';
    if(req.query.categoryId != 'all'){
        queryCountSql += ' AND c.slug = "'+req.query.categoryId+'" '
    }
    if(req.query.postId != 'all'){
        queryCountSql += ' AND s.baixiu_key = "'+req.query.postId+'" '
    }
    DbUtils.queryData(queryCountSql,function (result) {
        if(result&&result[0].count != '0'){
            returnObj.totalCount = result[0].count;
            var querySql = 'SELECT\n' +
                '\tp.title "title",\n' +
                '\t(CASE\n' +
                'WHEN u.nickname IS NULL THEN\n' +
                '\t\'匿名\'\n' +
                'ELSE\n' +
                '\tu.nickname\n' +
                'END ) AS \'nickname\',\n' +
                ' c.`name` "categoryName",\n' +
                'DATE_FORMAT(p.created,"%Y-%m-%d") "createTime",'+
                ' p.id "id",\n' +
                's.baixiu_key "statuskey",\n'+
                ' s.baixiu_val "statusVal"\n' +
                'FROM\n' +
                '\tposts p\n' +
                'LEFT JOIN users u ON p.user_id = u.id\n' +
                'LEFT JOIN categories c ON p.category_id = c.id\n' +
                'LEFT JOIN baixiu_status_l s ON s.baixiu_key = p.`status`\n' +
                'where 1 = 1\n' +
                ' and p.del_flag = 0';

            if(req.query.categoryId != 'all'){
                querySql += ' AND c.slug = "'+req.query.categoryId+'" '
            }
            if(req.query.postId != 'all'){
                querySql += ' AND s.baixiu_key = "'+req.query.postId+'" '
            }
            querySql += ' ORDER BY p.created DESC\n';
            querySql += ' LIMIT '+((req.query.offset-1)*req.query.pageSize)+',\n' + req.query.pageSize;
            DbUtils.queryData(querySql,function (resultList) {
                if(resultList&&resultList.length>0) {
                    returnObj.getlist_status = 0;
                    returnObj.getlist_desc = '获取数据成功';
                    returnObj.postsJsonArray = resultList;
                }else{
                    returnObj.getlist_status = 1;
                    returnObj.getlist_desc = '未获取到文章审批信息';
                }
                var queryStates = 'SELECT\n' +
                    '\tb.baixiu_key "key",\n' +
                    '\tb.baixiu_val "val"\n' +
                    'FROM\n' +
                    '\tbaixiu_status_l b';
                DbUtils.queryData(queryStates,function (statesResult) {
                    if(statesResult){
                        returnObj.status_status = 0;
                        returnObj.status_desc = '状态获取成功';
                        returnObj.statusJsonArr = statesResult;
                    }else{
                        returnObj.status_status = 1;
                        returnObj.status_desc = '状态信息获取失败';
                    }
                    var categoryListSql = 'select c.slug,c.name FROM categories c';
                    DbUtils.queryData(categoryListSql,function (categoryListResult) {
                        if(categoryListResult){
                            returnObj.category_status = 0;
                            returnObj.category_desc = '分类数据获取成功';
                            returnObj.categoryJsonArr = categoryListResult;
                        }else{
                            returnObj.category_status = 1;
                            returnObj.category_desc = '分类数据获取失败';
                        }
                        res.json(returnObj);
                    });
                })
            });
        }else{
            returnObj.status = 1;
            returnObj.getlist_desc = '无法获取存在的文章审批信息';
        }
    })
});
//删除文章审批数据
router.get('/baixiu/articleDelete',function (req,res) {
    var returnObj = {};
    returnObj.returnData = {
        categoryId:req.query.categoryId,
        postId:req.query.postId,
        offset:req.query.offset,
        pageSize:req.query.pageSize,
        articleId:req.query.articleId
    };
    var deleteSql = 'update posts p set p.del_flag = 1 where p.id = '+ req.query.articleId;
    DbUtils.queryData(deleteSql,function (result) {
        if(result.changedRows > 0){
            returnObj.status = 0;
            returnObj.desc = '删除成功';
        }else{
            returnObj.status = 1;
            returnObj.desc = '删除失败';
        }
        res.json(returnObj);
    });
});

module.exports = router;