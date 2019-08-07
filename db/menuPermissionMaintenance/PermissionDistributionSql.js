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
    },
    userExistSql(email){
        return `select count(1) as count from users u where u.email = ${mysql.escape(email)}`;
    },
    queryUserInfo(email){
        return `
                SELECT
                    sg.permissions_code as code,
                    sg.permissions_desc as descr
                FROM
                    sys_users_mnue_permissions_group usg,
                    sys_mnue_permissions_group sg
                WHERE
                    usg.permissions_code = sg.permissions_code
                and usg.email = ${mysql.escape(email)}
                `;
    },
    userCompanySql(email){
        return `
                SELECT
                    org.company_code AS code,
                    org.company_desc AS descr
                FROM
                    sys_company_user su,
                    company_org org
                WHERE
                    su.company_code = org.company_code
                AND su.email = ${mysql.escape(email)}
                GROUP BY
                    CODE,
                    descr
               `;
    }
};
module.exports = PermissionDistributionSql;