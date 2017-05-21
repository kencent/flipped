var util = require('../../utils/util')
Page({
  data: {
    phone: '',
    password: '',
    veryCodeInfo:'获取验证码',
    disable:false
  },
  onReady:function(){
    util.getRequest('https://i.jandan.net/?oxwlxojflwblxbsapi=jandan.get_ooxx_comments&page=1').then(
      res => {
        console.log(res)
      }
    ).finally(function(res){
      console.log('finally we are success')
    })
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
    let that = this;
    let recordTime = 0
    wx.showToast({
      title: '验证码已发送',
      icon:"success",
      duration:1500
    })
    let timer = setInterval(function(){
        that.setData({
          disable:true,
          veryCodeInfo:(59-recordTime)+"s后重新获取"
        })
        recordTime++
    }, 1000)
    setTimeout(function(){
      clearTimeout(timer)
      that.setData({
        veryCodeInfo:'获取验证码',
        disable:false
      })
    }, 60*1000);
  },
  // 登录  
  login: function () {
    if (this.data.phone.length == 0 || this.data.password.length == 0) {
      wx.showToast({
        title: '用户名和验证码不能为空',
        icon: 'loading',
        duration: 2000
      })
    } else {
      wx.switchTab({
        url: '../square/square',
      })
    }
  }
}) 