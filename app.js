const srpUrl = require('./config').srpUrl
const srpB = require('./config').srpB
const srpM2 = require('./config').srpM2
App({
    onLaunch: function () {
    	console.log('初始化完成');
    },
    onShow: function () {
      	console.log('我显示出来了');
    },
    onHide: function () {
        console.log('我被隐藏了');
    },
    getUserInfo: function (cb) {
      var that = this;
      if (this.globalData.userInfo) {
        typeof cb == "function" && cb(this.globalData.userInfo)
      } else {
        //调用登录接口
        wx.login({
          success: function () {
            wx.getUserInfo({
              success: function (res) {
                that.globalData.userInfo = res.userInfo;
                typeof cb == "function" && cb(that.globalData.userInfo)
              }
            })
          }
        });
      }
    },
    globalData: {
      userInfo: null
    }
  });