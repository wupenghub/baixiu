var express = require('express');
var router = express.Router();
var DbUtils = require('./DbUtils');
var utils = require('./util/utils');
var mail = require('./util/mail');
var md5 = require('md5-node');
var uuid = require('node-uuid');
let excelUtils = require('./util/ExcelUtils.js');
var mysql = require('mysql');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
var path = require('path');
//访问管理后台首页
router.get('/', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    // 2、查询对应的菜单数据
    var sql = 'select * from mnues m where m.model_id = 1 and m.del_flag = 0';
    DbUtils.queryData(sql, function (result) {
        for (var i = 0; i < result.length; i++) {
            utils.addList(result, result[i]);
        }
        // 将result中所有节点parent_id值不为空的给踢出掉
        var array = [];
        for (var i = 0; i < result.length; i++) {
            if (!result[i]['parent_id']) {
                array.push(result[i]);
            }
        }
        var dataJson = {};
        dataJson.user = req.session.user[0];
        dataJson.dataJsonArr = array;
        req.session.userInfo = JSON.stringify(dataJson);
        // res.render('index.html', {dataJson: JSON.stringify(dataJson)});
        res.redirect(302,'/baixiu/bxManger');
    });
});
//访问登录界面
router.get('/baixiu/toLogin', function (req, res) {
    res.render('login.html');
});
//登录接口
router.post('/baixiu/login', function (req, res) {
    var emil = req.body.email;
    var password = req.body.password;
    password = md5(md5(password) + 'p~1i');
    var loginSql = `
                    SELECT
                        u.id,
                        u.avatar,
                        u.bio,
                        u.email,
                        u. level,
                        u.nickname,
                        u. password,
                        u. status,
                        u.slug
                    FROM
                        users u
                    WHERE
                        u.email = ${mysql.escape(emil)}
                    AND u.password = ${mysql.escape(password)}
                    AND u.status = "activated"
                    `;
    console.log('login:'+loginSql);
    DbUtils.queryData(loginSql, function (result) {
        var loginData = {};
        if (result && result.length > 0) {
            //登录成功，保存session
            req.session.user = result;
            loginData.login_state = '0';
            loginData.login_desc = '登录成功';
            loginData.user = result[0];
        } else {
            //未找到用户
            loginData.login_state = '1';
            loginData.login_desc = '登录失败，密码错误！';
            loginData.user = null;
        }
        res.json(loginData);
    });
});
//退出登录
//忘记密码
//注册页面
//退出登录接口
router.get('/baixiu/loginout', function (req, res) {
    req.session.user = null;
    utils.isLogin(req, res);
});
router.get('/baixiu/personMaintenance', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    // 2、查询对应的菜单数据
    var sql = 'select * from mnues m where m.model_id = 1 and m.del_flag = 0';
    DbUtils.queryData(sql, function (result) {
        for (var i = 0; i < result.length; i++) {
            utils.addList(result, result[i]);
        }
        // 将result中所有节点parent_id值不为空的给踢出掉
        var array = [];
        for (var i = 0; i < result.length; i++) {
            if (!result[i]['parent_id']) {
                array.push(result[i]);
            }
        }
        var dataJson = {};
        dataJson.user = req.session.user[0];
        dataJson.dataJsonArr = array;
        req.session.userInfo = JSON.stringify(dataJson);
        res.render('personMaintenance.html', {dataJson: JSON.stringify(dataJson)});
    });
});
router.get('/baixiu/registered', function (req, res) {
    res.render('registered.html');
});
//注册接口
router.post('/baixiu/register', function (req, res) {
    var returnData = {};
    //先校验客户端传过来的用户名是否已经存在
    var userName = req.body.email;
    var password = req.body.password;
    password = md5(md5(password) + 'p~1i');
    var querySql = 'select * from users u where u.email ="' + userName + '"';
    DbUtils.queryData(querySql, function (result) {
        if (result && result.length > 0) {
            returnData.query_status = 1;
            returnData.query_desc = '查询存有此用户，不能重复注册';
            res.json(returnData);
        } else {
            returnData.query_status = 0;
            returnData.query_desc = '查询不存在此用户，可以注册';
            var updateSql = 'insert into users (slug,email,password,nickname,avatar,bio,status) VALUES(null,"' + userName + '","' + password + '",null,"/public/img/default.png",null,"waitactivated")';
            DbUtils.queryData(updateSql, function (result) {
                if (result.insertId > 0) {
                    returnData.register_status = 0;
                    returnData.register_desc = '注册成功';
                    returnData.email = userName;
                    //注册成功发送激活邮件
                    var html = '<p>尊敬的' + userName + '您好，欢迎使用激活账号,请点击<a href="http://47.96.76.172:3000/baixiu/activated?userName=' + userName + '">激活账号</a>链接进行账号激活</p>';
                    mail.sendMain(userName, '账号激活', html, function (data) {
                        returnData.mailSend_status = data.status;
                        returnData.mailSend_desc = data.desc;
                        res.json(returnData);
                    });
                } else {
                    returnData.register_status = 1;
                    returnData.register_desc = '注册失败';
                    res.json(returnData);
                }
            });

        }
    });
});
//激活账号邮件接口
router.get('/baixiu/activatedAccount', function (req, res) {
    var html = '<p>尊敬的' + req.query.email + '您好，欢迎使用激活账号,请点击<a href="http://47.96.76.172:3000/baixiu/activated?userName=' + userName + '">激活账号</a>链接进行账号激活</p>';
    mail.sendMain(userName, '账号激活', html, function (data) {
        returnData.mailSend_status = data.status;
        returnData.mailSend_status = data.desc;
        res.json(returnData);
    });
});
//激活账户接口
router.get('/baixiu/activated', function (req, res) {
    var userName = req.query.userName;
    var querySql = 'select * from users u where u.email ="' + userName + '"';
    var returnData = {};
    DbUtils.queryData(querySql, function (result) {
        if (result && result.length > 0) {
            returnData.query_status = 0;
            returnData.query_desc = '查询存有此用户，可以进行账号激活';
            var updateSql = 'update users u set u.status = "activated" where u.email = "' + userName + '"';
            DbUtils.queryData(updateSql, function (result) {
                returnData.activation_status = 0;
                returnData.activation_desc = '激活成功';
                res.json(returnData);
            }, function (err) {
                returnData.activation_status = 1;
                returnData.activation_desc = '激活失败';
                res.json(returnData);
            });
        } else {
            returnData.query_status = 1;
            returnData.query_desc = '查询不存在此用户，不能进行账号激活';
            res.json(returnData);
        }
    });

});
router.get('/baixiu/forgetPwd', function (req, res) {
    res.render('forgetPwd.html');
});
//重置密码接口
router.get('/baixiu/resetPwd', function (req, res) {
    var html = '<p>尊敬的' + req.query.email + '您好，欢迎使用密码找回功能,请点击<a href="http://47.96.76.172:3000/baixiu/pwdReset?userName=' + req.query.email + '">密码重置</a>链接进行密码重置</p>';
    mail.sendMain(req.query.email, '找回密码', html, function (data) {
        res.json(data);
    });
});
//修改密码界面路由
router.get('/baixiu/pwdReset', function (req, res) {
    var userName = req.query.userName;
    DbUtils.queryData('select * from users u where u.email = "' + userName + '"', function (result) {
        res.render('resetpwd.html', {user: result[0]});
    });
});
//修改密码路由
router.post('/baixiu/pwdUpdate', function (req, res) {
    var userName = req.body.userName;
    var passWord = req.body.passWord;
    passWord = md5(md5(passWord) + 'p~1i');
    var updateSql = 'UPDATE users u set u.`password` = "' + passWord + '" WHERE u.email = "' + userName + '"';
    var resultData = {};
    DbUtils.queryData(updateSql, function (result) {
        resultData.status = 0;
        resultData.desc = '密码更新成功';
        res.json(resultData);
    }, function (err) {
        resultData.status = 1;
        resultData.desc = '密码更新失败';
        res.json(resultData);
    });
});
//修改成功跳转路由
router.get('/baixiu/jumpToLogin', function (req, res) {
    res.render('jumpToLogin.html');
});
//验证用户名是否存在
router.post('/baixiu/isExitUser', function (req, res) {
    var userName = req.body.userName;
    var querySql = 'select * from users u where u.email ="' + userName + '"';
    DbUtils.queryData(querySql, function (result) {
        var returnData = {};
        if (result && result.length > 0) {
            returnData.status = 0;
            returnData.desc = '查询存有此用户';
            returnData.user = result[0];
        } else {
            returnData.status = 1;
            returnData.desc = '查询不存在此用户';
        }
        res.json(returnData);
    });
});
//菜单管理
router.get('/baixiu/MenuManger', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    console.log(user);
    res.render('mnueManger.html', {dataJsonArr: req.session.userInfo});
});
//菜单管理->菜单删除
router.get('/baixiu/menuDelete', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    var sql = 'select *  from mnues m where m.parent_id = ' + req.query.id + ' and m.del_flag = 0';
    DbUtils.queryData(sql, function (result) {
        if (result.length == 0) {
            //查不出结果说明满足删除条件，执行修改数据库的sql
            var updateSql = 'update mnues m set m.del_flag = 1 where m.id = ' + req.query.id;
            DbUtils.queryData(updateSql, function (updateResult) {
                var sql = 'select * from mnues m where m.model_id = 1 and m.del_flag = 0';
                DbUtils.queryData(sql, function (queryResult) {
                    for (var i = 0; i < queryResult.length; i++) {
                        utils.addList(queryResult, queryResult[i]);
                    }
                    // 将result中所有节点parent_id值不为空的给踢出掉
                    var array = [];
                    for (var i = 0; i < queryResult.length; i++) {
                        if (!queryResult[i]['parent_id']) {
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
        } else {
            //可以查出结果集，说明改节点为父节点，并且对应的部分子节点没有删除完
            var errResult = {};
            errResult.status = 1;
            errResult.desc = '该目录下的部分子目录未被删除，请先删除对应的子目录';
            res.json(errResult);
        }
    });
});
//菜单管理->菜单添加与修改
router.post('/baixiu/sonMnueAdd', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    //先判断此id在数据库中是否存在
    var querySql = 'select count(1) count from mnues m where m.id = ' + req.body.id + ' and m.del_flag = 0';
    DbUtils.queryData(querySql, function (result) {
        var data = {};
        if (result && result[0].count > 0) {
            //查询有此记录，执行添加目录sql
            var inserSql = '';
            if (req.body.isUpdate == 'N') {
                inserSql = 'insert into mnues value(null,1,"' + req.body.mnueDesc + '",' + req.body.id + ',"' + req.body.url + '",0)';
            } else {
                inserSql = 'UPDATE mnues m set m.mnue_desc = "' + req.body.mnueDesc + '",m.parent_id = ' + req.body.parentId + ',m.url="' + req.body.url + '" where m.id =' + req.body.id;
            }
            console.log(inserSql);
            DbUtils.queryData(inserSql, function (result) {
                data.status = 0;
                data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                var sql = 'select * from mnues m where m.model_id = 1 and m.del_flag = 0';
                DbUtils.queryData(sql, function (queryResult) {
                    for (var i = 0; i < queryResult.length; i++) {
                        utils.addList(queryResult, queryResult[i]);
                    }
                    // 将result中所有节点parent_id值不为空的给踢出掉
                    var array = [];
                    for (var i = 0; i < queryResult.length; i++) {
                        if (!queryResult[i]['parent_id']) {
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
        } else {
            //查询无记录
            data.status = 1;
            data.desc = '数据库中无此目录';
            res.json(data);
        }
    });
});
//功能->文章->文章发表
router.get('/baixiu/articlePublished', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('post-add.html', {dataJsonArr: req.session.userInfo});
});
//功能->文章->文章审批
router.get('/baixiu/articleApproval', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('posts.html', {dataJsonArr: req.session.userInfo});
});
//获取文章审批的列表
router.get('/baixiu/getArticleApprovalList', function (req, res) {
    var returnObj = {};
    returnObj.returnData = {
        categoryId: req.query.categoryId,
        postId: req.query.postId,
        offset: req.query.offset,
        pageSize: req.query.pageSize
    };
    var queryCountSql = 'SELECT\n' +
        '\tcount(1) "count"\n' +
        'FROM\n' +
        '\tposts p\n' +
        'LEFT JOIN users u ON p.user_id = u.id\n' +
        'LEFT JOIN categories c ON p.category_id = c.id\n' +
        'LEFT JOIN baixiu_status_l s ON s.baixiu_key = p.`status`' +
        ' where p.del_flag = 0';
    if (req.query.categoryId != 'all') {
        queryCountSql += ' AND c.slug = "' + req.query.categoryId + '" '
    }
    if (req.query.postId != 'all') {
        queryCountSql += ' AND s.baixiu_key = "' + req.query.postId + '" '
    }
    DbUtils.queryData(queryCountSql, function (result) {
        if (result && result[0].count != '0') {
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
                'DATE_FORMAT(p.created,"%Y-%m-%d") "createTime",' +
                ' p.id "id",\n' +
                's.baixiu_key "statuskey",\n' +
                ' s.baixiu_val "statusVal"\n' +
                'FROM\n' +
                '\tposts p\n' +
                'LEFT JOIN users u ON p.user_id = u.id\n' +
                'LEFT JOIN categories c ON p.category_id = c.id\n' +
                'LEFT JOIN baixiu_status_l s ON s.baixiu_key = p.`status`\n' +
                'where 1 = 1\n' +
                ' and p.del_flag = 0';

            if (req.query.categoryId != 'all') {
                querySql += ' AND c.slug = "' + req.query.categoryId + '" '
            }
            if (req.query.postId != 'all') {
                querySql += ' AND s.baixiu_key = "' + req.query.postId + '" '
            }
            querySql += ' ORDER BY p.created DESC\n';
            querySql += ' LIMIT ' + ((req.query.offset - 1) * req.query.pageSize) + ',\n' + req.query.pageSize;
            DbUtils.queryData(querySql, function (resultList) {
                if (resultList && resultList.length > 0) {
                    returnObj.getlist_status = 0;
                    returnObj.getlist_desc = '获取数据成功';
                    returnObj.postsJsonArray = resultList;
                } else {
                    returnObj.getlist_status = 1;
                    returnObj.getlist_desc = '未获取到文章审批信息';
                }
                var queryStates = 'SELECT\n' +
                    '\tb.baixiu_key "key",\n' +
                    '\tb.baixiu_val "val"\n' +
                    'FROM\n' +
                    '\tbaixiu_status_l b';
                DbUtils.queryData(queryStates, function (statesResult) {
                    if (statesResult) {
                        returnObj.status_status = 0;
                        returnObj.status_desc = '状态获取成功';
                        returnObj.statusJsonArr = statesResult;
                    } else {
                        returnObj.status_status = 1;
                        returnObj.status_desc = '状态信息获取失败';
                    }
                    var categoryListSql = 'select c.slug,c.name FROM categories c';
                    DbUtils.queryData(categoryListSql, function (categoryListResult) {
                        if (categoryListResult) {
                            returnObj.category_status = 0;
                            returnObj.category_desc = '分类数据获取成功';
                            returnObj.categoryJsonArr = categoryListResult;
                        } else {
                            returnObj.category_status = 1;
                            returnObj.category_desc = '分类数据获取失败';
                        }
                        res.json(returnObj);
                    });
                })
            });
        } else {
            returnObj.status = 1;
            returnObj.getlist_desc = '无法获取存在的文章审批信息';
        }
    })
});
//删除文章审批数据
router.get('/baixiu/articleDelete', function (req, res) {
    var returnObj = {};
    returnObj.returnData = {
        categoryId: req.query.categoryId,
        postId: req.query.postId,
        offset: req.query.offset,
        pageSize: req.query.pageSize,
        articleId: req.query.articleId
    };
    var deleteSql = 'update posts p set p.del_flag = 1 where p.id = ' + req.query.articleId;
    DbUtils.queryData(deleteSql, function (result) {
        if (result.changedRows > 0) {
            returnObj.status = 0;
            returnObj.desc = '删除成功';
        } else {
            returnObj.status = 1;
            returnObj.desc = '删除失败';
        }
        res.json(returnObj);
    });
});
//CIS系统人员权限管理模块
router.get('/baixiu/cisApproval', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('cisApproval.html', {dataJsonArr: req.session.userInfo});
    // res.render('cisApproval.html');
});
//CIS系统材料单配置
router.get('/baixiu/cisSqlConfig', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('cisSql.html', {dataJsonArr: req.session.userInfo});
});
//出差记录
router.get('/baixiu/businessTrip', function (req, res) {
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('businessTrip.html', {dataJsonArr: req.session.userInfo});
});
//查询订单记录
router.get('/baixiu/searchOrder', function (req, res) {
    var email = req.query.email;
    var date = req.query.date;
    var querySql = "select count(1) as totalCount from trip_order o where o.start_date = str_to_date('" + date + "','%Y-%m-%d') and o.email='" + email + "'";
    console.log(querySql);
    DbUtils.queryData(querySql, function (result) {
        if (result[0].totalCount > 0) {
            //查询到出差记录
            var querySql = "SELECT\n" +
                "\to.order_no,\n" +
                "(datediff(str_to_date(o.end_date, '%Y-%m-%d'),str_to_date(o.start_date, '%Y-%m-%d'))+1) as CCTS,\n" +
                "\t(\n" +
                "\t\tSELECT\n" +
                "\t\t\torg.company_desc\n" +
                "\t\tFROM\n" +
                "\t\t\tcompany_org org\n" +
                "\t\tWHERE\n" +
                "\t\t\torg.company_code = o.start_company\n" +
                "\t) start_company_desc,\n" +
                "\t(\n" +
                "\t\tSELECT\n" +
                "\t\t\torg.company_desc\n" +
                "\t\tFROM\n" +
                "\t\t\tcompany_org org\n" +
                "\t\tWHERE\n" +
                "\t\t\torg.company_code = o.end_company\n" +
                "\t) end_company_desc\n" +
                "FROM\n" +
                "\ttrip_order o\n" +
                "WHERE\n" +
                "\to.start_date = str_to_date('" + date + "', '%Y-%m-%d')\n" +
                "AND o.email = '" + email + "'\n" +
                "AND o.order_status = 1\n";
            console.log(querySql);
            DbUtils.queryData(querySql, function (result) {
                res.json({
                    status: 0,
                    tripList: result,
                    totalCount: result[0].totalCount
                })
            }, function (err) {
                res.json({
                    status: 1,
                    desc: '当天没有出差记录'
                })
            });
        } else {
            res.json({
                status: 1,
                desc: '当天没有出差记录'
            });
        }
    }, function (err) {

    });
});
//查询每个月中所有日期的订单数
router.get('/baixiu/searchMonthTripCount', function (req, res) {
    var email = req.query.email;
    var date = req.query.date;
    var startYear = date.split('-')[0];
    var month = parseInt(date.split('-')[1]);
    var date = new Date(startYear, month);
    var startMonth = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
    date.setMonth(date.getMonth() + 1, 1);
    var nextYear = date.getFullYear();
    var nextMonth = date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
    var startDate = startYear + '-' + startMonth + '-01';
    var nextDate = nextYear + '-' + nextMonth + '-01';
    var querySql = "SELECT\n" +
        "\t\t\tSUBSTR(o.start_date, 1, 4) AS year,\n" +
        "\t\t\tSUBSTR(o.start_date, 6, 2) AS month,\n" +
        "\t\t\tSUBSTR(o.start_date, 9, 10) AS day,\n" +
        "\t\t\tcount(1) AS totalCount\n" +
        "\t\tFROM\n" +
        "\t\t\ttrip_order o\n" +
        "\t\tWHERE\n" +
        "\t\t\to.start_date >= str_to_date('" + startDate + "', '%Y-%m-%d')\n" +
        "\t\tAND o.start_date < str_to_date('" + nextDate + "', '%Y-%m-%d')\n" +
        "\t\tAND o.email = '" + email + "'\n" +
        "group by year,month,day";
    console.log('searchMonthTripCount:' + querySql);
    DbUtils.queryData(querySql, function (result) {
        res.json({
            status: 0,
            resultDate: result
        });
    }, function (err) {
        res.json({
            status: -1,
            resultDate: err
        });
    });
});
//新增出差订单
router.post('/baixiu/addRecord', function (req, res) {
    var email = req.body.email;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var startCompany = req.body.startCompany;
    var endCompany = req.body.endCompany;
    var isAdd = req.body.isAdd;
    var querySql = '';
    if (isAdd == 'Y') {
        var orderNo = uuid.v1();
        querySql = "INSERT INTO trip_order\n" +
            "VALUES\n" +
            "\t(\n" +
            "\t\tNULL,\n" +
            "\t\t'" + orderNo + "',\n" +
            "\t\t'" + email + "',\n" +
            "\t\t'" + startDate + "',\n" +
            "\t\t'" + endDate + "',\n" +
            "\t\t'" + startCompany + "',\n" +
            "\t\t'" + endCompany + "',\n" +
            "\t\t1\n" +
            "\t)"
    } else {
        querySql = "UPDATE trip_order o\n" +
            "SET o.email = '" + email + "',\n" +
            " o.start_date = str_to_date('" + startDate + "', '%Y-%m-%d'),\n" +
            " o.end_date = str_to_date('" + endDate + "', '%Y-%m-%d'),\n" +
            " o.start_company = '" + startCompany + "',\n" +
            " o.end_company = '" + endCompany + "'\n" +
            "WHERE\n" +
            "\to.order_no = '" + req.body.orderNo + "'\n" +
            "AND o.email = '"+email+"'";
    }
    console.log("addRecord:" + querySql);
    DbUtils.queryData(querySql, function (result) {
        console.log(result);
        if (result.affectedRows > 0) {
            res.json({
                status: 0,
                desc: '记录添加成功'
            })
        } else {
            res.json({
                status: 1,
                desc: '记录没有添加'
            })
        }
    }, function (err) {
        res.json({
            status: -1,
            desc: err
        })
    });

});
//根据订单号查询订单
router.get('/baixiu/searchOrderByNo', function (req, res) {
    var email = req.query.email;
    var orderNo = req.query.orderNo;
    /*var querySql = "SELECT\n" +
        "\t*\n" +
        "FROM\n" +
        "\ttrip_order o\n" +
        "WHERE\n" +
        "\to.order_no = '"+orderNo+"'\n" +
        "AND o.email = '"+email+"'";*/
    var querySql = "SELECT\n" +
        "\t*, (\n" +
        "\t\tSELECT\n" +
        "\t\t\tc.company_desc\n" +
        "\t\tFROM\n" +
        "\t\t\tcompany_org c\n" +
        "\t\tWHERE\n" +
        "\t\t\tc.company_code = o.start_company\n" +
        "\t) AS start_company_desc,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\tc.company_desc\n" +
        "\t\tFROM\n" +
        "\t\t\tcompany_org c\n" +
        "\t\tWHERE\n" +
        "\t\t\tc.company_code = o.end_company\n" +
        "\t) AS end_company_desc\n" +
        "FROM\n" +
        "\ttrip_order o\n" +
        "WHERE\n" +
        "\to.order_no = '" + orderNo + "'\n" +
        "AND o.email = '" + email + "'";
    console.log('searchOrderByNo:' + querySql);
    DbUtils.queryData(querySql, function (result) {
        console.log(result);
        res.json({
            status: 0,
            result
        });
    }, function (error) {

    });

});
// 出差公司管理
router.get('/baixiu/companyManger', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('companyManger.html', {dataJsonArr: req.session.userInfo});
});
//查询公司列表
router.get('/baixiu/queryCompanyList', function (req, res) {
    var querySql = "SELECT\n" +
        "\torg.company_code AS id,\n" +
        "\torg.company_code AS url,\n" +
        "\torg.parent_code AS parent_id,\n" +
        "\torg.address_code AS addressCode,\n" +
        "\torg.is_tz AS isTz,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\tt.company_type_desc\n" +
        "\t\tFROM\n" +
        "\t\t\tcompany_type t\n" +
        "\t\tWHERE\n" +
        "\t\t\tt.is_tz = org.is_tz\n" +
        "\t) AS company_type_desc,\n" +
        "\torg.company_desc AS mnue_desc,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\ta.address_desc\n" +
        "\t\tFROM\n" +
        "\t\t\taddress a\n" +
        "\t\tWHERE\n" +
        "\t\t\ta.address_code = org.address_code\n" +
        "\t) AS addressDesc\n" +
        "FROM\n" +
        "\tcompany_org org";
    console.log('queryCompanyList:' + querySql);
    DbUtils.queryData(querySql, function (result) {
        for (var i = 0; i < result.length; i++) {
            utils.addList(result, result[i]);
        }
        // 将result中所有节点parent_id值不为空的给踢出掉
        var array = [];
        for (var i = 0; i < result.length; i++) {
            if (!result[i]['parent_id']) {
                array.push(result[i]);
            }
        }
        res.json({
            status: 0,
            returnDate: array
        });
    }, function (error) {
        res.json({
            status: -1,
            returnDate: error
        });
    });

});
//查询公司类型
router.get('/baixiu/queryCompanyType', function (req, res) {
    var querySql = "select * from company_type t";
    console.log('queryCompanyType:' + querySql);
    DbUtils.queryData(querySql, function (date) {
        res.json({
            status: 0,
            returnDate: date
        })
    }, function (error) {
        res.json({
            status: -1,
            desc: error
        })
    });
});
//添加子公司
router.post('/baixiu/sonCompanyAdd', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    //先判断此id在数据库中是否存在
    var querySql = 'select count(1) count from company_org m where m.company_code = "' + req.body.id + '"';
    DbUtils.queryData(querySql, function (result) {
        var data = {};
        if (result && result[0].count > 0) {
            var inserSql = 'UPDATE company_org m set m.company_desc = "' + req.body.mnueDesc + '",m.parent_code = "' + req.body.parentId + '",m.address_code="' + req.body.companyAddress + '",m.is_tz=' + req.body.isTz + ' where m.company_code ="' + req.body.id + '"';
            console.log(inserSql);
            DbUtils.queryData(inserSql, function (result) {
                data.status = 0;
                data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                var sql = "SELECT\n" +
                    "\torg.company_code AS id,\n" +
                    "\torg.company_code AS url,\n" +
                    "\torg.parent_code AS parent_id,\n" +
                    "\torg.address_code AS addressCode,\n" +
                    "\torg.is_tz AS isTz,\n" +
                    "\t(\n" +
                    "\t\tSELECT\n" +
                    "\t\t\tt.company_type_desc\n" +
                    "\t\tFROM\n" +
                    "\t\t\tcompany_type t\n" +
                    "\t\tWHERE\n" +
                    "\t\t\tt.is_tz = org.is_tz\n" +
                    "\t) AS company_type_desc,\n" +
                    "\torg.company_desc AS mnue_desc,\n" +
                    "\t(\n" +
                    "\t\tSELECT\n" +
                    "\t\t\ta.address_desc\n" +
                    "\t\tFROM\n" +
                    "\t\t\taddress a\n" +
                    "\t\tWHERE\n" +
                    "\t\t\ta.address_code = org.address_code\n" +
                    "\t) AS addressDesc\n" +
                    "FROM\n" +
                    "\tcompany_org org";
                DbUtils.queryData(sql, function (queryResult) {
                    for (var i = 0; i < queryResult.length; i++) {
                        utils.addList(queryResult, queryResult[i]);
                    }
                    // 将result中所有节点parent_id值不为空的给踢出掉
                    var array = [];
                    for (var i = 0; i < queryResult.length; i++) {
                        if (!queryResult[i]['parent_id']) {
                            array.push(queryResult[i]);
                        }
                    }
                    data.returnDate = array;
                    res.json(data);
                });
            });
        } else {
            //查询无记录
            if (req.body.isUpdate == 'N') {
                data.status = 0;
                data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                var inserSql = 'insert into company_org value("' + req.body.id + '","' + req.body.companyAddress + '","' + req.body.parentId + '",' + req.body.isTz + ',"' + req.body.mnueDesc + '")';
                console.log(inserSql)
                DbUtils.queryData(inserSql, function (result) {
                    data.status = 0;
                    data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                    var sql = "SELECT\n" +
                        "\torg.company_code AS id,\n" +
                        "\torg.company_code AS url,\n" +
                        "\torg.parent_code AS parent_id,\n" +
                        "\torg.address_code AS addressCode,\n" +
                        "\torg.is_tz AS isTz,\n" +
                        "\t(\n" +
                        "\t\tSELECT\n" +
                        "\t\t\tt.company_type_desc\n" +
                        "\t\tFROM\n" +
                        "\t\t\tcompany_type t\n" +
                        "\t\tWHERE\n" +
                        "\t\t\tt.is_tz = org.is_tz\n" +
                        "\t) AS company_type_desc,\n" +
                        "\torg.company_desc AS mnue_desc,\n" +
                        "\t(\n" +
                        "\t\tSELECT\n" +
                        "\t\t\ta.address_desc\n" +
                        "\t\tFROM\n" +
                        "\t\t\taddress a\n" +
                        "\t\tWHERE\n" +
                        "\t\t\ta.address_code = org.address_code\n" +
                        "\t) AS addressDesc\n" +
                        "FROM\n" +
                        "\tcompany_org org";
                    DbUtils.queryData(sql, function (queryResult) {
                        for (var i = 0; i < queryResult.length; i++) {
                            utils.addList(queryResult, queryResult[i]);
                        }
                        // 将result中所有节点parent_id值不为空的给踢出掉
                        var array = [];
                        for (var i = 0; i < queryResult.length; i++) {
                            if (!queryResult[i]['parent_id']) {
                                array.push(queryResult[i]);
                            }
                        }
                        data.returnDate = array;
                        res.json(data);
                    });
                });
            } else {
                // data.status = 1;
                // data.desc = '数据库中无此目录';
                // res.json(data);
                data.status = 0;
                data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                var inserSql = 'UPDATE company_org m set m.company_code="' + req.body.id + '",m.company_desc = "' + req.body.mnueDesc + '",m.parent_code = "' + req.body.parentId + '",m.address_code="' + req.body.companyAddress + '",m.is_tz=' + req.body.isTz + ' where m.company_code ="' + req.body.oldId + '"';
                console.log('code不一致sonCompanyAdd:' + inserSql);
                DbUtils.queryData(inserSql, function (result) {
                    data.status = 0;
                    data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                    var sql = "SELECT\n" +
                        "\torg.company_code AS id,\n" +
                        "\torg.company_code AS url,\n" +
                        "\torg.parent_code AS parent_id,\n" +
                        "\torg.address_code AS addressCode,\n" +
                        "\torg.is_tz AS isTz,\n" +
                        "\t(\n" +
                        "\t\tSELECT\n" +
                        "\t\t\tt.company_type_desc\n" +
                        "\t\tFROM\n" +
                        "\t\t\tcompany_type t\n" +
                        "\t\tWHERE\n" +
                        "\t\t\tt.is_tz = org.is_tz\n" +
                        "\t) AS company_type_desc,\n" +
                        "\torg.company_desc AS mnue_desc,\n" +
                        "\t(\n" +
                        "\t\tSELECT\n" +
                        "\t\t\ta.address_desc\n" +
                        "\t\tFROM\n" +
                        "\t\t\taddress a\n" +
                        "\t\tWHERE\n" +
                        "\t\t\ta.address_code = org.address_code\n" +
                        "\t) AS addressDesc\n" +
                        "FROM\n" +
                        "\tcompany_org org";
                    DbUtils.queryData(sql, function (queryResult) {
                        for (var i = 0; i < queryResult.length; i++) {
                            utils.addList(queryResult, queryResult[i]);
                        }
                        // 将result中所有节点parent_id值不为空的给踢出掉
                        var array = [];
                        for (var i = 0; i < queryResult.length; i++) {
                            if (!queryResult[i]['parent_id']) {
                                array.push(queryResult[i]);
                            }
                        }
                        data.returnDate = array;
                        res.json(data);
                    });
                });

            }

        }
    });
});
//删除子公司
router.get('/baixiu/companyDelete', function (req, res) {
//1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    var sql = 'select * from company_org m where m.parent_code = "' + req.query.id + '"';
    DbUtils.queryData(sql, function (result) {
        if (result.length == 0) {
            //查不出结果说明满足删除条件，执行修改数据库的sql
            var updateSql = 'delete from company_org where company_code = "' + req.query.id + '"';
            console.log('删除companyDelete：' + updateSql);
            DbUtils.queryData(updateSql, function (updateResult) {
                var sql = "SELECT\n" +
                    "\torg.company_code AS id,\n" +
                    "\torg.company_code AS url,\n" +
                    "\torg.parent_code AS parent_id,\n" +
                    "\torg.address_code AS addressCode,\n" +
                    "\torg.is_tz AS isTz,\n" +
                    "\t(\n" +
                    "\t\tSELECT\n" +
                    "\t\t\tt.company_type_desc\n" +
                    "\t\tFROM\n" +
                    "\t\t\tcompany_type t\n" +
                    "\t\tWHERE\n" +
                    "\t\t\tt.is_tz = org.is_tz\n" +
                    "\t) AS company_type_desc,\n" +
                    "\torg.company_desc AS mnue_desc,\n" +
                    "\t(\n" +
                    "\t\tSELECT\n" +
                    "\t\t\ta.address_desc\n" +
                    "\t\tFROM\n" +
                    "\t\t\taddress a\n" +
                    "\t\tWHERE\n" +
                    "\t\t\ta.address_code = org.address_code\n" +
                    "\t) AS addressDesc\n" +
                    "FROM\n" +
                    "\tcompany_org org";
                DbUtils.queryData(sql, function (queryResult) {
                    for (var i = 0; i < queryResult.length; i++) {
                        utils.addList(queryResult, queryResult[i]);
                    }
                    // 将result中所有节点parent_id值不为空的给踢出掉
                    var array = [];
                    for (var i = 0; i < queryResult.length; i++) {
                        if (!queryResult[i]['parent_id']) {
                            array.push(queryResult[i]);
                        }
                    }
                    var dataJson = {};
                    dataJson.returnData = array;
                    dataJson.status = 0;
                    dataJson.desc = '成功';
                    res.json(dataJson);
                });
            });
        } else {
            //可以查出结果集，说明改节点为父节点，并且对应的部分子节点没有删除完
            var errResult = {};
            errResult.status = 1;
            errResult.desc = '该目录下的部分子目录未被删除，请先删除对应的子目录';
            res.json(errResult);
        }
    });
});
//地址管理
router.get('/baixiu/addressManger', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    res.render('addressManger.html', {dataJsonArr: req.session.userInfo});
});
//查询地址列表
router.get('/baixiu/queryAddressList', function (req, res) {
    var querySql = "SELECT\n" +
        "\ta.address_code AS id,\n" +
        "\ta.address_code AS url,\n" +
        "\ta.parent_address AS parent_id,\n" +
        "\ta.address_desc AS mnue_desc\n" +
        "FROM\n" +
        "\taddress a";
    console.log('queryAddressList:' + querySql);
    DbUtils.queryData(querySql, function (result) {
        for (var i = 0; i < result.length; i++) {
            utils.addList(result, result[i]);
        }
        // 将result中所有节点parent_id值不为空的给踢出掉
        var array = [];
        for (var i = 0; i < result.length; i++) {
            if (!result[i]['parent_id']) {
                array.push(result[i]);
            }
        }
        res.json({
            status: 0,
            returnDate: array
        });
    }, function (error) {
        res.json({
            status: -1,
            returnDate: error
        });
    });

});
//添加子地址
router.post('/baixiu/sonAddressAdd', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    //先判断此id在数据库中是否存在
    var querySql = 'select count(1) count from address m where m.address_code = "' + req.body.id + '"';
    DbUtils.queryData(querySql, function (result) {
        var data = {};
        if (result && result[0].count > 0) {
            var inserSql = 'UPDATE address m set m.address_desc = "' + req.body.mnueDesc + '",m.parent_address = "' + req.body.parentId + '" where m.address_code ="' + req.body.id + '"';
            console.log(inserSql);
            DbUtils.queryData(inserSql, function (result) {
                data.status = 0;
                data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                var sql = 'select m.address_code as id,m.address_code as url,m.parent_address as parent_id,m.address_desc as mnue_desc from address m';
                DbUtils.queryData(sql, function (queryResult) {
                    for (var i = 0; i < queryResult.length; i++) {
                        utils.addList(queryResult, queryResult[i]);
                    }
                    // 将result中所有节点parent_id值不为空的给踢出掉
                    var array = [];
                    for (var i = 0; i < queryResult.length; i++) {
                        if (!queryResult[i]['parent_id']) {
                            array.push(queryResult[i]);
                        }
                    }
                    data.returnDate = array;
                    res.json(data);
                });
            });
        } else {
            //查询无记录
            if (req.body.isUpdate == 'N') {
                data.status = 0;
                data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                var inserSql = 'insert into address value("' + req.body.id + '","' + req.body.mnueDesc + '","' + req.body.parentId + '")';
                DbUtils.queryData(inserSql, function (result) {
                    data.status = 0;
                    data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                    var sql = 'select m.address_code as id,m.address_code as url,m.parent_address as parent_id,m.address_desc as mnue_desc from address m';
                    DbUtils.queryData(sql, function (queryResult) {
                        for (var i = 0; i < queryResult.length; i++) {
                            utils.addList(queryResult, queryResult[i]);
                        }
                        // 将result中所有节点parent_id值不为空的给踢出掉
                        var array = [];
                        for (var i = 0; i < queryResult.length; i++) {
                            if (!queryResult[i]['parent_id']) {
                                array.push(queryResult[i]);
                            }
                        }
                        data.returnDate = array;
                        res.json(data);
                    });
                });
            } else {
                // data.status = 1;
                // data.desc = '数据库中无此目录';
                // res.json(data);
                data.status = 0;
                data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                var inserSql = 'UPDATE address m set m.address_code="' + req.body.id + '",m.address_desc = "' + req.body.mnueDesc + '",m.parent_address = "' + req.body.parentId + '" where m.address_code ="' + req.body.oldId + '"';
                console.log('code不一致sonCompanyAdd:' + inserSql);
                DbUtils.queryData(inserSql, function (result) {
                    data.status = 0;
                    data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                    var sql = 'select m.address_code as id,m.address_code as url,m.parent_address as parent_id,m.address_desc as mnue_desc from address m';
                    DbUtils.queryData(sql, function (queryResult) {
                        for (var i = 0; i < queryResult.length; i++) {
                            utils.addList(queryResult, queryResult[i]);
                        }
                        // 将result中所有节点parent_id值不为空的给踢出掉
                        var array = [];
                        for (var i = 0; i < queryResult.length; i++) {
                            if (!queryResult[i]['parent_id']) {
                                array.push(queryResult[i]);
                            }
                        }
                        data.returnDate = array;
                        res.json(data);
                    });
                });

            }

        }
    });
});
//删除地址
router.post('/baixiu/deleteAddress', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    var sql = 'select * from address m where m.parent_address = "' + req.body.id + '"';
    DbUtils.queryData(sql, function (result) {
        if (result.length == 0) {
            //查不出结果说明满足删除条件，执行修改数据库的sql
            var updateSql = 'delete from address where address_code = "' + req.body.id + '"';
            console.log('deleteAddress：' + updateSql);
            DbUtils.queryData(updateSql, function (updateResult) {
                var sql = "select a.address_desc as mnue_desc,a.address_code as url,a.parent_address as parent_id,a.address_code as id from address a";
                console.log('deleteAddress查询:' + sql)
                DbUtils.queryData(sql, function (queryResult) {
                    for (var i = 0; i < queryResult.length; i++) {
                        utils.addList(queryResult, queryResult[i]);
                    }
                    // 将result中所有节点parent_id值不为空的给踢出掉
                    var array = [];
                    for (var i = 0; i < queryResult.length; i++) {
                        if (!queryResult[i]['parent_id']) {
                            array.push(queryResult[i]);
                        }
                    }
                    var dataJson = {};
                    dataJson.returnData = array;
                    dataJson.status = 0;
                    dataJson.desc = '成功';
                    res.json(dataJson);
                });
            });
        } else {
            //可以查出结果集，说明改节点为父节点，并且对应的部分子节点没有删除完
            var errResult = {};
            errResult.status = 1;
            errResult.desc = '该目录下的部分子目录未被删除，请先删除对应的子目录';
            res.json(errResult);
        }
    });
});
//报销管理模块
router.get('/baixiu/bxManger', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('bxManger.html', {dataJsonArr: req.session.userInfo});
});
//获取订单信息
router.get('/baixiu/getOrderList', function (req, res) {
    var returnObj = {};
    returnObj.returnData = {
        offset: req.query.offset,
        pageSize: req.query.pageSize,
        startCompanyCode: req.query.startCompanyCode,
        endCompanyCode: req.query.endCompanyCode,
        startTime: req.query.startTime,
        endTime: req.query.endTime
    };
    var queryCountSql = "SELECT\n" +
        "\tcount(1) AS count\n" +
        "FROM\n" +
        "\ttrip_order o\n" +
        "WHERE\n" +
        "\to.email = '" + req.query.email + "'\n";
    if (req.query.startCompanyCode) {
        queryCountSql += "and o.start_company = '" + req.query.startCompanyCode + "'\n";
    }
    if (req.query.endCompanyCode) {
        queryCountSql += "and o.end_company = '" + req.query.endCompanyCode + "'\n";
    }
    if (req.query.startTime) {
        queryCountSql += "and o.start_date >= STR_TO_DATE('" + req.query.startTime + "', \"%Y-%m-%d\")\n";
    }
    if (req.query.endTime) {
        queryCountSql += "and o.start_date <= STR_TO_DATE('" + req.query.endTime + "', \"%Y-%m-%d\")\n";
    }
    console.log("queryCountSql:" + queryCountSql);
    DbUtils.queryData(queryCountSql, function (result) {
        returnObj.totalCount = result[0].count;
        if (result && result[0].count != '0') {
            var querySql = "SELECT\n" +
                "\to.*, (\n" +
                "\t\tdatediff(o.end_date, o.start_date) + 1\n" +
                "\t) AS totalDay,\n" +
                "\tDATE_FORMAT(o.start_date, \"%Y-%m-%d\") AS start_date_str,\n" +
                "\tDATE_FORMAT(o.end_date, \"%Y-%m-%d\") AS end_date_str,\n" +
                "\t(\n" +
                "\t\tSELECT\n" +
                "\t\t\torg.company_desc\n" +
                "\t\tFROM\n" +
                "\t\t\tcompany_org org\n" +
                "\t\tWHERE\n" +
                "\t\t\torg.company_code = o.start_company\n" +
                "\t) AS startCompanyDesc,\n" +
                "\t(\n" +
                "\t\tSELECT\n" +
                "\t\t\torg.company_desc\n" +
                "\t\tFROM\n" +
                "\t\t\tcompany_org org\n" +
                "\t\tWHERE\n" +
                "\t\t\torg.company_code = o.end_company\n" +
                "\t) AS endCompanyDesc,\n" +
                "\t(\n" +
                "\t\tSELECT\n" +
                "\t\t\ta.address_code\n" +
                "\t\tFROM\n" +
                "\t\t\taddress a\n" +
                "\t\tWHERE\n" +
                "\t\t\ta.address_code = (\n" +
                "\t\t\t\tSELECT\n" +
                "\t\t\t\t\torg.address_code\n" +
                "\t\t\t\tFROM\n" +
                "\t\t\t\t\tcompany_org org\n" +
                "\t\t\t\tWHERE\n" +
                "\t\t\t\t\torg.company_code = o.start_company\n" +
                "\t\t\t)\n" +
                "\t) AS startAddressCode,\n" +
                "\t(\n" +
                "\t\tSELECT\n" +
                "\t\t\ta.address_desc\n" +
                "\t\tFROM\n" +
                "\t\t\taddress a\n" +
                "\t\tWHERE\n" +
                "\t\t\ta.address_code = (\n" +
                "\t\t\t\tSELECT\n" +
                "\t\t\t\t\torg.address_code\n" +
                "\t\t\t\tFROM\n" +
                "\t\t\t\t\tcompany_org org\n" +
                "\t\t\t\tWHERE\n" +
                "\t\t\t\t\torg.company_code = o.start_company\n" +
                "\t\t\t)\n" +
                "\t) AS startAddressDesc,\n" +
                "\t(\n" +
                "\t\tSELECT\n" +
                "\t\t\ta.address_code\n" +
                "\t\tFROM\n" +
                "\t\t\taddress a\n" +
                "\t\tWHERE\n" +
                "\t\t\ta.address_code = (\n" +
                "\t\t\t\tSELECT\n" +
                "\t\t\t\t\torg.address_code\n" +
                "\t\t\t\tFROM\n" +
                "\t\t\t\t\tcompany_org org\n" +
                "\t\t\t\tWHERE\n" +
                "\t\t\t\t\torg.company_code = o.end_company\n" +
                "\t\t\t)\n" +
                "\t) AS endAddressCode,\n" +
                "\t(\n" +
                "\t\tSELECT\n" +
                "\t\t\ta.address_desc\n" +
                "\t\tFROM\n" +
                "\t\t\taddress a\n" +
                "\t\tWHERE\n" +
                "\t\t\ta.address_code = (\n" +
                "\t\t\t\tSELECT\n" +
                "\t\t\t\t\torg.address_code\n" +
                "\t\t\t\tFROM\n" +
                "\t\t\t\t\tcompany_org org\n" +
                "\t\t\t\tWHERE\n" +
                "\t\t\t\t\torg.company_code = o.end_company\n" +
                "\t\t\t)\n" +
                "\t) AS endAddressDesc,\n" +
                "\t(\n" +
                "\t\tSELECT\n" +
                "\t\t\tsum(\n" +
                "\t\t\t\tCASE\n" +
                "\t\t\t\tWHEN oc.cost_amount > (\n" +
                "\t\t\t\t\tCASE\n" +
                "\t\t\t\t\tWHEN ct.cost_cyc = 1 THEN\n" +
                "\t\t\t\t\t\t(\n" +
                "\t\t\t\t\t\t\tdatediff(\n" +
                "\t\t\t\t\t\t\t\tstr_to_date(o.end_date, '%Y-%m-%d'),\n" +
                "\t\t\t\t\t\t\t\tstr_to_date(o.start_date, '%Y-%m-%d')\n" +
                "\t\t\t\t\t\t\t) + 1\n" +
                "\t\t\t\t\t\t) * cs.max_cost\n" +
                "\t\t\t\t\tELSE\n" +
                "\t\t\t\t\t\tcs.max_cost\n" +
                "\t\t\t\t\tEND\n" +
                "\t\t\t\t) THEN\n" +
                "\t\t\t\t\t(\n" +
                "\t\t\t\t\t\tCASE\n" +
                "\t\t\t\t\t\tWHEN ct.cost_cyc = 1 THEN\n" +
                "\t\t\t\t\t\t\t(\n" +
                "\t\t\t\t\t\t\t\tdatediff(\n" +
                "\t\t\t\t\t\t\t\t\tstr_to_date(o.end_date, '%Y-%m-%d'),\n" +
                "\t\t\t\t\t\t\t\t\tstr_to_date(o.start_date, '%Y-%m-%d')\n" +
                "\t\t\t\t\t\t\t\t) + 1\n" +
                "\t\t\t\t\t\t\t) * cs.max_cost\n" +
                "\t\t\t\t\t\tELSE\n" +
                "\t\t\t\t\t\t\tcs.max_cost\n" +
                "\t\t\t\t\t\tEND\n" +
                "\t\t\t\t\t)\n" +
                "\t\t\t\tELSE\n" +
                "\t\t\t\t\toc.cost_amount\n" +
                "\t\t\t\tEND\n" +
                "\t\t\t)\n" +
                "\t\tFROM\n" +
                "\t\t\torder_char oc,\n" +
                "\t\t\tusers u,\n" +
                "\t\t\tcompany_org org,\n" +
                "\t\t\tcost_standard cs,\n" +
                "\t\t\tcost_type ct\n" +
                "\t\tWHERE\n" +
                "\t\t\toc.order_no = o.order_no\n" +
                "\t\tAND u.email = o.email\n" +
                "\t\tAND u.`level` = cs.`level`\n" +
                "\t\tAND o.end_company = org.company_code\n" +
                "\t\tAND org.is_tz = cs.is_tz\n" +
                "\t\tAND oc.cost_type = cs.cost_type\n" +
                "\t\tAND cs.cost_type = ct.cost_type\n" +
                "\t) AS bxAmonut\n" +
                "FROM\n" +
                "\ttrip_order o\n" +
                "WHERE\n" +
                "\to.email = '" + req.query.email + "'\n";
            if (req.query.startCompanyCode) {
                querySql += "and o.start_company = '" + req.query.startCompanyCode + "'\n";
            }
            if (req.query.endCompanyCode) {
                querySql += "and o.end_company = '" + req.query.endCompanyCode + "'\n";
            }
            if (req.query.startTime) {
                querySql += "and o.start_date >= STR_TO_DATE('" + req.query.startTime + "', \"%Y-%m-%d\")\n";
            }
            if (req.query.endTime) {
                querySql += "and o.start_date <= STR_TO_DATE('" + req.query.endTime + "', \"%Y-%m-%d\")\n";
            }
            querySql += "ORDER BY\n" +
                "\to.start_date DESC\n";
            if (req.query.offset && req.query.pageSize) {
                querySql += "LIMIT " + ((req.query.offset - 1) * req.query.pageSize) + "," + req.query.pageSize;
            }
            console.log('getOrderList查询数据：' + querySql);
            // querySql += ' LIMIT ' + ((req.query.offset - 1) * req.query.pageSize) + ',\n' + req.query.pageSize;
            DbUtils.queryData(querySql, function (resultList) {
                console.log('getOrderList查询数据：' + querySql);
                if (resultList && resultList.length > 0) {
                    returnObj.getlist_status = 0;
                    returnObj.getlist_desc = '获取数据成功';
                    returnObj.ordersJsonArray = resultList;
                } else {
                    returnObj.getlist_status = 1;
                    returnObj.getlist_desc = '未获取到数据';
                }
                res.json(returnObj);
            });
        } else {
            returnObj.getlist_status = 1;
            returnObj.getlist_desc = '未获取到数据';
            res.json(returnObj);
        }
    })
});
//查询订单对应的费用
router.get('/baixiu/searchOrderCost', function (req, res) {
    var querySql = "SELECT\n" +
        "\toc.id AS id,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\tt.cost_desc\n" +
        "\t\tFROM\n" +
        "\t\t\tcost_type t\n" +
        "\t\tWHERE\n" +
        "\t\t\tt.cost_type = oc.cost_type\n" +
        "\t) AS costDesc,\n" +
        "\tcs.cost_type AS costType,\n" +
        "\toc.cost_amount AS amount,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\tCASE\n" +
        "\t\tWHEN c.cost_cyc = 1 THEN\n" +
        "\t\t\tcs.max_cost * (\n" +
        "\t\t\t\tdatediff(\n" +
        "\t\t\t\t\tstr_to_date(o.end_date, '%Y-%m-%d'),\n" +
        "\t\t\t\t\tstr_to_date(o.start_date, '%Y-%m-%d')\n" +
        "\t\t\t\t) + 1\n" +
        "\t\t\t)\n" +
        "\t\tELSE\n" +
        "\t\t\tcs.max_cost\n" +
        "\t\tEND\n" +
        "\t) AS ceilingAmount\n" +
        "FROM\n" +
        "\ttrip_order o,\n" +
        "\torder_char oc,\n" +
        "\tcost_standard cs,\n" +
        "\tusers u,\n" +
        "\tcompany_type ct,\n" +
        "\tcompany_org org,\n" +
        "\tcost_type c\n" +
        "WHERE\n" +
        "\to.email = u.email\n" +
        "AND u. LEVEL = cs. LEVEL\n" +
        "AND o.end_company = org.company_code\n" +
        "AND org.is_tz = cs.is_tz\n" +
        "AND oc.cost_type = cs.cost_type\n" +
        "AND o.order_no = oc.order_no\n" +
        "AND cs.cost_type = c.cost_type\n" +
        "AND o.email = '" + req.query.email + "'\n" +
        "AND o.order_no = '" + req.query.orderNo + "'\n" +
        "GROUP BY\n" +
        "\toc.id,\n" +
        "\tcostDesc,\n" +
        "\tcostType,\n" +
        "\tamount,\n" +
        "\tceilingAmount";
    console.log('searchOrderCost查询:' + querySql);
    DbUtils.queryData(querySql, function (result) {
        console.log(result);
        res.json({
            status: 0,
            returnData: result
        });
    }, function (error) {
        res.json({
            status: -1
        });
    });

});
//费用类型管理
router.get('/baixiu/costType', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    res.render('costType.html', {dataJsonArr: req.session.userInfo});
});
//查询费用类型
router.get('/baixiu/searchCostTypeList', function (req, res) {
    var returnObj = {};
    returnObj.returnData = {
        offset: req.query.offset,
        pageSize: req.query.pageSize,
        email: req.query.email
    };
    var queryCountSql = "SELECT\n" +
        "\tcount(1) AS count\n" +
        "FROM\n" +
        "\tcost_standard c\n" +
        "WHERE\n" +
        "\tc. STATUS = 0";
    DbUtils.queryData(queryCountSql, function (result) {
        if (result && result[0].count != '0') {
            returnObj.totalCount = result[0].count;
            var querySql = "SELECT\n" +
                "\tcs.cost_type AS costTypeCode,\n" +
                "\tCONCAT(\n" +
                "\t\tct.company_type_desc,\n" +
                "\t\tlt.level_desc,\n" +
                "\t\t(\n" +
                "\t\t\tSELECT\n" +
                "\t\t\t\tt.cost_desc\n" +
                "\t\t\tFROM\n" +
                "\t\t\t\tcost_type t\n" +
                "\t\t\tWHERE\n" +
                "\t\t\t\tt.cost_type = cs.cost_type\n" +
                "\t\t)\n" +
                "\t) AS costTypeDesc,\n" +
                "\tcs.cost_type,\n" +
                "\tcs.max_cost AS ceilCost,\n" +
                "\tct.is_tz AS companyTypeCode,\n" +
                "\tlt. LEVEL AS LEVEL,\n" +
                "\tct.company_type_desc AS companyTypeDesc,\n" +
                "\tlt.level_desc AS levelDesc,\n" +
                "\t(\n" +
                "\t\tSELECT\n" +
                "\t\t\tt.cost_desc\n" +
                "\t\tFROM\n" +
                "\t\t\tcost_type t\n" +
                "\t\tWHERE\n" +
                "\t\t\tt.cost_type = cs.cost_type\n" +
                "\t) AS costDesc\n" +
                "FROM\n" +
                "\tcost_standard cs,\n" +
                "\tlevel_table lt,\n" +
                "\tcompany_type ct\n" +
                "WHERE\n" +
                "\tcs.is_tz = ct.is_tz\n" +
                "AND cs. LEVEL = lt. LEVEL\n" +
                "AND cs. STATUS = 0\n";
            if (req.query.offset && req.query.pageSize) {
                querySql += "LIMIT " + ((req.query.offset - 1) * req.query.pageSize) + "," + req.query.pageSize;
            }
            console.log('searchCostTypeList：' + querySql);
            DbUtils.queryData(querySql, function (resultList) {
                console.log('searchCostTypeList查询数据：' + querySql);
                if (resultList && resultList.length > 0) {
                    returnObj.getlist_status = 0;
                    returnObj.getlist_desc = '获取数据成功';
                    returnObj.costTypeJsonArray = resultList;
                } else {
                    returnObj.getlist_status = 1;
                    returnObj.getlist_desc = '未获取到数据';
                }
                res.json(returnObj);
            });
        } else {
            returnObj.getlist_status = 1;
            returnObj.getlist_desc = '未获取到数据';
            res.json(returnObj);
        }
    }, function (error) {
        returnObj.getlist_status = -1;
        returnObj.getlist_desc = '未获取到数据';
        res.json(returnObj);
    });
});
//查询费用类型信息
router.get('/baixiu/searchCostTypeInfo', function (req, res) {
    var querySql = "SELECT\n" +
        "\tcs.cost_type AS costTypeCode,\n" +
        "\tCONCAT(\n" +
        "\t\tct.company_type_desc,\n" +
        "\t\tlt.level_desc,\n" +
        "\t\t(\n" +
        "\t\t\tSELECT\n" +
        "\t\t\t\tt.cost_desc\n" +
        "\t\t\tFROM\n" +
        "\t\t\t\tcost_type t\n" +
        "\t\t\tWHERE\n" +
        "\t\t\t\tt.cost_type = cs.cost_type\n" +
        "\t\t)\n" +
        "\t) AS costTypeDesc,\n" +
        "\tcs.cost_type,\n" +
        "\tcs.max_cost AS ceilCost,\n" +
        "\tct.is_tz AS companyTypeCode,\n" +
        "\tlt. LEVEL AS LEVEL,\n" +
        "\tct.company_type_desc AS companyTypeDesc,\n" +
        "\tlt.level_desc AS levelDesc,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\tt.cost_desc\n" +
        "\t\tFROM\n" +
        "\t\t\tcost_type t\n" +
        "\t\tWHERE\n" +
        "\t\t\tt.cost_type = cs.cost_type\n" +
        "\t) AS costDesc\n" +
        "FROM\n" +
        "\tcost_standard cs,\n" +
        "\tlevel_table lt,\n" +
        "\tcompany_type ct\n" +
        "WHERE\n" +
        "\tcs.is_tz = ct.is_tz\n" +
        "AND cs. LEVEL = lt. LEVEL\n" +
        "AND cs. STATUS = 0\n" +
        "AND cs.is_tz = " + req.query.companyType + "\n" +
        "AND cs.cost_type = '" + req.query.costTypeCode + "'\n" +
        "AND cs. LEVEL = " + req.query.levelCode;
    console.log('查询searchCostTypeInfo：' + querySql);
    DbUtils.queryData(querySql, function (result) {
        res.json({
            status: 0,
            returnData: result
        });
    }, function (error) {
        res.json({
            status: 0,
            returnData: error
        });
    });
});
router.get('/baixiu/modifyCostTypeInfo', function (req, res) {
    var updateSql = "UPDATE cost_standard cs,\n" +
        " cost_type ct\n" +
        "SET cs.max_cost = '" + req.query.costMaxAmount + "',\n" +
        " ct.cost_desc = '" + req.query.costTypeDesc + "'\n" +
        "WHERE\n" +
        "\tcs. LEVEL = " + req.query.levelCode + "\n" +
        "AND cs.is_tz = " + req.query.companyType + "\n" +
        "AND cs.cost_type = '" + req.query.costTypeCode + "'\n" +
        "AND ct.cost_type = cs.cost_type";
    console.log('更新modifyCostTypeInfo：' + updateSql);
    DbUtils.queryData(updateSql, function (result) {
        if (result.affectedRows > 0) {
            res.json({
                status: 0,
                desc: '修改成功'
            });
        } else {
            res.json({
                status: 0,
                desc: '没有修改项'
            });
        }
    }, function (error) {
        res.json({
            status: -1,
            desc: '更新失败'
        });
    });
});
//查询公司、职位、费用类型接口
router.get('/baixiu/searchType', function (req, res) {
    var queryType = req.query.queryType;
    var querySql = "";
    if (queryType == 'FY') {//费用类型列表
        querySql = "select c.cost_type as code,c.cost_desc as descr from cost_type c";
    } else if (queryType == 'GS') {//公司类型列表
        querySql = "select t.is_tz as code,t.company_type_desc as descr from company_type t";
    } else if (queryType == 'ZJ') {//职级类型列表
        querySql = "select l.level as code,l.level_desc as descr from level_table l";
    }
    var returnObj = {};
    DbUtils.queryData(querySql, function (result) {
        returnObj.status = 0;
        returnObj.returnData = result;
        for (var i = 0; i < result.length; i++) {
            returnObj.returnData[i].queryType = queryType;
        }
        returnObj.desc = '查询成功';
        res.json(returnObj);
    }, function (error) {
        returnObj.status = -1;
        returnObj.error = error;
        res.json(returnObj);
    });

});
//新增费用标准表
router.get('/baixiu/addCostStandardInfo', function (req, res) {
    var querySql = "SELECT\n" +
        "\tcount(1) AS count\n" +
        "FROM\n" +
        "\tcost_standard cs\n" +
        "WHERE\n" +
        "\tcs.cost_type = '" + req.query.costType + "'\n" +
        "AND cs.is_tz = " + req.query.companyType + "\n" +
        "AND cs. LEVEL = " + req.query.levelType;
    console.log('addCostStandardInfo查询：' + querySql);
    DbUtils.queryData(querySql, function (result) {
        if (parseInt(result[0].count) > 0) {
            res.json({
                status: 1,
                desc: '此费用标准已经存在，不能重复添加'
            })
        } else {
            var querySql = "insert into cost_standard VALUES ('" + req.query.costType + "'," + req.query.maxAmount + "," + req.query.levelType + "," + req.query.companyType + ",0)"
            console.log('addCostStandardInfo新增:' + querySql);
            DbUtils.queryData(querySql, function (result) {
                res.json({
                    status: 0,
                    desc: '新增成功'
                })
            })
        }
    }, function (error) {
        res.json({
            status: -1,
            desc: '服务器出错'
        })
    });
});
//删除费用标准数据
router.get('/baixiu/costStandardDelete', function (req, res) {
    var costTypeCode = req.query.costTypeCode;
    var companyTypeCode = req.query.companyTypeCode;
    var levelTypeCode = req.query.levelTypeCode;
    var deleteSql = "DELETE\n" +
        "FROM\n" +
        "\tcost_standard\n" +
        "WHERE\n" +
        "\tcost_type = '" + costTypeCode + "'\n" +
        "AND LEVEL = " + levelTypeCode + "\n" +
        "AND is_tz = " + companyTypeCode;
    console.log('costStandardDelete删除：' + deleteSql);
    DbUtils.queryData(deleteSql, function (result) {
        res.json({
            status: 0,
            desc: '删除成功'
        });
    }, function (error) {
        res.json({
            status: -1,
            desc: '删除失败'
        });
    });
});
//费用类型维护模块
router.get('/baixiu/costTypeMaintenance', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('costMaintenance.html', {dataJsonArr: req.session.userInfo});
});
//费用类型列表查询
router.get('/baixiu/searchCostTypeMaintenanceList', function (req, res) {
    var returnObj = {};
    returnObj.returnData = {
        offset: req.query.offset,
        pageSize: req.query.pageSize,
    };
    var queryCountSql = "SELECT\n" +
        "\tcount(1) AS count\n" +
        "FROM\n" +
        "\tcost_type c\n";
    DbUtils.queryData(queryCountSql, function (result) {
        if (result && result[0].count != '0') {
            returnObj.totalCount = result[0].count;
            var querySql = "SELECT\n" +
                "\tct.cost_type AS costTypeCode,\n" +
                "\tct.cost_desc AS costTypeDesc\n" +
                "FROM\n" +
                "\tcost_type ct\n";
            if (req.query.offset && req.query.pageSize) {
                querySql += "LIMIT " + ((req.query.offset - 1) * req.query.pageSize) + "," + req.query.pageSize;
            }
            console.log('searchCostTypeMaintenanceList查询数据：' + querySql);
            DbUtils.queryData(querySql, function (resultList) {
                if (resultList && resultList.length > 0) {
                    returnObj.getlist_status = 0;
                    returnObj.getlist_desc = '获取数据成功';
                    returnObj.costTypeJsonArray = resultList;
                } else {
                    returnObj.getlist_status = 1;
                    returnObj.getlist_desc = '未获取到数据';
                }
                res.json(returnObj);
            });
        } else {
            returnObj.getlist_status = 1;
            returnObj.getlist_desc = '未获取到数据';
            res.json(returnObj);
        }
    }, function (error) {
        returnObj.getlist_status = -1;
        returnObj.getlist_desc = '未获取到数据';
        res.json(returnObj);
    });
});
//费用类型信息查询
router.get('/baixiu/searchCostMaintenanceTypeInfo', function (req, res) {
    var querySql = "SELECT\n" +
        "\tct.cost_type AS costTypeCode,\n" +
        "\tct.cost_desc AS costTypeDesc,\n" +
        "\tct.cost_cyc AS cost_cyc\n" +
        "FROM\n" +
        "\tcost_type ct where ct.cost_type = '" + req.query.costTypeCode + "'";
    console.log('searchCostMaintenanceTypeInfo：' + querySql);
    var date = {};
    date.returnData = {};
    DbUtils.queryData(querySql, function (result) {
        querySql = "select * from cost_standard_cyc";
        date.returnData.result = result;
        date.status = 0;
        DbUtils.queryData(querySql, function (resultFix) {
            date.returnData.fixList = resultFix;
            res.json(date);
        });

    }, function (error) {
        res.json({
            status: 0,
            returnData: error
        });
    });
});
//费用类型修改
router.get('/baixiu/modifyCostTypeMaintenanceInfo', function (req, res) {
    var updateSql = "UPDATE cost_type cs\n" +
        "SET cs.cost_desc = '" + req.query.costTypeDesc + "',\n" +
        "cs.cost_cyc =" + req.query.costCyc + "\n" +
        "WHERE\n" +
        "\tcs.cost_type = '" + req.query.costTypeCode + "'";
    console.log('modifyCostTypeMaintenanceInfo：' + updateSql);
    DbUtils.queryData(updateSql, function (result) {
        if (result.affectedRows > 0) {
            res.json({
                status: 0,
                desc: '修改成功'
            });
        } else {
            res.json({
                status: 0,
                desc: '没有修改项'
            });
        }
    }, function (error) {
        res.json({
            status: -1,
            desc: '更新失败'
        });
    });
});
//新增费用类型表
//新增费用标准表
router.get('/baixiu/addCostTypeInfo', function (req, res) {
    var querySql = "select count(1) as count from cost_type ct where ct.cost_type = '" + req.query.costType + "'";
    console.log('addCostTypeInfo查询：' + querySql);
    DbUtils.queryData(querySql, function (result) {
        if (parseInt(result[0].count) > 0) {
            res.json({
                status: 1,
                desc: '此费用类型已经存在，不能重复添加'
            })
        } else {
            var querySql = "insert into cost_type VALUES('" + req.query.costType + "','" + req.query.costTypeDesc + "','" + req.query.costCyc + "')";
            console.log('addCostStandardInfo新增:' + querySql);
            DbUtils.queryData(querySql, function (result) {
                res.json({
                    status: 0,
                    desc: '新增成功'
                })
            })
        }
    }, function (error) {
        res.json({
            status: -1,
            desc: '服务器出错'
        })
    });
});
//删除费用类型数据
router.get('/baixiu/costTypeDelete', function (req, res) {
    var costTypeCode = req.query.costTypeCode;
    var deleteSql = "DELETE\n" +
        "FROM\n" +
        "\tcost_type\n" +
        "WHERE\n" +
        "\tcost_type = '" + costTypeCode + "'"
    console.log('costTypeDelete删除：' + deleteSql);
    DbUtils.queryData(deleteSql, function (result) {
        res.json({
            status: 0,
            desc: '删除成功'
        });
    }, function (error) {
        res.json({
            status: -1,
            desc: '删除失败'
        });
    });
});
//公司类别维护模块
router.get('/baixiu/companyMaintenance', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('companyMaintenance.html', {dataJsonArr: req.session.userInfo});
});
//获取公司类别数据列表
router.get('/baixiu/searchCompanyTypeMaintenanceList', function (req, res) {
    var returnObj = {};
    returnObj.returnData = {
        offset: req.query.offset,
        pageSize: req.query.pageSize,
    };
    var queryCountSql = "SELECT\n" +
        "\tcount(1) AS count\n" +
        "FROM\n" +
        "\tcompany_type c\n";
    console.log('searchCompanyTypeMaintenanceList查询个数：' + queryCountSql);
    DbUtils.queryData(queryCountSql, function (result) {
        if (result && result[0].count != '0') {
            returnObj.totalCount = result[0].count;
            var querySql = "SELECT\n" +
                "\tct.is_tz AS costTypeCode,\n" +
                "\tct.company_type_desc AS costTypeDesc\n" +
                "FROM\n" +
                "\tcompany_type ct\n";
            if (req.query.offset && req.query.pageSize) {
                querySql += "LIMIT " + ((req.query.offset - 1) * req.query.pageSize) + "," + req.query.pageSize;
            }
            console.log('searchCompanyTypeMaintenanceList查询数据：' + querySql);
            DbUtils.queryData(querySql, function (resultList) {
                if (resultList && resultList.length > 0) {
                    returnObj.getlist_status = 0;
                    returnObj.getlist_desc = '获取数据成功';
                    returnObj.costTypeJsonArray = resultList;
                } else {
                    returnObj.getlist_status = 1;
                    returnObj.getlist_desc = '未获取到数据';
                }
                res.json(returnObj);
            });
        } else {
            returnObj.getlist_status = 1;
            returnObj.getlist_desc = '未获取到数据';
            res.json(returnObj);
        }
    }, function (error) {
        returnObj.getlist_status = -1;
        returnObj.getlist_desc = '未获取到数据';
        res.json(returnObj);
    });
});
//获取公司类别信息
router.get('/baixiu/searchCompanyMaintenanceTypeInfo', function (req, res) {
    var querySql = "SELECT\n" +
        "\tct.is_tz AS costTypeCode,\n" +
        "\tct.company_type_desc AS costTypeDesc\n" +
        "FROM\n" +
        "\tcompany_type ct where ct.is_tz =" + req.query.costTypeCode;
    console.log('searchCompanyMaintenanceTypeInfo：' + querySql);
    DbUtils.queryData(querySql, function (result) {
        res.json({
            status: 0,
            returnData: result
        });
    }, function (error) {
        res.json({
            status: 0,
            returnData: error
        });
    });
});
//修改公司名称
router.get('/baixiu/modifyCompanyTypeMaintenanceInfo', function (req, res) {
    var updateSql = "UPDATE company_type cs\n" +
        "SET cs.company_type_desc = '" + req.query.costTypeDesc + "'\n" +
        "WHERE\n" +
        "\tcs.is_tz = '" + req.query.costTypeCode + "'";
    console.log('modifyCostTypeMaintenanceInfo：' + updateSql);
    DbUtils.queryData(updateSql, function (result) {
        if (result.affectedRows > 0) {
            res.json({
                status: 0,
                desc: '修改成功'
            });
        } else {
            res.json({
                status: 0,
                desc: '没有修改项'
            });
        }
    }, function (error) {
        res.json({
            status: -1,
            desc: '更新失败'
        });
    });
});
//新增公司类型
router.get('/baixiu/addCompanyTypeInfo', function (req, res) {
    var querySql = "select count(1) as count from company_type ct where ct.is_tz = " + req.query.costType;
    console.log('addCompanyTypeInfo查询：' + querySql);
    DbUtils.queryData(querySql, function (result) {
        if (parseInt(result[0].count) > 0) {
            res.json({
                status: 1,
                desc: '此公司类型已经存在，不能重复添加'
            })
        } else {
            var querySql = "insert into company_type VALUES(" + req.query.costType + ",'" + req.query.costTypeDesc + "')";
            console.log('addCompanyTypeInfo新增:' + querySql);
            DbUtils.queryData(querySql, function (result) {
                res.json({
                    status: 0,
                    desc: '新增成功'
                })
            })
        }
    }, function (error) {
        res.json({
            status: -1,
            desc: '服务器出错'
        })
    });
});
//删除公司类型
router.get('/baixiu/companyTypeDelete', function (req, res) {
    var costTypeCode = req.query.costTypeCode;
    var deleteSql = "DELETE\n" +
        "FROM\n" +
        "\tcompany_type\n" +
        "WHERE\n" +
        "\tis_tz = " + costTypeCode;
    console.log('costTypeDelete删除：' + deleteSql);
    DbUtils.queryData(deleteSql, function (result) {
        res.json({
            status: 0,
            desc: '删除成功'
        });
    }, function (error) {
        res.json({
            status: -1,
            desc: '删除失败'
        });
    });
});
//职位类型维护模块
router.get('/baixiu/levelMaintenance', function (req, res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('levelMaintenance.html', {dataJsonArr: req.session.userInfo});
});
//查看职位类型列表
router.get('/baixiu/searchLevelTypeMaintenanceList', function (req, res) {
    var returnObj = {};
    returnObj.returnData = {
        offset: req.query.offset,
        pageSize: req.query.pageSize,
    };
    var queryCountSql = "SELECT\n" +
        "\tcount(1) AS count\n" +
        "FROM\n" +
        "\tlevel_table c\n";
    DbUtils.queryData(queryCountSql, function (result) {
        if (result && result[0].count != '0') {
            returnObj.totalCount = result[0].count;
            var querySql = "SELECT\n" +
                "\tl. LEVEL AS costTypeCode,\n" +
                "\tl.level_desc AS costTypeDesc\n" +
                "FROM\n" +
                "\tlevel_table l\n";
            if (req.query.offset && req.query.pageSize) {
                querySql += "LIMIT " + ((req.query.offset - 1) * req.query.pageSize) + "," + req.query.pageSize;
            }
            console.log('searchLevelTypeMaintenanceList查询数据：' + querySql);
            DbUtils.queryData(querySql, function (resultList) {
                if (resultList && resultList.length > 0) {
                    returnObj.getlist_status = 0;
                    returnObj.getlist_desc = '获取数据成功';
                    returnObj.costTypeJsonArray = resultList;
                } else {
                    returnObj.getlist_status = 1;
                    returnObj.getlist_desc = '未获取到数据';
                }
                res.json(returnObj);
            });
        } else {
            returnObj.getlist_status = 1;
            returnObj.getlist_desc = '未获取到数据';
            res.json(returnObj);
        }
    }, function (error) {
        returnObj.getlist_status = -1;
        returnObj.getlist_desc = '未获取到数据';
        res.json(returnObj);
    });
});
//获取职位列别信息
router.get('/baixiu/searchLevelMaintenanceTypeInfo', function (req, res) {
    var querySql = "SELECT\n" +
        "\tct.level AS costTypeCode,\n" +
        "\tct.level_desc AS costTypeDesc\n" +
        "FROM\n" +
        "\tlevel_table ct where ct.level =" + req.query.costTypeCode;
    console.log('searchLevelMaintenanceTypeInfo：' + querySql);
    DbUtils.queryData(querySql, function (result) {
        res.json({
            status: 0,
            returnData: result
        });
    }, function (error) {
        res.json({
            status: 0,
            returnData: error
        });
    });
});
//新增职位类别信息
router.get('/baixiu/addLevelTypeInfo', function (req, res) {
    var querySql = "select count(1) as count from level_table ct where ct.LEVEL = " + req.query.costType;
    console.log('addLevelTypeInfo查询：' + querySql);
    DbUtils.queryData(querySql, function (result) {
        if (parseInt(result[0].count) > 0) {
            res.json({
                status: 1,
                desc: '此公司类型已经存在，不能重复添加'
            })
        } else {
            var querySql = "insert into level_table VALUES(" + req.query.costType + ",'" + req.query.costTypeDesc + "')";
            console.log('addLevelTypeInfo新增:' + querySql);
            DbUtils.queryData(querySql, function (result) {
                res.json({
                    status: 0,
                    desc: '新增成功'
                })
            })
        }
    }, function (error) {
        res.json({
            status: -1,
            desc: '服务器出错'
        })
    });
});
//修改职位类别信息
router.get('/baixiu/modifyLevelTypeMaintenanceInfo', function (req, res) {
    var updateSql = "UPDATE level_table cs\n" +
        "SET cs.level_desc = '" + req.query.costTypeDesc + "'\n" +
        "WHERE\n" +
        "\tcs.level = '" + req.query.costTypeCode + "'";
    console.log('modifyLevelTypeMaintenanceInfo：' + updateSql);
    DbUtils.queryData(updateSql, function (result) {
        if (result.affectedRows > 0) {
            res.json({
                status: 0,
                desc: '修改成功'
            });
        } else {
            res.json({
                status: 0,
                desc: '没有修改项'
            });
        }
    }, function (error) {
        res.json({
            status: -1,
            desc: '更新失败'
        });
    });
});
//删除职位类别信息
router.get('/baixiu/levelTypeDelete', function (req, res) {
    var costTypeCode = req.query.costTypeCode;
    var deleteSql = "DELETE\n" +
        "FROM\n" +
        "\tlevel_table\n" +
        "WHERE\n" +
        "\tlevel = " + costTypeCode;
    console.log('costTypeDelete删除：' + deleteSql);
    DbUtils.queryData(deleteSql, function (result) {
        res.json({
            status: 0,
            desc: '删除成功'
        });
    }, function (error) {
        res.json({
            status: -1,
            desc: '删除失败'
        });
    });
});
//更新金额
router.post('/baixiu/modifyAmount', function (req, res) {
    var id = req.body.id;
    var amount = req.body.amount;
    var updateSql = "UPDATE order_char oc set oc.cost_amount = " + amount + " where oc.id = " + id;
    console.log('modifyAmount修改金额：' + updateSql);
    DbUtils.queryData(updateSql, function (result) {
        res.json({
            status: 0
        });
    }, function (error) {
        res.json({
            status: -1,
            error
        })
    });
});
//根据账号和订单查询费用标准
router.get('/baixiu/searchCostStandard', function (req, res) {
    var email = req.query.email;
    var orderNo = req.query.orderNo;
    var querySql = "SELECT\n" +
        "\tCONCAT(\n" +
        "\t\tct.company_type_desc,\n" +
        "\t\tlt.level_desc,\n" +
        "\t\tcy.cost_desc\n" +
        "\t) AS costDesc,\n" +
        "\tcs.cost_type AS costType,\n" +
        "\tcs.max_cost AS ceilingAmount\n" +
        "FROM\n" +
        "\ttrip_order o,\n" +
        "\tcost_standard cs,\n" +
        "\tusers u,\n" +
        "\tcompany_type ct,\n" +
        "\tcompany_org org,\n" +
        "\tlevel_table lt,\n" +
        "\tcost_type cy\n" +
        "WHERE\n" +
        "\to.email = u.email\n" +
        "AND u. LEVEL = cs. LEVEL\n" +
        "AND o.end_company = org.company_code\n" +
        "AND org.is_tz = cs.is_tz\n" +
        "AND o.email = '" + email + "'\n" +
        "AND o.order_no = '" + orderNo + "'\n" +
        "AND lt.`level` = u.`level`\n" +
        "AND cs.is_tz = ct.is_tz\n" +
        "AND cs.cost_type = cy.cost_type\n" +
        "GROUP BY\n" +
        "\tcostType,\n" +
        "\tcostDesc,\n" +
        "\tceilingAmount;\n" +
        "\n";
    console.log('searchCostStandard查询:' + querySql);
    DbUtils.queryData(querySql, function (result) {
        res.json({
            status: 0,
            returnData: result
        });
    }, function (error) {
        res.json({
            status: -1,
            return: error
        })
    })
});
//根据订单编号新增费用
router.post('/baixiu/addOrderAmount', function (req, res) {
    var orderNo = req.body.orderNo;
    var costType = req.body.costType;
    var amount = req.body.amount;
    var insertSql = "INSERT INTO order_char\n" +
        "VALUES\n" +
        "\t(\n" +
        "\t\tNULL,\n" +
        "\t\t'" + orderNo + "',\n" +
        "\t\t'" + costType + "',\n" +
        "\t\t" + amount + "\n" +
        "\t)";
    console.log('addOrderAmount新增:' + insertSql);
    DbUtils.queryData(insertSql, function () {
        res.json({
            status: 0,
            desc: '新增成功'
        })
    }, function (error) {
        res.json({
            status: -1,
            desc: '新增是失败'
        })
    });
});
//根据id单春订单金额
router.post('/baixiu/deleteOrderAmount', function (req, res) {
    var id = req.body.id;
    var deleteSql = "delete from order_char where id = " + id;
    console.log('deleteOrderAmount删除订单金额：' + deleteSql);
    DbUtils.queryData(deleteSql, function (result) {
        res.json({
            status: 0,
            desc: '删除成功'
        })
    }, function (error) {
        res.json({
            status: -1,
            error
        })
    });
});

