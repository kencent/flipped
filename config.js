/**
 * 小程序配置文件
 */

var host = "flippedwords.com"
var appid = 1251789367
var buket = "flipped"

var config = {

  // 下面的地址配合云端 Server 工作
  host,
  appid,
  buket,
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
  uploadFileUrl: `https://gz.file.myqcloud.com/files/v2/${appid}/${buket}/files`,

  //音频
  uploadAudioUrl: `https://gz.file.myqcloud.com/files/v2/${appid}/${buket}/audios`,

  //图片上传请求,实际上用的也是文件上传接口https://qcloud.com/document/api/436/6066
  uploadImageUrl: `https://gz.file.myqcloud.com/files/v2/${appid}/${buket}/images`,
  // 微视频 https://www.qcloud.com/document/product/314/3498
  // uploadVideoUrl: `https://web.video.myqcloud.com/files/v1/${appid}/${buket}/videos`,

  uploadVideoUrl: `https://gz.file.myqcloud.com/files/v2/${appid}/${buket}/videos`,

  //发送心态请求
  postflippedwords: `https://${host}/flippedwords`,

  //反馈
  feedbackUrl:`https://${host}/feedbacks`
};

module.exports = config
