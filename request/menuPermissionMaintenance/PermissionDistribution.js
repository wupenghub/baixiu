var utils = require('../../util/utils.js');
var DbUtils = require('../../DbUtils');
var PermissionDistributionSql = require('../../db/menuPermissionMaintenance/PermissionDistributionSql.js');
var PermissionDistribution = {
    renderPermissionDistributionPage(req, res) {
        utils.renderPage(req,res,'permissionDistribution.html');
    },
    getUserListData(req,res){
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
    },
    searchUserPerList(req,res){
        var userExist = PermissionDistributionSql.userExistSql(req.query.email);
        //查询权限清单
        DbUtils.queryData(userExist,function (result) {
            if(parseInt(result[0].count) == 0){
                res.json({
                    status:1,
                    desc:'未查询到此用户'
                });
            }else{
                var returnData = {};
                var queryUserInfo = PermissionDistributionSql.queryUserInfo(req.query.email);
                returnData.status = 3;
                returnData.desc = '未知错误';
                console.log('searchUserPerList查询人员菜单权限：'+queryUserInfo);
                DbUtils.queryData(queryUserInfo,function (result) {
                    returnData.mnueJsonArray = result;
                    var queryCompanySql = PermissionDistributionSql.userCompanySql(req.query.email);
                     DbUtils.queryData(queryCompanySql,function (result) {
                         returnData.companyJsonArray = result;
                         returnData.status = 0;
                         res.json(returnData);
                     },function (error) {
                         returnData.status = -1;
                         returnData.desc = error;
                         res.json(returnData);
                     });

                },function (error) {
                    returnData.status = -1;
                    returnData.desc = error;
                    res.json(returnData);
                });
            }
        },function (error) {
            returnData.status = -1;
            returnData.desc = error;
            res.json(returnData);
        })
    }
};
module.exports = PermissionDistribution;