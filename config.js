/**
 * 小程序配置文件
 */

var host = "flippedwords.com"

var config = {

  // 下面的地址配合云端 Server 工作
  host,

  // 登录地址，用于建立会话
  srpUrl: `https://${host}/srp/password`,
  srpB: `https://${host}/srp/B`,
  srpM2: `https://${host}/srp/M2`,

  //广场请求
  squreUrl: `https://${host}/nearby_flippedwords`,

  detailUrl: `https://${host}/flippedwords`,

  //用户请求 
  users: `https://${host}/users`,

  //查询发给我的flippedwords
  myFlippedwords: `https://${host}/my_flippedwords`,

  myPubFlippedwords: `https://${host}/mypub_flippedwords`,

  signUlr: `https://${host}/youtusig`,

  //上传文件请求
  uploadFileUrl: `https://gz.file.myqcloud.com/files/v2/1251789367/flipped/test`,

  //发送心态请求
  postflippedwords: `https://${host}/flippedwords`,

  //反馈
  feedbackUrl:`https://${host}/feedbacks`
};

module.exports = config
