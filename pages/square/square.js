var util = require('../../utils/util')
var squreUrl =  require('../../config').squreUrl
Page({
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this
    var requestUrl = squreUrl;

    //获取经纬度存储在本地
    util.getLocation().then(res=>{
      var location = util.formatLocation(res.longitude, res.latitude)
      wx.setStorage({
        key: 'lng',
        data: location.lng,
      })
      wx.setStorage({
        key: 'lat',
        data: location.lat,
      })
    })

    wx.showLoading({
      title: '加载中',
    })
    
    this.refreshData()
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
  onPullDownRefresh: function () {
    this.refreshData()
  },
  //去详情页
  gotoDetail:function(event){
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + event.currentTarget.dataset.flippedwordId
    })
  },
  //获取带经纬度的后台请求链接
  getRequestUrlWithLocation:function(){
    var lng = wx.getStorageSync('lng')
    var lat = wx.getStorageSync('lat')
    if (!lng) {
      lng = 0
    }
    if (!lat) {
      lat = 0
    }
    return squreUrl + '?lat=' + lat + '&lng=' + lng
  },
  //刷新数据
  refreshData:function(){

    var requestUrl = this.getRequestUrlWithLocation()
    util.getRequestWithRefreshToken(requestUrl, "pages/squre/squre").then(res => {
      if (res.statusCode == 200) {
        this.setData({
          flippedwords: util.dealData(res.data.flippedwords)
        })
      }
    }).catch(res => {
      console.log(res);
    }).finally(res => {
      wx.stopPullDownRefresh()
      wx.hideLoading()
    })
  }
})