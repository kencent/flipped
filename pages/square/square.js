var util = require('../../utils/util')
var squreUrl =  require('../../config').squreUrl
Page({
  data:{
    text:"Page square"
  },
  onPullDownRefresh: function () {
    this.loadData()
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    var requestUrl = squreUrl;
    util.getLocation().then(res=>{
      that.setData({
        hasLocation: true,
        location: util.formatLocation(res.longitude, res.latitude)
      })
      if (that.data.hasLocation && that.data.location.lat && that.data.location.lng) {
        requestUrl += '?lat=' + that.data.location.lat + '&lng=' + that.data.location.lng
      }
      return util.getRequestWithRefreshToken(requestUrl, "pages/squre/squre")
    }).catch(res=>{
      return util.getRequestWithRefreshToken(requestUrl, "pages/squre/squre")
    }).then(res=>{
      if (res.statusCode == 200) {
        this.setData({
          flippedwords: util.dealData(res.data.flippedwords)
        })
      }
    }).catch(res=>{
      console.log(res);
    }).finally(res=>{
      wx.stopPullDownRefresh();
    })

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
  gotoDetail:function(event){
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + event.currentTarget.dataset.flippedwordId
    })
  },
  loadData : function(){
    var requestUrl = squreUrl;
    if (this.data.hasLocation && this.data.location.lat && this.data.location.lng){
      requestUrl += '?lat=' + this.data.location.lat + '&lng=' + this.data.location.lng
    }

    util.getRequestWithRefreshToken(requestUrl, "pages/squre/squre").then(
      res => {

        if (res.statusCode == 200) {
         

          wx.stopPullDownRefresh();

          this.setData({
            flippedwords: util.dealData(res.data.flippedwords)
          })
        }
      }
    ).catch(function (res) {
      console.log(res);
      wx.stopPullDownRefresh();
    })
  },
  // getLocation: function getLocation() {
  //   var that = this
  //   wx.getLocation({
  //     success: function (res) {
  //       console.log(res)
  //       that.setData({
  //         hasLocation: true,
  //         location: util.formatLocation(res.longitude, res.latitude)
  //       })
  //     }
  //   })
  // },
})