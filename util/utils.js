var path = require('path');
var fs = require('fs');
var DbUtils = require('../DbUtils');
var mysql = require('mysql');
var utils = {
    addList(result, obj) {
        //判断当前节点是否有父节点
        if (obj['parent_id']) {
            //如果有父节点，先找到父节点
            for (var i = 0; i < result.length; i++) {
                if (obj['parent_id'] == result[i]['id']) {
                    //定位到父节点，先判断父节点中有没有sonList数组
                    if (result[i]['sonList']) {
                        //如果有sonList，先判断sonList中有没有该子节点
                        var index = 0;//定义一个索引记录子节点在父节点sonList中的索引
                        var isContain = false;//定义一个变量记录父节点是否已经包含该子节点，默认不包含
                        for (var j = 0; j < result[i]['sonList'].length; j++) {
                            if (result[i]['sonList'][j].id == obj.id) {
                                index == j;
                                isContain = true;
                                /* // 如果包含了该元素，再次判断,该元素是否发生过改变
                                 if (result[i]['sonList'][j].length != obj.length) {
                                     //发生过改变，重新替换父节点中对应的子节点
                                     result[i]['sonList'][j] = obj;
                                     //并且让父节点进一步通知其对应的父节点
                                     this.addList(result, result[i]);
                                 }*/
                                break;
                            }
                        }
                        //如果父节点的sonList中不包含该子节点，则直接添加
                        if (!isContain) {
                            result[i]['sonList'].push(obj);
                        }
                    } else {
                        //如果没有sonList，先在父节点添加此数组
                        result[i]['sonList'] = [];
                        //父节点添加当前节点作为子节点
                        result[i]['sonList'].push(obj);
                        // this.addList(result, result[i]);
                    }
                    break;
                }
            }
        }
    },
    isLogin(req, res) {
        var user = req.session.user;
        if (!user) {
            if (req.headers['x-requested-with'] != null && req.headers['x-requested-with'] == 'XMLHttpRequest') {
                res.json({
                    status: -304
                });
            } else {
                res.render('login.html', {});
            }
            return;
        }
        return user;
    },
    addMnues(parentNode, dataObj) {
        if (dataObj.sonList && dataObj.sonList.length > 0) {//包含子节点
            //如果该父节点中包含其他子节点，先添加父节点
            var dirObj = $('<li>' +
                '<a href="#' + dataObj.id + '" class="collapsed" data-toggle="collapse">' +
                '<i class="fa fa-thumb-tack"></i>' + dataObj.mnue_desc + '<i class="fa fa-angle-right"></i>' +
                '</a>' +
                '</li>');
            var filesUL = $('<ul id=' + dataObj.id + ' class="collapse"></ul>');
            //添加父节点到根目录中
            dirObj.append(filesUL);
            for (var i = 0; i < dataObj.sonList.length; i++) {
                //递归将当前目录传进，进一步添加目录
                addMnues(filesUL, dataObj.sonList[i]);
            }
            //添加该节点到根目录
            parentNode.append(dirObj);
        } else {//不包含子节点
            var html = '<li class="active">' +
                '<a href="' + dataObj['url'] + '"><i class="fa fa-dashboard"></i>' + dataObj['mnue_desc'] + '</a>' +
                '</li>';
            parentNode.append(html);
        }
    },
    addTableMnues(parentNode, dataObj, spanNoContent, index) {
        if (dataObj.sonList && dataObj.sonList.length > 0) {//包含子节点
            //如果该父节点中包含其他子节点，先添加父节点
            var dirObj = $('<tr id="mnuesManger' + dataObj.id + '" class="mnuesManger' + dataObj.parent_id + '">' +
                '<td class="first_td">' +
                '<span class="glyphicon glyphicon-menu-down" onclick="toggle(this,\'mnuesManger' + dataObj.id + '\')"></span>' +
                '<a href="#">' + dataObj.mnue_desc + '</a>' +
                '</td>' +
                '<td>' + dataObj.url + '</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td></td>' +
                '<td></td>' +
                '</tr>');
            parentNode.append(dirObj);
            for (var i = 0; i < index; i++) {
                $('#mnuesManger' + dataObj.id + ' .first_td').prepend($('<span class="no-content"></span>'));
            }
            for (var i = 0; i < dataObj.sonList.length; i++) {
                //递归将当前目录传进，进一步添加目录
                this.addTableMnues(parentNode, dataObj.sonList[i], $('<span class="no-content"></span>'), index + 1);
            }
        } else {//不包含子节点
            var html = '<tr id="mnuesManger' + dataObj.id + '" class="mnuesManger' + dataObj.parent_id + '">' +
                '<td class="first_td">' +
                '<span class="no-content"></span>' +
                '<a href="#">' + dataObj.mnue_desc + '</a>' +
                '</td>' +
                '<td>' + dataObj.url + '</td>' +
                '<td></td>' +
                '<td></td>' +
                '<td></td>' +
                '<td></td>' +
                '</tr>';
            parentNode.append(html);
            for (var i = 0; i < index; i++) {
                $('#mnuesManger' + dataObj.id + ' .first_td').prepend($('<span class="no-content"></span>'));
            }
        }
    },
    exportFile(res, fileName) {
        var file = path.join(__dirname, '../' + fileName);
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',//告诉浏览器这是一个二进制文件
            'Content-Disposition': 'attachment; filename=' + encodeURI(fileName),//告诉浏览器这是一个需要下载的文件
        });//设置响应头
        var readStream = fs.createReadStream(file);//得到文件输入流
        readStream.on('data', (chunk) => {
            res.write(chunk, 'binary');//文档内容以二进制的格式写到response的输出流
        });
        readStream.on('end', () => {
            res.end();
        });
    },
    deleDirectory(dirpath) {
        let files = [];
        if (fs.existsSync(dirpath)) {
            files = fs.readdirSync(dirpath);
            files.forEach((file) => {
                let curPath = path.join(dirpath, file);
                if (fs.statSync(curPath).isDirectory()) {
                    utils.deleDirectory(curPath); //递归删除文件夹
                } else {
                    fs.unlinkSync(curPath); //删除文件
                }
            });
            fs.rmdirSync(dirpath);
        }
    },
    renderPage(req, res, html) {
        // 2、查询对应的菜单数据
        var sql = `
                SELECT
                    mu.*
                FROM
                    sys_mnue_permissions_approval ma,
                    sys_users_mnue_permissions_group ug,
                    mnues mu
                WHERE
                    ug.email = ${mysql.escape(req.session.user[0].email)}
                AND ma.permissions_code = ug.permissions_code
                AND ma.mnue_id = mu.id
                AND mu.model_id = 1
                AND mu.del_flag = 0
              `;
        console.log('根据当前登录人查询菜单：' + sql);
        DbUtils.queryData(sql, function (result) {
            var mnueIdArr = [];
            var sql = `select * from mnues m where m.del_flag = 0 and m.model_id = 1`;
            DbUtils.queryData(sql, function (allResult) {
                for (var i = 0; i < result.length; i++) {
                    utils.findParentMnueId(allResult, mnueIdArr, result[i]);
                }
                var arrSql = [];
                for (var i = 0; i < mnueIdArr.length; i++) {
                    var conatinId = false;
                    for (var j = 0; j < arrSql.length; j++) {
                        if (mnueIdArr[i] == arrSql[j]) {
                            conatinId = true;
                            break;
                        }
                    }
                    if (!conatinId) {
                        arrSql.push(mnueIdArr[i]);
                    }
                }
                if (arrSql.length > 0) {
                    var queryMnueSql = `select * from mnues m where m.del_flag = 0 and m.model_id = 1 and m.id in (${arrSql.join(',')});`;
                    DbUtils.queryData(queryMnueSql, function (result) {
                        for (var i = 0; i < result.length; i++) {
                            utils.addList(result, result[i]);
                        }
                        // 将result中所有节点parent_id值不为空的给踢出掉
                        var array = [];
                        for (var i = 0; i < result.length; i++) {
                            if (!result[i]['parent_id']) {
                                array.push(result[i]);
                            }
                        }
                        var dataJson = {};
                        dataJson.user = req.session.user[0];
                        dataJson.dataJsonArr = array;
                        req.session.userInfo = JSON.stringify(dataJson);
                        var dataJsonBase = new Buffer(JSON.stringify(dataJson)).toString('base64');
                        if(req.session.index){
                            res.render(html, {dataJson: dataJsonBase, url: req.originalUrl});
                        }else {
                            res.render('index.html', {dataJson: dataJsonBase, url: req.originalUrl});
                        }
                    })
                } else {
                    var dataJson = {};
                    dataJson.user = req.session.user[0];
                    req.session.userInfo = JSON.stringify(dataJson);
                    var dataJsonBase = new Buffer(JSON.stringify(dataJson)).toString('base64');
                    if(req.session.index){
                        res.render(html, {dataJson: dataJsonBase, url: req.originalUrl});
                    }else {
                        res.render('index.html', {dataJson: dataJsonBase, url: req.originalUrl});
                    }
                }
            })
        });


    },
    //根据当前菜单对象，找到所有的父级菜单
    findParentMnueId(allMnueObj, mnueIdArr, currentMnueObj) {
        for (var i = 0; i < allMnueObj.length; i++) {
            var obj = allMnueObj[i];
            if (currentMnueObj.id == obj.id) {
                mnueIdArr.push(currentMnueObj.id);
                if (currentMnueObj.parent_id) {
                    // 根据parent_id找菜单parent对象
                    var parentMnueObj = null;
                    for (var j = 0; j < allMnueObj.length; j++) {
                        if (allMnueObj[j].id == currentMnueObj.parent_id) {
                            parentMnueObj = allMnueObj[j];
                            break;
                        }
                    }
                    if (parentMnueObj) {
                        utils.findParentMnueId(allMnueObj, mnueIdArr, parentMnueObj);
                    }
                }
            }
        }
    },
    asynCallBack(sqls, index) {
        var p = new Promise(function (resolve, reject) {        //做一些异步操作
            if (index < sqls.length) {
                resolve(sqls[index], index++);
            }
        });
        return p;
    },
    test(json = []) {
        // new Promise((resolve, reject) => {
        //     DbUtils.queryData('select * from users', (data) => {
        //         resolve(data)
        //     })
        //
        // }).then(data => {
        //     console.log(data);
        //
        //     return new Promise((resolve, reject) => {
        //         DbUtils.queryData('select * from mnues', (data) => {
        //             resolve(data)
        //         })
        //     })
        // }).then(data => {
        //     console.log(data);
        // })
        json.forEach((sql, callback) => {

        })
    }
};
module.exports = utils;