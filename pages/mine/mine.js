var util = require('../../utils/util')
var users = require('../../config').users
// Page({
//   data: {
//     text: "Page mine"
//   },
//   onLoad: function (options) {
//     // 页面初始化 options为页面跳转所带来的参数
//     util.getRequestWithRefreshToken(users + "/1323131", "pages/mine/mine").then(
//       res => {
//         wx.showModal({
//           title: '请求成功',
//           content: res.data,
//           showCancel: false
//         })
//       }
//     )
//   },
//   onReady: function () {
//     // 页面渲染完成
//   },
//   onShow: function () {
//     // 页面显示
//   },
//   onHide: function () {
//     // 页面隐藏
//   },
//   onUnload: function () {
//     // 页面关闭
//   }
// })
// mine.js

// 自定义标签
var iconPath = "../../images/icons/"
var tabs = [
  {
    "icon": iconPath + "mark.png",
    "iconActive": iconPath + "markHL.png",
    "title": "心情",
    "extraStyle": "",
  },
  {
    "icon": iconPath + "collect.png",
    "iconActive": iconPath + "collectHL.png",
    "title": "收藏",
    "extraStyle": "",
  },
  {
    "icon": iconPath + "like.png",
    "iconActive": iconPath + "likeHL.png",
    "title": "喜欢",
    "extraStyle": "",
  },
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

    // 模态对话框样式 
    modalShowStyle: "",

    // 待新建的日记标题
    diaryTitle: "",

    // TODO 用户信息
    userInfo: {},
  },

  getLocation: function getLocation() {
    var that = this
    wx.getLocation({
      success: function (res) {
        console.log(res)
        that.setData({
          hasLocation: true,
          location: util.formatLocation(res.longitude, res.latitude)
        })
      }
    })
  },
  // 隐藏模态框
  hideModal() {
    this.setData({ modalShowStyle: "" });
  },

  // 清除日记标题
  clearTitle() {
    this.setData({ diaryTitle: "" });
  },

  onShow: function () {
    this.hideModal();
    this.clearTitle();
  },
  onLoad: function () {
    var that = this
    app.getUserInfo(function (userInfo) {
      //更新数据
      console.log(userInfo)
      that.setData({
        userInfo: userInfo
      })
    })
    // 页面初始化 options为页面跳转所带来的参数
    util.getRequestWithRefreshToken(users + "/1323131", "pages/mine/mine").then(
      res => {
        if (res.statusCode == 200){
          wx.showModal({
            title: '请求成功',
            content: res.data,
            showCancel: false
          })
        }else{

        }
      }
    )
    this.getLocation()
  },
 
  // 点击tab项事件
  touchTab: function (event) {
    var tabIndex = parseInt(event.currentTarget.id);
    var template = "tab" + (tabIndex + 1).toString();

    this.setData({
      currentTab: template,
      highLightIndex: tabIndex.toString()
    }
    );
  },

  // 点击新建日记按钮
  touchAdd: function (event) {
    this.setData({
      modalShowStyle: "opacity:1;pointer-events:auto;"
    })
  },

  // 新建日记
  touchAddNew: function (event) {
    this.hideModal();

    wx.navigateTo({
      url: "../new/new?title=" + this.data.diaryTitle,
    });
  },

  // 取消标题输入
  touchCancel: function (event) {
    this.hideModal();
    this.clearTitle();
  },

  // 标题输入事件
  titleInput: function (event) {
    this.setData({
      diaryTitle: event.detail.value,
    })
  }
})
