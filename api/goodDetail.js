var express = require('express');
var router = express.Router();
var DbUtils = require('../DbUtils');
var md5 = require('md5-node');
router.post('/leTao/goodDetail',function (req,res) {
    /*var querySql = 'SELECT\n' +
        '\t*\n' +
        'FROM\n' +
        '\tletao_product p\n' +
        'WHERE\n' +
        '\tp.id = '+req.body.id+'\n' +
        'AND p.del_flag = 0';*/
    var querySql = 'SELECT\n' +
        '\t*, CONCAT(\n' +
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
        '\t) AS product_size_area\n' +
        'FROM\n' +
        '\tletao_product p\n' +
        'WHERE\n' +
        '\tp.del_flag = 0\n' +
        'AND p.id = '+req.body.id;
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