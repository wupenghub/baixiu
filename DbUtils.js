var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '47.96.76.172',
    user: 'root',
    password: '4217aBc!',
    database: 'baixiu'
});
connection.connect();
var Dbutils = {
    queryData(sql, getResult) {
        connection.query(sql, function (error, results, fields) {
            if (error) return getResult({});
            getResult(results);
        });
    },
    closeDb() {
        connection.end();
    }
};
module.exports = Dbutils;