router.get('/baixiu/getCostTypeIsByDay', function (req, res) {
    var querySql = "select * from cost_standard_cyc";
    DbUtils.queryData(querySql, function (result) {
        var returnData = {};
        returnData.status = 0;
        returnData.fixList = result
        res.json(returnData);
    }, function (error) {
        res.json({
            status: -1,
            error
        });
    });
});
//生成报销excel
router.get('/baixiu/downLoadBxCost', function (req, res) {
    var orderNo = req.query.orderNo;
    var querySql = "SELECT\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\tl.level_desc\n" +
        "\t\tFROM\n" +
        "\t\t\tlevel_table l,\n" +
        "\t\t\tusers u\n" +
        "\t\tWHERE\n" +
        "\t\t\tl.`level` = u.`level`\n" +
        "\t\tAND u.email = o.email\n" +
        "\t) AS levelDesc,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\tos.company_desc\n" +
        "\t\tFROM\n" +
        "\t\t\tcompany_org os\n" +
        "\t\tWHERE\n" +
        "\t\t\tos.company_code = o.start_company\n" +
        "\t) AS department,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\tu.nickname\n" +
        "\t\tFROM\n" +
        "\t\t\tusers u\n" +
        "\t\tWHERE\n" +
        "\t\t\tu.email = o.email\n" +
        "\t) AS NAME,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\ta.address_desc\n" +
        "\t\tFROM\n" +
        "\t\t\tcompany_org os,\n" +
        "\t\t\taddress a\n" +
        "\t\tWHERE\n" +
        "\t\t\tos.company_code = o.end_company\n" +
        "\t\tAND a.address_code = os.address_code\n" +
        "\t) AS address,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\torg.is_tz\n" +
        "\t\tFROM\n" +
        "\t\t\tcompany_org org\n" +
        "\t\tWHERE\n" +
        "\t\t\torg.company_code = o.end_company\n" +
        "\t) AS isTz,\n" +
        "\t(\n" +
        "\t\tdatediff(\n" +
        "\t\t\tstr_to_date(o.end_date, '%Y-%m-%d'),\n" +
        "\t\t\tstr_to_date(o.start_date, '%Y-%m-%d')\n" +
        "\t\t) + 1\n" +
        "\t) AS tripTime,\n" +
        "\tdatediff(\n" +
        "\t\tstr_to_date(o.end_date, '%Y-%m-%d'),\n" +
        "\t\tstr_to_date(o.start_date, '%Y-%m-%d')\n" +
        "\t) AS accommodationTime,\n" +
        "\tgetStandardCost (o.order_no, 'ZS') AS zsStandard,\n" +
        "\tgetBxCostByType (o.order_no, 'ZS') AS zsCost,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\tCASE\n" +
        "\t\tWHEN org.is_tz = 1 THEN\n" +
        "\t\t\tgetBxCostByType (o.order_no, 'CY')\n" +
        "\t\tELSE\n" +
        "\t\t\t''\n" +
        "\t\tEND\n" +
        "\t\tFROM\n" +
        "\t\t\tcompany_org org\n" +
        "\t\tWHERE\n" +
        "\t\t\torg.company_code = o.end_company\n" +
        "\t) AS cyYdCost,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\tCASE\n" +
        "\t\tWHEN org.is_tz <> 1 THEN\n" +
        "\t\t\tgetBxCostByType (o.order_no, 'CY')\n" +
        "\t\tELSE\n" +
        "\t\t\t0\n" +
        "\t\tEND\n" +
        "\t\tFROM\n" +
        "\t\t\tcompany_org org\n" +
        "\t\tWHERE\n" +
        "\t\t\torg.company_code = o.end_company\n" +
        "\t) AS cyCost,\n" +
        "\tgetBxCostByType (o.order_no, 'JT') AS jtStandard,\n" +
        "\tgetBxCostByType (o.order_no, 'JT') + getBxCostByType (o.order_no, 'CY') AS totalBz,\n" +
        "\tgetBxCostByType (o.order_no, 'JP') + getBxCostByType (o.order_no, 'JPRY') + getBxCostByType (o.order_no, 'BXF') AS jpTotal,\n" +
        "\tgetBxCostByType (o.order_no, 'JP') AS jpCost,\n" +
        "\tgetBxCostByType (o.order_no, 'JPRY') AS jpryCost,\n" +
        "\tgetBxCostByType (o.order_no, 'BXF') AS bxfCost,\n" +
        "\tgetBxCostByType (o.order_no, 'GT') AS gtfCost,\n" +
        "\tgetBxCostByType (o.order_no, 'CZF') AS czcCost,\n" +
        "\tgetBxCostByType (o.order_no, 'TXF') AS txfCost,\n" +
        "\t(\n" +
        "\t\tSELECT\n" +
        "\t\t\tSUM(\n" +
        "\t\t\t\tCASE\n" +
        "\t\t\t\tWHEN c.cost_amount > CASE\n" +
        "\t\t\t\tWHEN ct.cost_cyc = 1 THEN\n" +
        "\t\t\t\t\t(\n" +
        "\t\t\t\t\t\tCASE\n" +
        "\t\t\t\t\t\tWHEN ct.cost_type = 'ZS' THEN\n" +
        "\t\t\t\t\t\t\tdatediff(\n" +
        "\t\t\t\t\t\t\t\tstr_to_date(o.end_date, '%Y-%m-%d'),\n" +
        "\t\t\t\t\t\t\t\tstr_to_date(o.start_date, '%Y-%m-%d')\n" +
        "\t\t\t\t\t\t\t)\n" +
        "\t\t\t\t\t\tELSE\n" +
        "\t\t\t\t\t\t\t(\n" +
        "\t\t\t\t\t\t\t\tdatediff(\n" +
        "\t\t\t\t\t\t\t\t\tstr_to_date(o.end_date, '%Y-%m-%d'),\n" +
        "\t\t\t\t\t\t\t\t\tstr_to_date(o.start_date, '%Y-%m-%d')\n" +
        "\t\t\t\t\t\t\t\t) + 1\n" +
        "\t\t\t\t\t\t\t)\n" +
        "\t\t\t\t\t\tEND\n" +
        "\t\t\t\t\t) * cs.max_cost\n" +
        "\t\t\t\tELSE\n" +
        "\t\t\t\t\tcs.max_cost\n" +
        "\t\t\t\tEND THEN\n" +
        "\t\t\t\t\tCASE\n" +
        "\t\t\t\tWHEN ct.cost_cyc = 1 THEN\n" +
        "\t\t\t\t\t(\n" +
        "\t\t\t\t\t\tCASE\n" +
        "\t\t\t\t\t\tWHEN ct.cost_type = 'ZS' THEN\n" +
        "\t\t\t\t\t\t\tdatediff(\n" +
        "\t\t\t\t\t\t\t\tstr_to_date(o.end_date, '%Y-%m-%d'),\n" +
        "\t\t\t\t\t\t\t\tstr_to_date(o.start_date, '%Y-%m-%d')\n" +
        "\t\t\t\t\t\t\t)\n" +
        "\t\t\t\t\t\tELSE\n" +
        "\t\t\t\t\t\t\t(\n" +
        "\t\t\t\t\t\t\t\tdatediff(\n" +
        "\t\t\t\t\t\t\t\t\tstr_to_date(o.end_date, '%Y-%m-%d'),\n" +
        "\t\t\t\t\t\t\t\t\tstr_to_date(o.start_date, '%Y-%m-%d')\n" +
        "\t\t\t\t\t\t\t\t) + 1\n" +
        "\t\t\t\t\t\t\t)\n" +
        "\t\t\t\t\t\tEND\n" +
        "\t\t\t\t\t) * cs.max_cost\n" +
        "\t\t\t\tELSE\n" +
        "\t\t\t\t\tcs.max_cost\n" +
        "\t\t\t\tEND\n" +
        "\t\t\t\tELSE\n" +
        "\t\t\t\t\tc.cost_amount\n" +
        "\t\t\t\tEND\n" +
        "\t\t\t)\n" +
        "\t\tFROM\n" +
        "\t\t\tcost_standard cs,\n" +
        "\t\t\tcost_type ct,\n" +
        "\t\t\torder_char c\n" +
        "\t\tWHERE\n" +
        "\t\t\tcs.cost_type = ct.cost_type\n" +
        "\t\tAND cs.cost_type = c.cost_type\n" +
        "\t\tAND c.order_no = o.order_no\n" +
        "\t\tAND cs.is_tz = (\n" +
        "\t\t\tSELECT\n" +
        "\t\t\t\torg.is_tz\n" +
        "\t\t\tFROM\n" +
        "\t\t\t\tcompany_org org\n" +
        "\t\t\tWHERE\n" +
        "\t\t\t\torg.company_code = o.end_company\n" +
        "\t\t)\n" +
        "\t\tAND cs.`level` = (\n" +
        "\t\t\tSELECT\n" +
        "\t\t\t\tu.`level`\n" +
        "\t\t\tFROM\n" +
        "\t\t\t\tusers u\n" +
        "\t\t\tWHERE\n" +
        "\t\t\t\tu.email = o.email\n" +
        "\t\t)\n" +
        "\t) AS totalBXF\n" +
        "FROM\n" +
        "\ttrip_order o\n" +
        "WHERE\n" +
        "\to.order_no = '" + orderNo + "'";
    DbUtils.queryData(querySql, function (result) {
        console.log('downLoadBxCost:' + querySql);
        excelUtils.renderExcel(result, function () {
            utils.exportFile(res, './bxFile/' + result[0].NAME + '报销' + orderNo + '.xlsx');
        }, function (err) {

        }, result[0].NAME + '报销' + orderNo + '.xlsx');
    }, function (error) {

    });
});
/**个人中心模块*/
router.get('/baixiu/searchUser', function (req, res) {
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    var user = user[0];
    var level = mysql.escape(user.level);
    var querySql = `
        SELECT
            l.level_desc as levelDesc
        FROM
            level_table l
        WHERE
            l. LEVEL = ${level}
    `;
    console.log('searchUser:'+querySql);
    DbUtils.queryData(querySql,function (result) {
        console.log(result)
        user.levelDesc = result[0].levelDesc;
        console.log(user)
        res.json(user)
    },function (error) {

    });

});

