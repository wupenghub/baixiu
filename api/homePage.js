var express = require('express');
var router = express.Router();
var DbUtils = require('../DbUtils');
var md5 = require('md5-node');
router.get('/letao/homePage', function (req, res) {
    var querySql = 'SELECT\n' +
        '\t*\n' +
        'FROM\n' +
        '\tletao_product l\n' +
        'WHERE\n' +
        '\tl.product_flag = 1\n' +
        'OR l.product_flag = 2';
    var returnData = {};
    DbUtils.queryData(querySql,function (result) {
        returnData.status = 0;
        //轮播数据结构
        returnData.banner = {};
        returnData.banner.desc = '首页轮播';
        returnData.banner.banner_list = [];
        //首页列表数据结构
        returnData.productList = {};
        returnData.productList.desc = '首页列表';
        returnData.productList.product_list = [];
        for(var i = 0;i<result.length;i++){
            if(result[i].product_flag == 1){
                var bannerItem = {
                    id:result[i].id,
                    productName:result[i].product_name,
                    categoryId:result[i].category_id,
                    productPrice:result[i].product_price,
                    productPreferentialPrice:result[i].product_preferential_price,
                    productSize:result[i].product_size,
                    productDesc:result[i].product_desc,
                    productSource:result[i].product_source,
                    productImageUrl:result[i].image_url
                };
                returnData.banner.banner_list.push(bannerItem);
            }else if(result[i].product_flag == 2){
                var productItem = {
                    id:result[i].id,
                    productName:result[i].product_name,
                    categoryId:result[i].category_id,
                    productPrice:result[i].product_price,
                    productPreferentialPrice:result[i].product_preferential_price,
                    productSize:result[i].product_size,
                    productDesc:result[i].product_desc,
                    productSource:result[i].product_source,
                    productImageUrl:result[i].image_url};
                returnData.productList.product_list.push(productItem);
            }
        }
        res.status(200).json(returnData);
    },function (err) {
        returnData.status = 1;
        returnData.desc = '网络请求失败';
        res.json(returnData);
    });
});
module.exports = router;