var utils = require('../../util/utils.js');
var DbUtils = require('../../DbUtils');
var PermissionDistributionSql = require('../../db/menuPermissionMaintenance/PermissionDistributionSql.js');
var PermissionDistribution = {
    renderPermissionDistributionPage(req, res) {
        utils.renderPage(req,res,'permissionDistribution.html');
    },
    getUserListData(req,res){
        console.log(req.query.email+'==='+req.query.nickName)
        var returnObj = {};
        returnObj.returnData = {
            offset: req.query.offset,
            pageSize: req.query.pageSize,
            email: req.query.email,
            nickName: req.query.nickName
        };
        var queryCountSql = PermissionDistributionSql.getUserCount(req.query.email,req.query.nickName);
        console.log('getUserListData查询人员总数：'+queryCountSql);
        DbUtils.queryData(queryCountSql,function (result) {
            returnObj.totalCount = result[0].count;
            if (result && parseInt(result[0].count) > 0) {
                var querySql = PermissionDistributionSql.getUserListData(req.query.offset,req.query.pageSize,req.query.email,req.query.nickName);
                console.log('getUserListData查询人员：'+querySql);
                DbUtils.queryData(querySql,function (resultList) {
                    if (resultList && resultList.length > 0) {
                        returnObj.getlist_status = 0;
                        returnObj.getlist_desc = '获取数据成功';
                        returnObj.usersJsonArray = resultList;
                    } else {
                        returnObj.getlist_status = 1;
                        returnObj.getlist_desc = '未获取到数据';
                    }
                    res.json(returnObj);
                })
            }else{
                returnObj.getlist_status = 1;
                returnObj.getlist_desc = '未获取到数据';
                res.json(returnObj);
            }
        },function (error) {
            returnObj.getlist_status = -1;
            returnObj.getlist_desc = error;
            res.json(returnObj);
        });
    }
};
module.exports = PermissionDistribution;