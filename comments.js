var express = require('express');
//后台管理统一路由接口
var router = require('./router');
var service = require('./service');
// var leTaoHomePage = require('./api/homePage.js');
// var leTaoGoodDetail = require('./api/goodDetail.js');
var leTaoLogin = require('./api/login.js');
var cisApproval = require('./api/cisApproval.js');
var utils = require('./util/utils');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.engine('html', require('express-art-template'));
app.set('views', './views');
app.disable('view cache');
/*app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});*/
app.use(cookieParser());
app.use(session({
        secret: '12345',
        cookie: {maxAge: 300000},
        resave: true,
        saveUninitialized: false
    }
));
app.use('/baixiu/', function (req, res, next) {
    if (req.originalUrl == '/baixiu/isExitUser' || req.originalUrl == '/baixiu/forgetPwd' || req.originalUrl == '/baixiu/forgetPwd'
        || req.originalUrl.indexOf('/baixiu/resetPwd') != -1 || req.originalUrl == '/baixiu/registered' || req.originalUrl == '/baixiu/registered'
        || req.originalUrl == '/baixiu/register' || req.originalUrl == '/baixiu/login' || req.originalUrl == '/baixiu/pwdUpdate'
        || req.originalUrl.indexOf('/baixiu/pwdReset') != -1
        || req.originalUrl.indexOf('/baixiu/activated') != -1
    ) {
        next();
        return;
    }
    var user = utils.isLogin(req, res);
    if (!user) {
        //session不存在，则需要直接返回登录界面
        return;
    }
    next();  //路由继续向下匹配
});
/**
 * ===============================乐淘接口引入接口=====================================
 */
var leTaoHomePage = require('./api/homePage.js');
var leTaoGoodDetail = require('./api/goodDetail.js');
app.use(router);
app.use(leTaoHomePage);
app.use(leTaoGoodDetail);
app.use(leTaoLogin);
app.use(cisApproval);
/**
 * ===============================乐淘接口引入接口=====================================
 */
app.use('/public/', express.static('./public/'));
app.use('/node_modules/', express.static('./node_modules/'));
app.use('/uploads/', express.static('./uploads/'));
app.listen(3000, function () {
    console.log('Running...');

    service.startDeleteFileJob('./bxFile')
});
