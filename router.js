var express = require('express');
var router = express.Router();
var DbUtils = require('./DbUtils');
var fs = require('fs');
var path = require('path');
//访问管理后台首页
router.get('/', function (req, res) {
    /**
     *  1、查询登录账号的权限
     */
    // 2、查询对应的菜单数据
    var sql = 'select * from mnues m where m.model_id = 1';
    DbUtils.queryData(sql,function (result) {
        for(var i = 0;i<result.length;i++){
            addList(result,result[i]);
        }
        // 将result中所有节点parent_id值不为空的给提出掉
        var array = [];
        for(var i = 0;i<result.length;i++){
            if(!result[i]['parent_id']){
                array.push(result[i]);
            }
        }
        var dataJsonArr = JSON.stringify(array);
        res.render('index.html',{dataJsonArr:dataJsonArr});
    });

    function addList(result,obj) {
        //判断当前节点是否有父节点
        if(obj['parent_id']){
            //如果有父节点，先找到父节点
            for(var i = 0;i<result.length;i++){
                if(obj['parent_id'] == result[i]['id']){
                    //定位到父节点，先判断父节点中有没有sonList数组
                    if(result[i]['sonList']){
                        //如果有sonList，先判断sonList中有没有该子节点
                        var index = 0;//定义一个索引记录子节点在父节点sonList中的索引
                        var isContain = false;//定义一个变量记录父节点是否已经包含该子节点，默认不包含
                        for(var j = 0;j<result[i]['sonList'].length;j++){
                            if(result[i]['sonList'][j].id == obj.id){
                                index == j;
                                isContain = true;
                                // 如果包含了该元素，再次判断,该元素是否发生过改变
                                if(result[i]['sonList'][j].length != obj.length){
                                    //发生过改变，重新替换父节点中对应的子节点
                                    result[i]['sonList'][j] = obj;
                                    //并且让父节点进一步通知其对应的父节点
                                    addList(result,result[i]);
                                }
                                break;
                            }
                        }
                        //如果父节点的sonList中不包含该子节点，则直接添加
                        if(!isContain){
                            result[i]['sonList'].push(obj);
                        }
                    }else{
                        //如果没有sonList，先在父节点添加此数组
                        result[i]['sonList'] = [];
                        //父节点添加当前节点作为子节点
                        result[i]['sonList'].push(obj);
                        addList(result,result[i]);
                    }
                    break;
                }
            }
        }
    }
});

module.exports = router;