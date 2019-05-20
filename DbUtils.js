var mysql = require('mysql');
var oracledb = require('oracledb');
const db_config={
    connectionLimit: 5,
    host:"47.96.76.172",
    user:"root",
    password:"4217aBc!",
    port:"3306",
    database:"baixiu"
};
const db_config_cis={
    connectionLimit: 5,
    //贵燃
    /*user:"cisadm",
    password:"cisadm",
    connectString : "120.78.213.19:1521/ccbstg"*/
    //深燃
    user:"cisadm",
   password:"cisadm",
   connectString : "10.9.3.78:1521/ccbuat"
};
oracledb.fetchAsBuffer = [ oracledb.BLOB ];
oracledb.fetchAsString = [ oracledb.CLOB ];
let pool=mysql.createPool(db_config);
/*var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '4217aBc!',
    database: 'baixiu'
});*/
// connection.connect();
var Dbutils = {
    /*queryData(sql, getResult) {
        connection.query(sql, function (error, results, fields) {
            if (error) return getResult({});
            getResult(results);
            // connection.end();
        });
    },*/
    /*closeDb() {
        connection.end();
    },*/
    queryData(sql, getResult,errResult){
        pool.getConnection(function(err,connect){//通过getConnection()方法进行数据库连接
            if(err){
                console.log(`mysql链接失败${err}`);
                errResult(err);
            }else{
                connect.query(sql,function(err,result){
                    if(err){
                        console.log(`SQL error:${err}`)
                        errResult(err);
                    }else{
                        getResult(result);
                        pool.releaseConnection(connect)//释放连接池中的数据库连接
                        // pool.end();//关闭连接池
                    }
                });
            }
        });
    },
    queryCisData(sql, getResult,errResult){
        oracledb.getConnection(
            db_config_cis,
            function(err, connection){
                if (err) {
                    errResult(err);
                    return;
                }
                connection.execute(sql,
                    function(err, result){
                        if (err) {
                            errResult(err);
                            doRelease(connection);
                            return;
                        }
                        getResult(Dbutils.changeJsonObj(result));
                    });
            });

        function doRelease(connection)
        {
            connection.close(
                function(err) {
                    if (err) {
                        console.error(err.message);
                    }
                });
        }
    },
    changeJsonObj(result){
        var resultMetaData =  result.metaData;
        var resultRows = result.rows;
        var returnObjArray = [];
        for(var i=0;i<resultRows.length;i++){//第i行
            var obj = {};
            for(var j = 0;j<resultMetaData.length;j++){//第j列
                obj[resultMetaData[j].name] = resultRows[i][j];
            }
            returnObjArray.push(obj);
        }

        return returnObjArray;
    },
};
module.exports = Dbutils;