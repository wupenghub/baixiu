var utils = require('../../util/utils.js');
var MnuePerSql = require('../../db/menuPermissionMaintenance/MnuePerSql.js');
var DbUtils = require('../../DbUtils');
var MnuePerRequest = {
    //跳转权限管理页面
    toMnuePermissionPage(req,res){
        utils.renderPage(req,res,'menuPermissionMaintenance.html');
    },
    //查询菜单权限列表
    searchMnuePremissionList(req,res){
        var returnObj = {};
        returnObj.returnData = {
            offset: req.query.offset,
            pageSize: req.query.pageSize,
        };
        var queryCount = MnuePerSql.searchMnuePremissionListCountSql();
        console.log('searchMnuePremissionList查询菜单权限个数：'+queryCount);
        DbUtils.queryData(queryCount,function (result) {
            if (result && result[0].count != '0') {
                returnObj.totalCount = result[0].count;
                var sql = MnuePerSql.searchMnuePremissionListSql(req.query.offset,req.query.pageSize);
                console.log('searchMnuePremissionList查询菜单权限列表：'+sql);
                DbUtils.queryData(sql,function (result) {
                    returnObj.returnData.returnData = result;
                    res.json(returnObj);
                },function (error) {
                    res.json({
                        status:-1,
                        desc:error
                    })
                });
            }else {
                returnObj.getlist_status = 1;
                returnObj.getlist_desc = '未获取到数据';
                res.json(returnObj);
            }
        },function (error) {
            returnObj.status = -1;
            returnObj.desc = error;
            res.json(returnObj);
        });
    }
};
module.exports = MnuePerRequest;