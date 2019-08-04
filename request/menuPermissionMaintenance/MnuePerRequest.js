var utils = require('../../util/utils.js');
var MnuePerRequest = {
    //跳转权限管理页面
    toMnuePermissionPage(req,res){
        utils.renderPage(req,res,'menuPermissionMaintenance.html');
    }
};
module.exports = MnuePerRequest;