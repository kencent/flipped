const srpUrl = require('../../config').srpUrl
const srpB = require('../../config').srpB
const srpM2 = require('../../config').srpM2
const sjcl = require('../../utils/sjcl')
var util = require('../../utils/util')
Page({
  data: {
    phone: '',
    password: '',
    veryCodeInfo: '获取验证码',
    disable: false,
    salt: '',
    N_num_bits: ''
  },
  // 获取输入账号  
  mobileInput: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  // 获取输入密码  
  veryCodeInput: function (e) {
    this.setData({
      password: e.detail.value
    })
  },
  getVeryCode: function (e) {
    if (this.data.phone.length == 0) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'loading',
        duration: 1500
      })
      return
    }
    let that = this;
    let recordTime = 0
    util.getRequest(srpUrl, {
      'Content-Type': 'application/json',
      "x-uid": that.data.phone
    }).then(
      res => {
        if (!res.data.err && res.statusCode == 200) {
          that.setData({
            salt: res.data.s,
            N_num_bits: res.data.N_num_bits,
            password: res.data.password,
          })
          console.log(that.data)
          let timer = setInterval(function () {
            that.setData({
              disable: true,
              veryCodeInfo: (res.data.countdown - recordTime) + "s后重新获取"
            })
            recordTime++
          }, 1000)
          setTimeout(function () {
            clearTimeout(timer)
            that.setData({
              veryCodeInfo: '获取验证码',
              disable: false
            })
          }, res.data.countdown * 1000);
          wx.showToast({
            title: !res.data.validtime ? '验证码发送成功' : '验证码发送成功,有效期' + (res.data.validtime / 60) + "分钟",
            icon: 'success',
            duration: 1500
          })
        } else {//获取验证码失败了，给出友好提示
          wx.showModal({
            title: '错误',
            content: res.data.err,
            showCancel: false,
            confirmText: "确定"
          })
        }
      }
      ).finally(function (res) {
        console.log(res)
      })
  },
  // 登录  
  login: function () {
    var that = this
    if (this.data.phone.length == 0 || this.data.password.length == 0) {
      wx.showToast({
        title: '用户名和验证码不能为空',
        icon: 'loading',
        duration: 2000
      })
    } else if (this.data.salt.length == 0) {
      wx.showToast({
        title: '请获取验证码',
        icon: 'loading',
        duration: 1500
      })
    } else {
      var salt = sjcl.codec.hex.toBits(this.data.salt);
      // 第二步, 生成客户端随机值，使用客户端随机值换取服务器端随机值
      // client -> server: A
      // server -> client: B
      var M1, M2, A, ClientKey;
      var srp = sjcl.keyexchange.srp;
      var group = srp.knownGroup(this.data.N_num_bits);
      var a = sjcl.random.randomWords(8, 0); //sjcl.random.randomWords(8);
      A = srp.makeA(a, group);
      console.log("A = " + sjcl.codec.hex.fromBits(A));
      util.getRequest(srpB + "?A=" + sjcl.codec.hex.fromBits(A), {
        'Content-Type': 'application/json',
        "x-uid": that.data.phone
      }).then(
        res => {
          if (!res.data.err) {
            console.log(res.data.B)
            var B = sjcl.codec.hex.toBits(res.data.B)
            if (sjcl.bn.fromBits(B).mod(group.N).equals(0)) {
              console.log("bad server");
              throw new Error("服务器错误");
            } else {
              // 第三步, 验证验证码, 同时验证域名是否被劫持
              // client -> server: M1
              // server -> client: M2
              ClientKey = srp.makeClientKey(that.data.phone, that.data.password, salt, a, A, B, group);
              M1 = srp.makeM1(that.data.phone, salt, A, B, ClientKey, group);
              console.log("M1 = " + sjcl.codec.hex.fromBits(M1));
              return util.getRequest(srpM2 + '?M1=' + sjcl.codec.hex.fromBits(M1), {
                'Content-Type': 'application/json',
                "x-uid": that.data.phone
              })

            }
          } else {//获取srpB失败
            wx.showToast({
              title: res.data.err,
              icon: 'loading',
              duration: 1500
            })
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
              throw new Error("服务器错误");
            } else {
              console.log('M2拿到成功！')
              //存储username，passowrd，clientkey
              wx.setStorageSync('username', that.data.phone)
              wx.setStorageSync('password', that.data.password)
              wx.setStorageSync('salt', that.data.salt)
              wx.setStorageSync('clientKey', sjcl.codec.hex.fromBits(ClientKey))

              console.log(wx.getStorageSync('username'));
              console.log(wx.getStorageSync('password'));
              console.log(wx.getStorageSync('salt'));
              console.log(wx.getStorageSync('clientKey'));
              // 每次请求用ClientKey加密(username, + local millisecond + seq + client(platform + version) + random)得到token
              // util.getToken()
              //登录成功跳转到主页
              wx.switchTab({
                url: '../square/square',
              })
            }
          } else if (res.statusCode == 422) {//验证码输入错误
            wx.showToast({
              title: '验证码输入错误',
              icon: 'loading',
              duration: 1500
            })
          } else if (res.statusCode == 429) {//验证码输入错误次数达到三次，
            wx.showToast({
              title: '验证码输错次数超过3次，请重新获取验证码',
              icon: 'loading',
              duration: 1500
            })
          }
        }).catch(res => {
          console.log(res)
        }).finally(
        res => {
          console.log("登录完成")
          wx.hideToast()
        }
        )
    }
  }
}) 