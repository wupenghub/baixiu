var utils = require('../../util/utils.js');
var DbUtils = require('../../DbUtils');
var PermissionDistributionSql = require('../../db/menuPermissionMaintenance/PermissionDistributionSql.js');
var DataPerRequest = {
    dataPermissionMaintance(req,res){
        utils.renderPage(req,res,'dataPermissionMaintenance.html');
    }
};
module.exports = DataPerRequest;