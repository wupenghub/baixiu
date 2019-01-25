var express = require('express');
var router = express.Router();
var DbUtils = require('../DbUtils');
var md5 = require('md5-node');
router.post('/leTao/goodDetail',function (req,res) {
    var querySql = 'SELECT\n' +
        '\t*\n' +
        'FROM\n' +
        '\tletao_product p\n' +
        'WHERE\n' +
        '\tp.id = '+req.body.id+'\n' +
        'AND p.del_flag = 0';
    var returnData = {};
    DbUtils.queryData(querySql,function (result) {
        returnData.status = 0;
        returnData.desc='获取商品详情信息成功';
        returnData.result = result[0];
        res.json(returnData);
    },function (error) {
        returnData.status = 1;
        returnData.desc = '获取商品详情信息失败';
        returnData.error = error;
        res.json(returnData);
    });
});
module.exports = router;