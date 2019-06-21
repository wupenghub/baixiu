var express = require('express');
var router = express.Router();
var DbUtils = require('./DbUtils');
var utils = require('./util/utils');
var mail = require('./util/mail');
var md5 = require('md5-node');
var uuid = require('node-uuid')
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
        res.render('index.html', {dataJson: JSON.stringify(dataJson)});
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
    var loginSql = 'select * from users u where u.`email` = "' + emil + '" and u.`password` = "' + password + '" and u.`status`="activated"';
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
                    var html = '<p>尊敬的' + userName + '您好，欢迎使用激活账号,请点击<a href="http://localhost:3000/baixiu/activated?userName=' + userName + '">激活账号</a>链接进行账号激活</p>';
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
    var html = '<p>尊敬的' + req.query.email + '您好，欢迎使用激活账号,请点击<a href="http://localhost:3000/baixiu/activated?userName=' + userName + '">激活账号</a>链接进行账号激活</p>';
    mail.sendMain(userName, '账号激活', html, function (data) {
        returnData.mailSend_status = data.status;
        returnData.mailSend_status = data.desc;
        res.json(returnData);
    });
});
//激活账户接口
router.get('/baixiu/activated',function (req,res) {
    var userName = req.query.userName;
    var querySql = 'select * from users u where u.email ="' + userName + '"';
    var returnData = {};
    DbUtils.queryData(querySql, function (result) {
        if (result && result.length > 0) {
            returnData.query_status = 0;
            returnData.query_desc = '查询存有此用户，可以进行账号激活';
            var updateSql = 'update users u set u.status = "activated" where u.email = "'+userName+'"';
            DbUtils.queryData(updateSql,function (result) {
                returnData.activation_status = 0;
                returnData.activation_desc = '激活成功';
                res.json(returnData);
            },function (err) {
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
    var html = '<p>尊敬的' + req.query.email + '您好，欢迎使用密码找回功能,请点击<a href="http://192.168.1.8:3000/baixiu/pwdReset?userName=' + req.query.email + '">密码重置</a>链接进行密码重置</p>';
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
router.get('/baixiu/cisApproval',function (req,res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('cisApproval.html', {dataJsonArr: req.session.userInfo});
    // res.render('cisApproval.html');
});
//CIS系统材料单配置
router.get('/baixiu/cisSqlConfig',function (req,res) {
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
    res.render('businessTrip.html',{dataJsonArr: req.session.userInfo});
});
//查询订单记录
router.get('/baixiu/searchOrder',function (req,res) {
    var email = req.query.email;
    var date = req.query.date;
    var querySql = "select count(1) as totalCount from trip_order o where o.start_date = str_to_date('"+date+"','%Y-%m-%d') and o.email='"+email+"'";
    console.log(querySql);
    DbUtils.queryData(querySql,function (result) {
        if(result[0].totalCount>0){
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
                "\to.start_date = str_to_date('"+date+"', '%Y-%m-%d')\n" +
                "AND o.email = '"+email+"'\n" +
                "AND o.order_flag = 1\n";
            console.log(querySql);
            DbUtils.queryData(querySql,function (result) {
                res.json({
                    status:0,
                    tripList:result,
                    totalCount:result[0].totalCount
                })
            },function (err) {
                res.json({
                    status:1,
                    desc:'当天没有出差记录'
                })
            });
        }else{
            res.json({
                status:1,
                desc:'当天没有出差记录'
            });
        }
    },function (err) {

    });
});
//查询每个月中所有日期的订单数
router.get('/baixiu/searchMonthTripCount',function (req,res) {
    var email = req.query.email;
    var date = req.query.date;
    var startYear = date.split('-')[0];
    var month = parseInt(date.split('-')[1]);
    var date = new Date(startYear,month);
    var startMonth = date.getMonth() < 10?'0'+date.getMonth():date.getMonth();
    date.setMonth(date.getMonth()+1,1);
    var nextYear = date.getFullYear();
    var nextMonth = date.getMonth() <10 ? '0'+date.getMonth():date.getMonth();
    var startDate = startYear+'-'+startMonth+'-01';
    var nextDate = nextYear+'-'+nextMonth+'-01';
    var querySql = "SELECT\n" +
        "\t\t\tSUBSTR(o.start_date, 1, 4) AS year,\n" +
        "\t\t\tSUBSTR(o.start_date, 6, 2) AS month,\n" +
        "\t\t\tSUBSTR(o.start_date, 9, 10) AS day,\n" +
        "\t\t\tcount(1) AS totalCount\n" +
        "\t\tFROM\n" +
        "\t\t\ttrip_order o\n" +
        "\t\tWHERE\n" +
        "\t\t\to.start_date >= str_to_date('"+startDate+"', '%Y-%m-%d')\n" +
        "\t\tAND o.start_date < str_to_date('"+nextDate+"', '%Y-%m-%d')\n" +
        "group by year,month,day";
    console.log('searchMonthTripCount:'+querySql);
    DbUtils.queryData(querySql,function (result) {
        res.json({
            status:0,
            resultDate:result
        });
    },function (err) {
        res.json({
            status:-1,
            resultDate:err
        });
    });
});
//新增出差订单
router.post('/baixiu/addRecord',function (req,res) {
    var email = req.body.email;
    var startDate = req.body.startDate;
    var endDate = req.body.endDate;
    var startCompany = req.body.startCompany;
    var endCompany = req.body.endCompany;
    var isAdd = req.body.isAdd;
    var querySql = '';
    if(isAdd == 'Y') {
        var orderNo = uuid.v1();
        querySql = "INSERT INTO trip_order\n" +
            "VALUES\n" +
            "\t(\n" +
            "\t\t'" + orderNo + "',\n" +
            "\t\t'" + email + "',\n" +
            "\t\t'" + startDate + "',\n" +
            "\t\t'" + endDate + "',\n" +
            "\t\t1,\n" +
            "\t\t'" + startCompany + "',\n" +
            "\t\t'" + endCompany + "'\n" +
            "\t)";
    }else{
            querySql = "UPDATE trip_order o\n" +
            "SET o.email = '"+email+"',\n" +
            " o.start_date = str_to_date('"+startDate+"', '%Y-%m-%d'),\n" +
            " o.end_date = str_to_date('"+endDate+"', '%Y-%m-%d'),\n" +
            " o.start_company = '"+startCompany+"',\n" +
            " o.end_company = '"+endCompany+"'\n" +
            "WHERE\n" +
            "\to.order_no = '"+req.body.orderNo+"'\n" +
            "AND o.email = '565784355@qq.com'";
    }
    console.log("addRecord:"+querySql);
    DbUtils.queryData(querySql,function (result) {
        console.log(result);
        if(result.affectedRows>0){
            res.json({
                status:0,
                desc:'记录添加成功'
            })
        }else{
            res.json({
                status:1,
                desc:'记录没有添加'
            })
        }
    },function (err) {
        res.json({
            status:-1,
            desc:err
        })
    });

});
//根据订单号查询订单
router.get('/baixiu/searchOrderByNo',function (req,res) {
    var email = req.query.email;
    var orderNo = req.query.orderNo;
    var querySql = "SELECT\n" +
        "\t*\n" +
        "FROM\n" +
        "\ttrip_order o\n" +
        "WHERE\n" +
        "\to.order_no = '"+orderNo+"'\n" +
        "AND o.email = '"+email+"'";
    console.log('searchOrderByNo:'+querySql);
    DbUtils.queryData(querySql,function (result) {
        console.log(result);
        res.json({
            status:0,
            result
        });
    },function (error) {

    });

});
// 出差公司管理
router.get('/baixiu/companyManger',function (req,res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        return;
    }
    res.render('companyManger.html', {dataJsonArr: req.session.userInfo});
});
//查询公司列表
router.get('/baixiu/queryCompanyList',function (req,res) {
    var querySql = "SELECT\n" +
        "\torg.company_code AS id,\n" +
        "\torg.company_code AS url,\n" +
        "\torg.parent_code AS parent_id,\n" +
        "\torg.address_code AS addressCode,\n" +
        "\torg.is_tz AS isTz,\n" +
        "\torg.company_desc AS mnue_desc\n" +
        "FROM\n" +
        "\tcompany_org org";
    console.log('queryCompanyList:'+querySql);
    DbUtils.queryData(querySql,function (result) {
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
            status:0,
            returnDate:array
        });
    },function (error) {
        res.json({
            status:-1,
            returnDate:error
        });
    });

});
//添加子公司
router.post('/baixiu/sonCompanyAdd',function (req,res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    //先判断此id在数据库中是否存在
    var querySql = 'select count(1) count from company_org m where m.company_code = "' + req.body.id+'"';
    DbUtils.queryData(querySql, function (result) {
        var data = {};
        if (result && result[0].count > 0) {
            var inserSql = 'UPDATE company_org m set m.company_desc = "' + req.body.mnueDesc + '",m.parent_code = "' + req.body.parentId + '",m.address_code="sz",m.is_tz=0 where m.company_code ="' + req.body.id+'"';
            console.log(inserSql);
            DbUtils.queryData(inserSql, function (result) {
                data.status = 0;
                data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                var sql = 'select m.company_code as id,m.company_code as url,m.address_code as addressCode,m.parent_code as parent_id,m.is_tz as isTz,m.company_desc as mnue_desc from company_org m';
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
                var inserSql = 'insert into company_org value("'+req.body.id+'","sz","' + req.body.parentId + '",' + 0 + ',"' + req.body.mnueDesc + '")';
                DbUtils.queryData(inserSql, function (result) {
                    data.status = 0;
                    data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                    var sql = 'select m.company_code as id,m.company_code as url,m.address_code as addressCode,m.parent_code as parent_id,m.is_tz as isTz,m.company_desc as mnue_desc from company_org m';
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
                var inserSql = 'UPDATE company_org m set m.company_code="'+req.body.id+'",m.company_desc = "' + req.body.mnueDesc + '",m.parent_code = "' + req.body.parentId + '",m.address_code="sz",m.is_tz=0 where m.company_code ="' + req.body.oldId+'"';
                console.log('code不一致sonCompanyAdd:'+inserSql);
                DbUtils.queryData(inserSql, function (result) {
                    data.status = 0;
                    data.desc = req.body.isUpdate == 'N' ? '添加成功' : '修改成功';
                    var sql = 'select m.company_code as id,m.company_code as url,m.address_code as addressCode,m.parent_code as parent_id,m.is_tz as isTz,m.company_desc as mnue_desc from company_org m';
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
router.get('/baixiu/companyDelete',function (req,res) {
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
        var updateSql = 'delete from company_org where company_code = "'+req.query.id+'"';
        console.log('删除companyDelete：'+updateSql);
        DbUtils.queryData(updateSql, function (updateResult) {
            var sql = 'select m.company_code as id,m.company_code as url,m.address_code as addressCode,m.parent_code as parent_id,m.is_tz as isTz,m.company_desc as mnue_desc from company_org m';
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
router.get('/baixiu/addressManger',function (req,res) {
    //1、判断此用户是否已经登录过
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    res.render('addressManger.html', {dataJsonArr: req.session.userInfo});
});
module.exports = router;
