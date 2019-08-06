var mysql = require('mysql');
var PermissionDistributionSql = {
    getUserListData(offset,pageSize,email,nickName){
        if(email) {
            email = '%' + email.replace(/%/g, '') + '%';
        }
        if(nickName) {
            nickName = '%' + nickName.replace(/%/g, '') + '%';
        }
        var sql = `
                    SELECT
                        u.email,
	                    u.nickname
                    FROM
                        users u
                    WHERE
                        1 = 1
                    `;
        if(email){
            sql += ` AND u.email LIKE ${mysql.escape(email)}`;
        }
        if(nickName){
            sql += `AND u.nickname LIKE ${mysql.escape(nickName)}`;
        }
        if (offset && pageSize) {
            sql += ` LIMIT ${((offset - 1) * pageSize)}, ${pageSize}`;
        }
        return sql;
    },
    getUserCount(email,nickName){
        if(email) {
            email = '%' + email.replace(/%/g, '') + '%';
        }
        if(nickName) {
            nickName = '%' + nickName.replace(/%/g, '') + '%';
        }
       var sql =  `
                    SELECT
                        count(1) AS count
                    FROM
                        users u
                    WHERE
                        1 = 1
                  `;
        if(email){
            sql += ` AND u.email LIKE ${mysql.escape(email)}`;
        }
        if(nickName){
            sql += `AND u.nickname LIKE ${mysql.escape(nickName)}`;
        }
        return sql;
    }
};
module.exports = PermissionDistributionSql;