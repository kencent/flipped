var Promise = require('es6-promise.min.js')
var sjcl = require('sjcl.js')
var app = getApp()
const srpB = require('../config').srpB
const srpM2 = require('../config').srpM2
const uploadFileUrl = require('../config').uploadFileUrl
const uploadImageUrl  = require('../config').uploadImageUrl
const uploadVideoUrl = require('../config').uploadVideoUrl
const uploadAudioUrl = require('../config').uploadAudioUrl
function formatDate(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds();


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  var hour = parseInt(time / 3600)
  time = time % 3600
  var minute = parseInt(time / 60)
  time = time % 60
  var second = time

  return ([hour, minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

function successHttp(code){
  return code == 200 || code == 201
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        //成功
        resolve(res)
      }
      obj.fail = function (res) {
        //失败
        reject(res)
      }
      fn(obj)
    })
  }
}
//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};


/**
 * 微信选择视频
 */
function chooseVideo(maxDuration) {
  var request = wxPromisify(wx.chooseVideo)
  return request({
    maxDuration: maxDuration,
  })
}

/**
 * 微信选择照片
 */
function chooseImage(count){
  var request = wxPromisify(wx.chooseImage)
  return request({
    count: count,
    sizeType: ['compressed']
  })
}

/**
 * 微信上传文件promis封装
 * signature:服务器获取的签名
 * filePath：文件的路径
 * fileName:文件命名
 */
function uploadFile(signature, filePath, fileName){
  var request = wxPromisify(wx.uploadFile)
  return request({
    url: uploadFileUrl + '/' + fileName,
    filePath: filePath,
    header: {
      'Authorization': signature
    },
    name: 'filecontent',
    formData: {
      op: 'upload'
    },
  })
}
/**
 * 微信图片文件promis封装
 * signature:服务器获取的签名
 * filePath：文件的路径
 * fileName:文件命名
 */
function uploadImage(signature, filePath, fileName) {
  var request = wxPromisify(wx.uploadFile)
  return request({
    url: uploadImageUrl + '/' + fileName,
    filePath: filePath,
    header: {
      'Authorization': signature
    },
    name: 'filecontent',
    formData: {
      op: 'upload'
    },
  })
}

/**
 * 微信视频文件promis封装
 * signature:服务器获取的签名
 * filePath：文件的路径
 * fileName:文件命名
 */
function uploadVideo(signature, filePath, fileName) {
  var request = wxPromisify(wx.uploadFile)
  return request({
    url: uploadVideoUrl + '/' + fileName,
    filePath: filePath,
    header: {
      'Authorization': signature
    },
    name: 'filecontent',
    formData: {
      op: 'upload'
    },
  })
}

/**
 * 微信音频文件promis封装
 * signature:服务器获取的签名
 * filePath：文件的路径
 * fileName:文件命名
 */
function uploadAudio(signature, filePath, fileName) {
  var request = wxPromisify(wx.uploadFile)
  return request({
    url: uploadAudioUrl + '/' + fileName,
    filePath: filePath,
    header: {
      'Authorization': signature
    },
    name: 'filecontent',
    formData: {
      op: 'upload'
    },
  })
}
/**
 * 微信请求get方法
 * url
 * data 以对象的格式传入
 */
function getRequest(url, header) {
  var getRequest = wxPromisify(wx.request)
  return getRequest({
    url: url,
    method: 'GET',
    header: header
  })
}

/**
 * 微信请求post方法封装
 * url
 * data 以对象的格式传入
 */
function postRequest(url, data, header) {
  var postRequest = wxPromisify(wx.request)
  return postRequest({
    url: url,
    method: 'POST',
    data: data,
    header: header
  })
}

