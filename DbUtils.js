var mysql = require('mysql');
var oracledb = require('oracledb');
var async = require("async");
/*const db_config = {
    connectionLimit: 5,
    host: "47.96.76.172",
    user: "root",
    password: "4217aBc!",
    port: "3306",
    database: "baixiu"
};*/
const db_config = {
    connectionLimit: 5,
    host: "127.0.0.1",
    user: "root",
    password: "080902abc",
    port: "3306",
    database: "baixiu"
};
const db_config_cis = {
    connectionLimit: 5,
    //贵燃
    user: "cisread",
    password: "cisread",
    connectString: "172.18.5.106:1521/cisprod",
    /* //深燃
     user:"cisread",
    password:"c2i0s1r4ead",
    connectString : "cisdr-scan.szgas.com:1521/CISDG"*/
};
oracledb.fetchAsBuffer = [oracledb.BLOB];
oracledb.fetchAsString = [oracledb.CLOB];
let pool = mysql.createPool(db_config);
var Dbutils = {
    queryData(sql, getResult, errResult) {
        pool.getConnection(function (err, connect) {//通过getConnection()方法进行数据库连接
            if (err) {
                console.log(`mysql链接失败${err}`);
                errResult(err);
            } else {
                connect.query(sql, function (err, result) {
                    if (err) {
                        console.log(`SQL error:${err}`)
                        errResult(err);
                    } else {
                        getResult(result);
                        pool.releaseConnection(connect)//释放连接池中的数据库连接
                        // pool.end();//关闭连接池
                    }
                });
            }
        });
    },
    queryCisData(sql, getResult, errResult) {
        oracledb.getConnection(
            db_config_cis,
            function (err, connection) {
                if (err) {
                    errResult(err);
                    return;
                }
                connection.execute(sql,
                    function (err, result) {
                        if (err) {
                            errResult(err);
                            doRelease(connection);
                            return;
                        }
                        getResult(Dbutils.changeJsonObj(result));
                    });
            });

        function doRelease(connection) {
            connection.close(
                function (err) {
                    if (err) {
                        console.error(err.message);
                    }
                });
        }
    },
    changeJsonObj(result) {
        var resultMetaData = result.metaData;
        var resultRows = result.rows;
        var returnObjArray = [];
        for (var i = 0; i < resultRows.length; i++) {//第i行
            var obj = {};
            for (var j = 0; j < resultMetaData.length; j++) {//第j列
                obj[resultMetaData[j].name] = resultRows[i][j];
            }
            returnObjArray.push(obj);
        }
        return returnObjArray;
    },
    execTrans(sqlparamsEntities, callback) {
        pool.getConnection(function (err, connection) {
            if (err) {
                return callback(err, null);
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    return callback(err, null);
                }
                console.log("开始执行transaction，共执行" + sqlparamsEntities.length + "条数据");
                var funcAry = [];
                sqlparamsEntities.forEach(function (sql_param) {
                    var temp = function (cb) {
                        var sql = sql_param.sql;
                        var param = sql_param.params;
                        connection.query(sql, param, function (tErr, rows, fields) {
                            if (tErr) {
                                connection.rollback(function () {
                                    console.log("事务失败，" + sql_param + "，ERROR：" + tErr);
                                    throw tErr;
                                });
                            } else {
                                return cb(null, 'ok');
                            }
                        })
                    };
                    funcAry.push(temp);
                });

                async.series(funcAry, function (err, result) {
                    if (err) {
                        connection.rollback(function (err) {
                            console.log("transaction error: " + err);
                            connection.release();
                            return callback(err, null);
                        });
                    } else {
                        connection.commit(function (err, info) {
                            console.log("transaction info: " + JSON.stringify(info));
                            if (err) {
                                console.log("执行事务失败，" + err);
                                connection.rollback(function (err) {
                                    console.log("transaction error: " + err);
                                    connection.release();
                                    return callback(err, null);
                                });
                            } else {
                                connection.release();
                                return callback(null, info);
                            }
                        })
                    }
                })
            });
        });
    }
}
module.exports = Dbutils;