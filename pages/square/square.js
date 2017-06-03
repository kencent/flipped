var util = require('../../utils/util')
var squreUrl =  require('../../config').squreUrl
Page({
  data:{
    text:"Page square"
  },
  onPullDownRefresh: function () {
    util.getRequestWithRefreshToken(squreUrl, "pages/squre/squre").then(
      res => {
        wx.stopPullDownRefresh();

        
        if(res.statusCode == 200){
          wx.showToast({
            title: '数据已到最新',
          })

         
          
          this.setData({
            flippedwords: this.dealData(res.data.flippedwords)
          })
        }
      }
    ).catch(function(res){
      console.log(res);
      wx.stopPullDownRefresh();
    })
    
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    util.getRequestWithRefreshToken(squreUrl, "pages/squre/squre").then(
      res => {
        // wx.showModal({
        //   title: '请求成功',
        //   content: res.data,
        //   showCancel: false
        // })


        
        this.setData({
          flippedwords: this.dealData(res.data.flippedwords)
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
  },
  dealData: function (flippedwords){
    for (var i = 0; i < flippedwords.length; i++) {
      var flippedword = flippedwords[i];
      var contentStr = flippedword.contents;
      var contents = JSON.parse(contentStr);
      flippedword.contents = contents;
    }
    return flippedwords;
  }
})