function getToken(method,uri,body) {
  // 并设置到头部 Authorization: SRP {token}
  if (wx.getStorageSync('clientKey') === "") {
    return undefined
  }
  var ClientKey = sjcl.codec.hex.toBits(wx.getStorageSync('clientKey'))
  // console.log("password = " + wx.getStorageSync('password'));
  // console.log("ClientKey = " + sjcl.codec.hex.fromBits(ClientKey));
  var seq = wx.getStorageSync("seq") === "" ? 1 : wx.getStorageSync("seq")
  ///每次拿到toaken之后，seq++
  wx.setStorageSync('seq', seq + 1)
  console.log("seq is " + seq)
  var ts = new Date().getTime()
  var username = wx.getStorageSync('username')
  var rd = sjcl.random.randomWords(1, 0)[0]

  var sign = username + ts + seq + rd + method + uri + JSON.stringify(body)
    console.log("sign = "  + sign);
    var hmac_sha1 = new sjcl.misc.hmac(ClientKey, sjcl.hash.sha1)
    sign = sjcl.codec.base64.fromBits(hmac_sha1.encrypt(sign))
    console.log("sign = "  + sign); 
  //var token = {I: username, t: new Date().getTime(), q: seq, clt: {p: "wxapp", v: 10000}, r: sjcl.random.randomWords(1)[0]};
    var token = { I: username, t: ts, q: seq, clt: { p: "wxapp", v: 10000 }, r: rd, sign: sign };

  token = sjcl.codec.utf8String.toBits(JSON.stringify(token));
  // iv是前后台写死的一个固定的值 
  var iv = sjcl.codec.hex.toBits("bfd3814678afe0036efa67ca8da44e2e");
  var aes = new sjcl.cipher.aes(ClientKey.slice(0, 8));
  token = sjcl.mode.cbc.encrypt(aes, token, iv);
  console.log("token = " + sjcl.codec.base64.fromBits(token));
  return sjcl.codec.base64.fromBits(token)
}

function refreshToken(N_num_bits) {
  if (app.isCurrentRefreshToken == true){
    return
  }
  app.isCurrentRefreshToken = true
  //todo  这些key值可以
  var wx_salt = wx.getStorageSync('salt')
  var phone = wx.getStorageSync('username')
  var password = wx.getStorageSync('password')
  console.log(wx_salt)
  console.log(phone)
  console.log(password)
  var salt = sjcl.codec.hex.toBits(wx_salt);
  // 第二步, 生成客户端随机值，使用客户端随机值换取服务器端随机值
  // client -> server: A
  // server -> client: B
  var M1, M2, A, ClientKey;
  var srp = sjcl.keyexchange.srp;
  var group = srp.knownGroup(N_num_bits);
  var a = sjcl.random.randomWords(8, 0); //sjcl.random.randomWords(8);
  A = srp.makeA(a, group);
  console.log("A = " + sjcl.codec.hex.fromBits(A));
  return getRequest(srpB + "?A=" + sjcl.codec.hex.fromBits(A), {
    'Content-Type': 'application/json',
    "x-uid": phone
  }).then(
    res => {
      if (!res.data.err) {
        console.log(res.data.B)
        var B = sjcl.codec.hex.toBits(res.data.B)
        if (sjcl.bn.fromBits(B).mod(group.N).equals(0)) {
          console.log("bad server");
          // throw new Error("服务器错误");
          // app.isCurrentRefreshToken = false
          return Promise.reject(new Error("500 bad server"))
        } else {
          // 第三步, 验证验证码, 同时验证域名是否被劫持
          // client -> server: M1
          // server -> client: M2
          ClientKey = srp.makeClientKey(phone, password, salt, a, A, B, group);
          M1 = srp.makeM1(phone, salt, A, B, ClientKey, group);
          console.log("M1 = " + sjcl.codec.hex.fromBits(M1));
          return getRequest(srpM2 + '?M1=' + sjcl.codec.hex.fromBits(M1), {
            'Content-Type': 'application/json',
            "x-uid": phone
          })
        }
      } else {//获取srpB失败
        //todo
        // app.isCurrentRefreshToken = false
        return Promise.reject(new Error(res.statusCode + " 获取srpb失败"))
      }
    }).then(
    res => {
      if (!res.data.err) {
        M2 = srp.makeM2(A, M1, ClientKey);
        console.log("M1 = " + sjcl.codec.hex.fromBits(M1));
        console.log("M2 = " + sjcl.codec.hex.fromBits(M2));
        var serverM2 = res.data.M2;
        if (sjcl.codec.hex.fromBits(M2) != serverM2.toLowerCase()) {
          console.log("bad server");
          // app.isCurrentRefreshToken = false
          return Promise.reject(new Error("500"))
        } else {
          console.log('M2拿到成功！续期成功！')
          //存储username，passowrd，clientkey
          wx.setStorageSync('username', phone)
          wx.setStorageSync('password', password)
          wx.setStorageSync('salt', wx_salt)
          wx.setStorageSync('clientKey', sjcl.codec.hex.fromBits(ClientKey))

          console.log(wx.getStorageSync('username'));
          console.log(wx.getStorageSync('password'));
          console.log(wx.getStorageSync('salt'));
          console.log(wx.getStorageSync('clientKey'));
          // 每次请求用ClientKey加密(username, + local millisecond + seq + client(platform + version) + random)得到token
          // util.getToken()
          //应该是续期成功了
          // app.isCurrentRefreshToken = false
          return Promise.resolve(200)
        }
      } else if (res.statusCode == 422) {//验证码输入错误
        return Promise.reject(new Error("422 验证码错误"))
      } else if (res.statusCode == 429) {//验证码输入错误次数达到三次，
        return Promise.reject(new Error("429 验证码错误次数达到3次"))
      }
    }).finally(res=>{
      app.isCurrentRefreshToken = false
    })
}

