var nodemailer = require("nodemailer");
const params = {
    host: 'smtp.163.com', // 设置服务
    port: 465, // 端口
    sercure: true, // 是否使用TLS，true，端口为465，否则其他或者568
    auth: {
        user: 'wupengforIT@163.com', // 邮箱和密码
        pass: '080902abc'
    }
};
// 发送邮件
const transporter = nodemailer.createTransport(params);
module.exports ={
    sendMain(emailAddress,subject,html,fun){
        // 邮件信息
        var returnData = {};
        const mailOptions = {
            from: 'wupengforIT@163.com', // 发送邮箱
            to: emailAddress, // 接受邮箱
            subject: subject, // 标题
            html: html // 内容
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                returnData.status = 1;
                returnData.desc = '邮件发送失败';
                fun(returnData);
                return console.log(error);
            }
            returnData.status = 0;
            returnData.desc = '邮件发送成功';
            console.log('Message %s sent: %s', info.messageId, info.response);
            fun(returnData);
        })
    }
};