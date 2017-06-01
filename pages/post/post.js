var util = require('../../utils/util')
const postflippedwords = require('../../config').postflippedwords
// new.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasLocation: false,
    phone: "",
    text: "",
    image: "",
    video: ""
  },
  getLocation: function () {
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
  onPhoneInput: function (e) {
    this.setData({
      phone:e.detail.value
    })
  },
  onTextInput: function (e) {
    this.setData({
      text:e.detail.value
    })
  },
  onSendData:function(){
    let data = {}
    data.sendto = this.data.phone + ""
    data.contents = []
    let textContent = {}
    textContent.type = "text"
    textContent.text = this.data.text
    textContent.link = ""
    data.contents.push(textContent)
    data.lat = parseFloat(this.data.location.lat)
    data.lng = parseFloat(this.data.location.lng)
    util.postRequestWithRereshToken(postflippedwords,data ).then(
      res => {
        console.log(res)
        wx.showModal({
          title: '请求成功',
          content: res.data,
          showCancel: false
        })
      }
    )
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getLocation()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
})