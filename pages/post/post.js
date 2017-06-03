var util = require('../../utils/util')
const postflippedwords = require('../../config').postflippedwords
const uploadFileUrl = require('../../config').uploadFileUrl
const signUlr = require('../../config').signUlr
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
    video: "",
    buttonEnable:true
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
      phone: e.detail.value
    })
  },
  onTextInput: function (e) {
    this.setData({
      text: e.detail.value
    })
  },
  onSendData: function () {
    wx.showToast({
      title: '发送中》。',
      icon:'loading'
    })
    var that = this;
    this.setData({
      buttonEnable:false
    })
    let data = {}
    data.sendto = this.data.phone
    data.contents = []
    let textContent = {}
    textContent.type = "text"
    textContent.text = this.data.text
    textContent.link = ""
    data.contents.push(textContent)

    if (this.data.image && this.data.image != ""){
      let imageContent = {}
      imageContent.type = "picture"
      imageContent.text = this.data.image
      data.contents.push(imageContent)
    }
    if (this.data.video && this.data.video != ""){
      let videoContent = {}
      videoContent.type = "video"
      videoContent.text = this.data.video
      data.contents.push(videoContent)
    }

    data.lat = parseFloat(this.data.location.lat)
    data.lng = parseFloat(this.data.location.lng)
    util.postRequestWithRereshToken(postflippedwords, data).then(
      res => {
        console.log(res)
        wx.showModal({
          title: '发送成功',
          content: '返回id是 【' + res.data.id + '】',
          showCancel: false
        })
      }
    ).catch(function (res) {
      wx.showToast({
        title: '发布失败',
        icon: 'loading'
      })
    }).finally(res => {
      that.setData({
        buttonEnable: true
      })
      wx.hideToast();
    })
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
  chooseImage: function () {
    var that = this
    util.chooseImage(1).then(res => {
      that.setData(
        {
          filePath: res.tempFilePaths[0],
        }
      )
      if (wx.getStorageSync('signUrl') === '') {
        return util.getRequestWithRefreshToken(signUlr, 'page/post/post')
      } else {
        return util.getStorage('signUrl')
      }
    }).catch(res => {
      //放弃选择
    }).then(res => {
      console.log(res)
      var userKey = wx.getStorageSync("username");
      var fileName = userKey + new Date().getTime()
      var sign = ""
      if (res.data.sig) {
        sign = res.data.sig
        wx.setStorageSync('signUrl', sign)
      } else {
        sign = res.data
      }
      return util.uploadFile(sign, that.data.filePath, fileName)
    }).catch(res => {
      //上传失败
      console.log(res)
    }).then(res => {
      console.log(res)
      var data = JSON.parse(res.data)
      if (data.code == 0) {//成功了
        wx.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 1000
        })
        that.setData({
          image: data.data.access_url
        })
      } else {
        //这里出现了错误，可能是签名过期了
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'loading',
          duration: 3000
        })
        util.util.getRequestWithRefreshToken(signUlr, 'page/post/post')
      }
    })
  },
  chooseVideo: function () {
    var that = this
    util.chooseVideo(30).then(res => {
      that.setData(
        {
          filePath: res.tempFilePath,
        }
      )
      if (wx.getStorageSync('signUrl') === ''){
        return util.getRequestWithRefreshToken(signUlr, 'page/post/post')
      }else{
        return util.getStorage('signUrl')
      }
      
      
    }).catch(res => {
      //放弃选择
    }).then(res => {
      console.log(res)
      var userKey = wx.getStorageSync("username");
      var fileName = userKey + new Date().getTime()
      var sign = ""
      if (res.data.sig){
        sign = res.data.sig
        wx.setStorageSync('signUrl', sign)
      }else{
        sign = res.data
      }
      return util.uploadFile(sign, that.data.filePath, fileName)
    }).catch(res => {
      //签名获取失败了
      console.log(res)
    }).then(res => {
      console.log(res)
      var data = JSON.parse(res.data)
      if (data.code == 0){//成功了
        wx.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 1000
        })
        that.setData({
          video: data.data.access_url
        })
      }else{
        //这里出现了错误，可能是签名过期了
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'loading',
          duration: 3000
        })
        util.util.getRequestWithRefreshToken(signUlr, 'page/post/post')
      }
    })
  }
})