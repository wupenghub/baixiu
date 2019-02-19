var express = require('express');
var router = express.Router();
var DbUtils = require('../DbUtils');
var md5 = require('md5-node');
var apiUtils = require('./apiUtils.js');
router.post('/leTao/goodDetail', function (req, res) {
    var querySql = 'SELECT\n' +
        '\tp.*, CONCAT(\n' +
        '\t\t(\n' +
        '\t\t\tSELECT\n' +
        '\t\t\t\tmin(p1.product_size)\n' +
        '\t\t\tFROM\n' +
        '\t\t\t\tletao_product p1\n' +
        '\t\t\tWHERE\n' +
        '\t\t\t\tp1.del_flag = 0\n' +
        '\t\t),\n' +
        '\t\t\'-\',\n' +
        '\t\t(\n' +
        '\t\t\tSELECT\n' +
        '\t\t\t\tmax(p1.product_size)\n' +
        '\t\t\tFROM\n' +
        '\t\t\t\tletao_product p1\n' +
        '\t\t\tWHERE\n' +
        '\t\t\t\tp1.del_flag = 0\n' +
        '\t\t)\n' +
        '\t) AS product_size_area,\n' +
        '\t(\n' +
        '\t\tSELECT\n' +
        '\t\t\tcount(1)\n' +
        '\t\tFROM\n' +
        '\t\t\tletao_product l1\n' +
        '\t\tWHERE\n' +
        '\t\t\tl1.del_flag = 0\n' +
        '\t\tAND l1.product_item_code = p.product_item_code\n' +
        '\t) AS totalNum\n' +
        'FROM\n' +
        '\tletao_product p\n' +
        'WHERE\n' +
        '\tp.del_flag = 0\n' +
        'AND p.id =' + req.body.id;
    var returnData = {};
    DbUtils.queryData(querySql, function (result) {
        returnData.status = 0;
        returnData.desc = '获取商品详情信息成功';
        returnData.result = result[0];
        res.json(returnData);
    }, function (error) {
        returnData.status = 1;
        returnData.desc = '获取商品详情信息失败';
        returnData.error = error;
        res.json(returnData);
    });
});
router.get('/leTao/getGoodDetail',function (req,res) {
    var querySql = 'SELECT\n' +
        '\tl.*, (\n' +
        '\t\tSELECT\n' +
        '\t\t\tcount(1)\n' +
        '\t\tFROM\n' +
        '\t\t\tletao_product l1\n' +
        '\t\tWHERE\n' +
        '\t\t\tl1.product_item_code = l.product_item_code\n' +
        '\t\tAND l1.product_size = l.product_size\n' +
        '\t\tAND l1.del_flag = l.del_flag\n' +
        '\t) AS totalNum\n' +
        'FROM\n' +
        '\tletao_product l\n' +
        'WHERE\n' +
        '\tl.product_item_code = '+req.query.productItemCode+'\n' +
        'AND l.product_size = '+req.query.size+'\n' +
        'AND l.del_flag = 0';
    var returnData = {};
    DbUtils.queryData(querySql, function (result) {
        returnData.status = 0;
        returnData.desc = '获取商品详情信息成功';
        returnData.resultArray = result;
        res.json(returnData);
    }, function (error) {
        returnData.status = 1;
        returnData.desc = '获取商品详情信息失败';
        returnData.error = error;
        res.json(returnData);
    });
});
router.post('/leTao/addCart',function (req,res) {
    var userName = req.body.userName;
    var resultData = {};
    if(!userName){
        resultData.status = 1;
        resultData.desc = '用户未登录';
        res.status(200).json(resultData);
        return;
    }
    var sessionUser =  req.session[userName];
    console.log("userName:"+userName+"   sessionUser:"+req.session['wupengforIT@163.com']);
    if(!sessionUser){
        resultData.status = 1;
        resultData.desc = '用户未登录';
        res.status(200).json(resultData);
        return;
    }
    resultData.status = 0;
    resultData.desc = '用户已经登录';
    resultData.sessionUser = sessionUser;
    res.status(200).json(resultData);
});

module.exports = router;