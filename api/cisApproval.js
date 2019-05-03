var express = require('express');
var router = express.Router();
var DbUtils = require('../DbUtils');
var md5 = require('md5-node');
var apiUtils = require('./apiUtils.js');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fs = require('fs');
let excelUtils = require('../util/ExcelUtils.js');
//下载模板
router.post('/baixiu/cisTemplateDownLoad', function (req, res) {
    var file = './' + req.body.filename;
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',//告诉浏览器这是一个二进制文件
        'Content-Disposition': 'attachment; filename=' + encodeURI(req.body.filename),//告诉浏览器这是一个需要下载的文件
    });//设置响应头
    var readStream = fs.createReadStream(file);//得到文件输入流
    readStream.on('data', (chunk) => {
        res.write(chunk, 'binary');//文档内容以二进制的格式写到response的输出流
    });
    readStream.on('end', () => {
        res.end();
    });

});
router.post('/baixiu/getExcel', multipartMiddleware, function (req, res) {
    var tmp_path = req.files.templateFile.path;
    var cisDivCode = req.body.cisdiv;
    var cisDivDesc = req.body.desc;
    var userArray = [];//定义一个人员数组，将人员放置在此集合中
    //['用户组权限','调度组','待办事项角色']
    var sheetNames = ['用户组权限','调度组','待办事项角色'];
    excelUtils.readExcel(tmp_path, sheetNames, function (data) {
        for (var item in data) {
            if (item == '用户组权限') {
                addUserGroupPermissions(userArray, data[item], cisDivDesc);
            }
            if (item == '调度组') {
                addUserDispAndRoll(userArray, data[item], cisDivDesc, true);
            }
            if (item == '待办事项角色') {
                addUserDispAndRoll(userArray, data[item], cisDivDesc, false);
            }
        }
    });
    test(userArray);
    res.json({status: 1});

});

function test(userArray) {
    for (var i = 0; i < userArray.length; i++) {
        var user = userArray[i];
        var userRolls = user.userRolls||[];
        var userGroup = user.userGroupPermissArr||[];
        var userDisp = user.dispGroup||[];
        console.log(user.userName + ':用户权限' + userGroup.length + "个，调度组：" + userDisp.length + "个，待办事项角色：" + userRolls.length + "个");
    }
}

/**=================================用户组权限开始================================*/

function addUserGroupPermissions(userArray, userGroupPermissionsArray, cisDivDesc) {
    for (var i = 0; i < userGroupPermissionsArray.length; i++) {
        var userGroupObj = userGroupPermissionsArray[i];
        var addName = userGroupObj['姓名'];
        var contains = false;
        var user = null;
        for (var j = 0; j < userArray.length; j++) {
            if (removeBlank(addName) == removeBlank(userArray[j].userName)) {
                user = userArray[j];
                contains = true;
                break;
            }
        }
        if (contains) {
            //如果已经存在人员，判断此人员是否已经有用户组权限集合
            if (user && user.userGroupPermissArr && user.userGroupPermissArr.length > 0) {
                //已经有用户组权限，再次判断此集合是否已经包含遍历的用户组
                addPermiss(user, userGroupObj, cisDivDesc);
            }
        } else {
            user = {};
            user.userGroupPermissArr = [];
            user.userName = removeBlank(addName);
            addPermiss(user, userGroupPermissionsArray[i], cisDivDesc);
            userArray.push(user);
        }
    }

}

function addPermiss(user, userGroupPermissionsObj, cisDivDesc) {
    for (var item in userGroupPermissionsObj) {
        if (item.indexOf('用户组') != -1) {
            var compareGroup = userGroupPermissionsObj[item];
            addPermissInObj(user, compareGroup, cisDivDesc);
        }
    }
}

function addPermissInObj(user, compareGroup, cisDivDesc) {
    var userGroupArr = user.userGroupPermissArr;
    var contain = false;
    for (var i = 0; i < userGroupArr.length; i++) {
        if ((cisDivDesc + removeBlank(userGroupArr[i]).replace(cisDivDesc, '')) == (cisDivDesc + removeBlank(compareGroup).replace(cisDivDesc, ''))) {
            contain = true;
            break;
        }
    }
    if (!contain) {
        userGroupArr.push(cisDivDesc + removeBlank(compareGroup).replace(cisDivDesc, ''));
    }

}

/**=================================用户组权限结束================================*/
/**=================================调度组和待办事项角色开始=================================*/
function addUserDispAndRoll(userArray, userDispArray, cisDivDesc, isDispGroup) {
    for (var i = 0; i < userDispArray.length; i++) {
        var dispUser = userDispArray[i];
        for (var item in dispUser) {
            var addUserName = removeBlank(dispUser[item]);
            var contain = false;
            var user = null;
            for (var j = 0; j < userArray.length; j++) {
                var userName = removeBlank(userArray[j].userName);
                if (addUserName == userName) {
                    contain = true;
                    user = userArray[j];
                    break;
                }
            }
            if (contain) {
                // var userPart = isDispGroup ? user.dispGroup : user.userRolls;
                // if (user && userPart && userPart.length > 0) {
                //     addUserObj(user, item, cisDivDesc, isDispGroup);
                // }
                if (user) {
                    if (isDispGroup) {
                        if (!user.dispGroup) {
                            user.dispGroup = [];
                        }
                    } else {
                        if (!user.userRolls) {
                            user.userRolls = [];
                        }
                    }
                    addUserObj(user, item, cisDivDesc, isDispGroup);
                }
            } else {
                var newUser = {};
                newUser.userName = addUserName;
                if (isDispGroup) {
                    newUser.dispGroup = [];
                } else {
                    newUser.userRolls = [];
                }

                addUserObj(newUser, item, cisDivDesc, isDispGroup);
                userArray.push(newUser);
            }
        }
    }
}

function addUserObj(user, dispDesc, cisDivDesc, isDispGroup) {
    var userDispArray = isDispGroup ? user.dispGroup : user.userRolls;
    var contain = false;
    for (var i = 0; i < userDispArray.length; i++) {
        if ((cisDivDesc + removeBlank(userDispArray[i]).replace(cisDivDesc, '')) == (cisDivDesc + removeBlank(dispDesc).replace(cisDivDesc, ''))) {
            contain = true;
            break;
        }
    }
    if (!contain) {
        userDispArray.push(cisDivDesc + removeBlank(dispDesc).replace(cisDivDesc, ''));
    }
}

/**=================================调度组和待办事项角色结束=================================*/

function removeBlank(value) {
    return value.replace(/\s/g, "");
}

module.exports = router;