var Promise = require('es6-promise.min.js')
var sjcl = require('sjcl.js')
const srpB = require('../config').srpB
const srpM2 = require('../config').srpM2
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds();


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
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

function getToken() {
  // 并设置到头部 Authorization: SRP {token}

  var ClientKey = sjcl.codec.hex.toBits(wx.getStorageSync('clientKey'))
  if (ClientKey === "") {
    return undefined
  }
  // console.log("password = " + wx.getStorageSync('password'));
  // console.log("ClientKey = " + sjcl.codec.hex.fromBits(ClientKey));
  var seq = 1;
  //var token = {I: username, t: new Date().getTime(), q: seq, clt: {p: "wxapp", v: 10000}, r: sjcl.random.randomWords(1)[0]};
  var token = { I: wx.getStorageSync('username'), q: seq, clt: { p: "wxapp", v: 10000 } };
  token = sjcl.codec.utf8String.toBits(JSON.stringify(token));
  // iv是前后台写死的一个固定的值 
  var iv = sjcl.codec.hex.toBits("bfd3814678afe0036efa67ca8da44e2e");
  var aes = new sjcl.cipher.aes(ClientKey.slice(0, 8));
  token = sjcl.mode.cbc.encrypt(aes, token, iv);
  console.log("token = " + sjcl.codec.base64.fromBits(token));
  return sjcl.codec.base64.fromBits(token)
}

function refreshToken(N_num_bits) {
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
          return Promise.resolve(200)
        }
      } else if (res.statusCode == 422) {//验证码输入错误
        return Promise.reject(new Error("422 验证码错误"))
      } else if (res.statusCode == 429) {//验证码输入错误次数达到三次，
        return Promise.reject(new Error("429 验证码错误次数达到3次"))
      }
    })
}

/**
 * url 页面的路径，
 * page  当前是那个页，续期后重新加载
 */
function getRequestWithRefreshToken(url,page){
  var token = getToken()
  console.log("from mine page token [" + token + "]")
  var username = wx.getStorageSync('username')
  if (token == undefined) {//此时用户应该并没有登录过
    wx.redirectTo({
      url: 'pages/login/login',
    })
  }
  return getRequest(url, {
    'Content-Type': 'application/json',
    "x-uid": wx.getStorageSync('username'),
    'Authorization': "SRP " + token
  }).then(function (res) {
    if (res.statusCode == 200) {
      return Promise.resolve(res)
    } else if (res.statusCode == 401) {//授权过去，重新授权
      var N_num_bits = res.header['WWW-Authenticate'].split(',')[1].split('=')[1].split('"')[1]
      console.log(N_num_bits)
      refreshToken(N_num_bits).then(function (res) {
        console.log(res)
        if (res == 200) {//续期成功
          //重新打开当前页面
          wx.reLaunch({
            url: page,
          })
        }
      }).catch(function (res) {//续期因为某些原因失败了
        console.log(res)
        //跳转到登录页面重新登录
        wx.redirectTo({
          url: 'pages/login/login',
        })
      })
    }
  }).catch(function (res) {
    console.log(res)
  })
}

module.exports = {
  formatTime: formatTime,
  postRequest: postRequest,
  getRequest: getRequest,
  getToken: getToken,
  refreshToken: refreshToken,
  getRequestWithRefreshToken: getRequestWithRefreshToken
}
