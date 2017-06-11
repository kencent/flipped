var util = require('../../utils/util')
var users = require('../../config').users
var myFlippedwords = require('../../config').myFlippedwords
var myPubFlippedwords = require('../../config').myPubFlippedwords
var g_tab = 0 //当前选择的tab

// 自定义标签
var iconPath = "../../images/icons/"
var tabs = [
  {
    "icon": iconPath + "post.png",
    "iconActive": iconPath + "post_selected.png",
    "title": "我发送的",
    "extraStyle": "",
  },
  {
    "icon": iconPath + "receive.png",
    "iconActive": iconPath + "receive_selected.png",
    "title": "我收到的",
    "extraStyle": "",
  },
  // {
  //   "icon": iconPath + "like.png",
  //   "iconActive": iconPath + "likeHL.png",
  //   "title": "喜欢",
  //   "extraStyle": "",
  // },
]

var app = getApp()
Page({

  // data
  data: {
    // 展示的tab标签
    tabs: tabs,

    // 当前选中的标签
    currentTab: "tab1",

    // 高亮的标签索引
    highLightIndex: "0",


    userInfo: {},
  },

  
  onShow: function () {
   
  },

  //加载数据
  loadData: function () {
    if (g_tab == 0) {
      this.loadMySendData()
    } else {
      this.loadMyReceiveData(0)
    }
  },

  //加载我收到的数据
  loadMyReceiveData : function(id){
    var flippedwordsData = {
      isLoadingReceive: true
    }
    this.setData({
      flippedwordsData: flippedwordsData
    })

    var lng = wx.getStorageSync('lng')
    var lat = wx.getStorageSync('lat')
    if (!lng) {
      lng = 0
    }
    if (!lat) {
      lat = 0
    }

    var requestUrl = myFlippedwords + '?lat=' + lat + '&lng=' + lng

    util.getRequestWithRefreshToken(requestUrl, "pages/mine/mine").then(
      res => {
        
        if (res.statusCode != 200) {
          return
        }
        wx.stopPullDownRefresh();

        flippedwordsData = {
          receiveFlippedwords: util.dealData(res.data.flippedwords),
          isLoadingReceive: false
        }
        this.setData({
          flippedwordsData: flippedwordsData
        })
      }
    )
  },
  
  //加载我发出的数据
  loadMySendData : function(){
    var flippedwordsData = {
      isLoadingSend : true
    }
    this.setData({
      flippedwordsData: flippedwordsData
    })

    var that = this
    util.getRequestWithRefreshToken(myPubFlippedwords, "pages/mine/mine").then(
      res => {

        if (res.statusCode != 200) {
          return
        }
        wx.stopPullDownRefresh();

        flippedwordsData = {
          sendFlippedwords: util.dealData(res.data.flippedwords),
          isLoadingSend : false
        }

        for (var i = 0; i < flippedwordsData.sendFlippedwords.length; i++){
          var flippedword = flippedwordsData.sendFlippedwords[i]
          var statusStr = '';
          if (flippedword.status == 0 || flippedword.status == 100){
            statusStr = '对方未读'
          } else if (flippedword.status == 200){
            statusStr = '对方已读'
          }
          flippedword.statusStr = statusStr
        }

        this.setData({
          flippedwordsData: flippedwordsData
        })
      }
    )
  },

  gotoDetail: function (event) {
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + event.currentTarget.dataset.flippedwordId
    })
  },
  
  onPullDownRefresh : function(){
    this.loadData()
  },

  onLoad: function (options) {
    // var that = this
    // app.getUserInfo(function (userInfo) {
    //   //更新数据
    //   console.log(userInfo)
    //   that.setData({
    //     userInfo: userInfo
    //   })
    // })
    // 页面初始化 options为页面跳转所带来的参数

    this.loadData()
  },

  // 点击tab项事件
  touchTab: function (event) {
    var tabIndex = parseInt(event.currentTarget.id);
    var template = "tab" + (tabIndex + 1).toString();

    this.setData({
      currentTab: template,
      highLightIndex: tabIndex.toString()
    })

    if (tabIndex == 0) {
      g_tab = 0;
    } else if (tabIndex == 1) {
      g_tab = 1;
    }
    this.loadData()
  },

  // 新建日记
  touchAdd: function (event) {
    wx.navigateTo({
      url: "../post/post"
    });
  },
  feedback:function(e){
    wx.navigateTo({
      url: '../feedback/feedback',
    })
  }
})
