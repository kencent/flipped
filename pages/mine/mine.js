var util = require('../../utils/util')
var users =  require('../../config').users
Page({
  data:{
    text:"Page mine"
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    util.getRequestWithRefreshToken(users+"/1323131","pages/mine/mine").then(
      res => {
        wx.showModal({
          title: '请求成功',
          content: res.data,
          showCancel:false
        })
      }
    )
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})