router.post('/baixiu/modifyUser', multipartMiddleware, function (req, res) {
    var tmp_path = '';
    if(req.files&&req.files.templateFile) {
        tmp_path = req.files.templateFile.path;
    }
    var email = req.body.email;
    var oldPwd = req.body.oldPwd;
    var modifyPwd = req.body.modifyPwd;
    var nickName = req.body.nickName;
    var level = req.body.level;
    var isModifyPwd = req.body.isModifyPwd;
    email = mysql.escape(email);
    if(isModifyPwd == 'true') {
        var queryUser = `
        SELECT
            u. PASSWORD
        FROM
            users u
        WHERE
            u.email = ${email}
        `;
        DbUtils.queryData(queryUser, function (data) {
            var queryPwd = data[0].PASSWORD;
            oldPwd = md5(md5(oldPwd) + 'p~1i');
            if (queryPwd != oldPwd) {
                res.json({
                    status: 1,
                    desc: '原始密码不正确'
                })
            } else {
                //修改用户信息
                var updateSql = `
                        UPDATE users u
                        SET 
                         u.email = ${email}`;
                if(tmp_path){
                    var tmp_path_insert = '/public/uploads/'+tmp_path.substring(tmp_path.lastIndexOf(path.sep)+1,tmp_path.length);
                    updateSql += `,u.avatar = '${tmp_path_insert}'`
                }
                if(level){
                    updateSql += `,u.LEVEL = ${level}`
                }
                if(nickName){
                    nickName = mysql.escape(nickName);
                    updateSql += `,u.nickname = ${nickName}`
                }
                if(modifyPwd){
                    modifyPwd = mysql.escape(md5(md5(modifyPwd) + 'p~1i'));
                    updateSql += `,u.password = ${modifyPwd}`
                }
                 updateSql += ` WHERE
                    u.email = ${email}
                `;
                console.log('modifyUser:'+updateSql);
                DbUtils.queryData(updateSql,function (result) {
                    if(tmp_path) {
                        fs.readFile(tmp_path, function (err, data) {
                            fs.writeFile('./'+tmp_path_insert, data, function (err) {
                                if (err) {
                                    res.json({
                                        status:-1,
                                        desc:err
                                    })
                                } else {
                                    var loginSql = 'select * from users u where u.`email` = ' + email + ' and u.`password` = ' + modifyPwd+ ' and u.`status`="activated"';
                                    DbUtils.queryData(loginSql, function (result) {
                                        if (result && result.length > 0) {
                                            //登录成功，保存session
                                            req.session.user = result;
                                            var userInfo = JSON.parse(req.session.userInfo);
                                            userInfo.user = result[0];
                                            req.session.userInfo = JSON.stringify(userInfo);
                                            console.log(req.session.userInfo);
                                            res.json({status:0,user:result[0]});
                                        }
                                    });
                                }
                            });
                        });
                    }else{
                        var loginSql = 'select * from users u where u.`email` = ' + email + ' and u.`password` = ' + modifyPwd+ ' and u.`status`="activated"';
                        DbUtils.queryData(loginSql, function (result) {
                            if (result && result.length > 0) {
                                //登录成功，保存session
                                req.session.user = result;
                                var userInfo = JSON.parse(req.session.userInfo);
                                userInfo.user = result[0];
                                req.session.userInfo = JSON.stringify(userInfo);
                                console.log(req.session.userInfo);
                                res.json({status:0,user:result[0]});
                            }
                        });
                    }
                },function (error) {
                    res.json({
                        status:-1,
                        desc:error
                    })
                });
            }
        }, function (error) {
            res.json({
                status:-1,
                desc:error
            })
        });
    }else{
        //修改用户信息
        var updateSql = `
                        UPDATE users u
                        SET 
                         u.email = ${email}`;
        if(tmp_path){
            var tmp_path_insert = '/public/uploads/'+tmp_path.substring(tmp_path.lastIndexOf(path.sep)+1,tmp_path.length);
            updateSql += `,u.avatar = '${tmp_path_insert}'`
        }
        if(level){
            updateSql += `,u.LEVEL = ${level}`
        }
        if(nickName){
            nickName = mysql.escape(nickName);
            updateSql += `,u.nickname = ${nickName}`
        }
        updateSql += ` WHERE
                    u.email = ${email}
                `;
        console.log('modifyUser:'+updateSql);
        DbUtils.queryData(updateSql,function (result) {
            if(tmp_path) {
                fs.readFile(tmp_path, function (err, data) {
                    fs.writeFile('./'+tmp_path_insert, data, function (err) {
                        if (err) {
                            res.json({
                                status:-1,
                                desc:err
                            })
                        } else {
                            var loginSql = 'select * from users u where u.`email` = ' + email + 'and u.`status`="activated"';
                            console.log(loginSql)
                            DbUtils.queryData(loginSql, function (result) {
                                if (result && result.length > 0) {
                                    //登录成功，保存session
                                    req.session.user = result;
                                    var userInfo = JSON.parse(req.session.userInfo);
                                    userInfo.user = result[0];
                                    req.session.userInfo = JSON.stringify(userInfo);
                                    console.log(req.session.userInfo);
                                    res.json({status:0,user:result[0]});
                                }
                            });
                        }
                    });
                });
            }else{
                var loginSql = 'select * from users u where u.`email` = ' + email + ' and u.`status`="activated"';
                DbUtils.queryData(loginSql, function (result) {
                    if (result && result.length > 0) {
                        //登录成功，保存session
                        req.session.user = result;
                        var userInfo = JSON.parse(req.session.userInfo);
                        userInfo.user = result[0];
                        req.session.userInfo = JSON.stringify(userInfo);
                        console.log(req.session.userInfo);
                        res.json({status:0,user:result[0]});
                    }
                });
            }
        },function (error) {
            res.json({
                status:-1,
                desc:error
            })
        });
    }
});
module.exports = router;