/**
 * url 页面的路径，
 * page  当前是那个页，续期后重新加载
 */
function getRequestWithRefreshToken(url, page) {
  var token = getToken('GET',url,{})
  console.log("from mine page token [" + token + "]")
  var username = wx.getStorageSync('username')
  // if (token == undefined) {//此时用户应该并没有登录过
  //   wx.redirectTo({
  //     url: '../../pages/login/login',
  //   })
  //   return Promise.reject(new Error("user not login"))
  // }
  return getRequest(url, {
    'Content-Type': 'application/json',
    "x-uid": wx.getStorageSync('username'),
    'Authorization': "SRP " + token
  }).then(function (res) {
    if (successHttp(res.statusCode)) {
      console.log("successHttp url" + url);
      return Promise.resolve(res)
    } else if (res.statusCode == 401) {//授权过去，重新授权
      console.log("401 url" + url);
      if (!res.header['WWW-Authenticate']){
        wx.redirectTo({
          url: '../../pages/login/login',
        })
      }

      var N_num_bits = res.header['WWW-Authenticate'].split(',')[1].split('=')[1].split('"')[1]
      console.log(N_num_bits)
      console.log("begin refreshToken");
      refreshToken(N_num_bits).then(function (res) {
        console.log("refreshToken "+res);
        console.log(res)
        if (successHttp(statusCode)) {//续期成功
          //重新打开当前页面
          wx.reLaunch({
            url: page,
          })
        }
      }).catch(function (res) {//续期因为某些原因失败了
        console.log("refreshToken fail " + res);
        console.log(res)
        //跳转到登录页面重新登录
        wx.redirectTo({
          url: '../../pages/login/login',
        })
      })
    }else{
      return Promise.resolve(res)
    }
  }).catch(function (res) {
    console.log(res)
  })
}

