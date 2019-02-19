var mysql = require('mysql');
const db_config={
    connectionLimit: 5,
    host:"47.96.76.172",
    user:"root",
    password:"4217aBc!",
    port:"3306",
    database:"baixiu"
};
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
    }
};
module.exports = Dbutils;