/**
 * 小程序配置文件
 */

var host = "flippedwords.com"

var config = {

    // 下面的地址配合云端 Server 工作
    host,

    // 登录地址，用于建立会话
    srpUrl: `https://${host}/srp/password`,
    srpB:`https://${host}/srp/B`,
    srpM2:`https://${host}/srp/M2`,

    //广场请求
    squreUrl:`https://${host}/squre`,

    //用户请求 
    users:`https://${host}/users`,

    //发送心态请求
    postflippedwords: `https://${host}/flippedwords`,
};

module.exports = config