function postRequestWithRereshToken(url, data) {
  var token = getToken('POST',url,data)
  console.log("from mine page token [" + token + "]")
  var username = wx.getStorageSync('username')
  if (token == undefined) {//此时用户应该并没有登录过
    wx.redirectTo({
      url: '../../pages/login/login',
    })
    return Promise.reject(new Error("user not login"))
  }
  return postRequest(url, data,{
    'Content-Type': 'application/json',
    "x-uid": wx.getStorageSync('username'),
    'Authorization': "SRP " + token
  }).then(function (res) {
    if (successHttp(res.statusCode)) {
      console.log("successHttp url"+url);
      return Promise.resolve(res)
    } else if (res.statusCode == 401) {//授权过去，重新授权
      console.log("401 url" + url);
      if (!res.header['WWW-Authenticate']) {
        wx.redirectTo({
          url: '../../pages/login/login',
        })
      }
      var N_num_bits = res.header['WWW-Authenticate'].split(',')[1].split('=')[1].split('"')[1]
      console.log(N_num_bits)
      refreshToken(N_num_bits).then(function (res) {
        console.log(res)
        if (successHttp(res.statusCode)) {//续期成功
          //重新打开当前页面
          wx.showToast({
            title: '操作失败，请重试',
            icon:'loading'
          })
        }else{
          return Promise.reject(res)
        }
      }).catch(function (res) {//续期因为某些原因失败了
        console.log(res)
        //跳转到登录页面重新登录
        wx.redirectTo({
          url: '../../pages/login/login',
        })
      })
    }else{
      return Promise.resolve(res)
    }
  }).catch(function (res) {
    console.log(res)
    return Promise.reject(res)
  })
}
function formatLocation(longitude, latitude) {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
    longitude = parseFloat(longitude)
    latitude = parseFloat(latitude)
  }

  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)

  return {
    lng: longitude,
    lat: latitude
  }
}

/**
 * 那存储数值的promise封装
 */
function getStorage(key){
  var request = wxPromisify(wx.getStorage);
  return request({
    key:key
  })
}
/**
 * 保存文件
 */
function saveFile(fileUrl){
  var request = wxPromisify(wx.saveFile)
  return request({
    tempFilePath:fileUrl
  })
}

function getLocation(){
  var request = wxPromisify(wx.getLocation)
  return request({

  })
}

/**
 * 保存图片文件到相册，没实现
 */
function saveImageToPhotosAlbum(fileUrl){
  var request = wxPromisify(wx.saveImageToPhotosAlbum);
  return request({
    filePath:fileUrl
  })
}

/**
 * 处理表白数据
 */
function dealData(flippedwords) {
  for (var i = 0; i < flippedwords.length; i++) {
    var flippedword = flippedwords[i];
    var contentStr = flippedword.contents;
    // var contents = JSON.parse(contentStr);
    var contents = flippedword.contents;
    var title = '';
    var hasPic = false;
    var hasVideo = false;
    var hasAudio = false;
    for (var j = 0; j < contents.length; j++) {
      var content = contents[j];
      if (content.type == 'text') {
        title = content.text;
      } else if (content.type == 'picture') {
        hasPic = true;
      } else if (content.type == 'video') {
        hasVideo = true;
      } else if (content.type == 'audio') {
        hasAudio = true;
      }
    }
    var orginTitle = title;
    if (hasAudio) {
      title = '[音频]' + title;
    }
    if (hasVideo) {
      title = '[视频]' + title;
    }
    if (hasPic) {
      title = '[图片]' + title;
    }
    flippedword.orginTitle = orginTitle;
    flippedword.title = title;
    flippedword.contents = contents;

    var distanceStr = '';
    if (flippedword.distance >= 1000){
      distanceStr = parseFloat(flippedword.distance/1000.0)
      distanceStr = distanceStr.toFixed(2)
      distanceStr = '距离：'+distanceStr + 'km';
    } else if (flippedword.distance > 0){
      distanceStr = parseFloat(flippedword.distance)
      distanceStr = '距离：' + distanceStr + 'm';
    } else if (flippedword.distance == 0){
      distanceStr = '距离：就在您身边'
    }
    flippedword.distanceStr = distanceStr
  }
  return flippedwords;
}

module.exports = {
  formatDate: formatDate,
  formatTime: formatTime,
  postRequest: postRequest,
  getRequest: getRequest,
  getToken: getToken,
  refreshToken: refreshToken,
  getRequestWithRefreshToken: getRequestWithRefreshToken,
  postRequestWithRereshToken: postRequestWithRereshToken,
  formatLocation: formatLocation,
  chooseImage: chooseImage,
  uploadFile:uploadFile,
  uploadVideo: uploadVideo,
  uploadImage:uploadImage,
  uploadAudio: uploadAudio,
  chooseVideo: chooseVideo,
  getStorage: getStorage,
  dealData: dealData,
  getLocation: getLocation
}
