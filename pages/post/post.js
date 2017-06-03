var util = require('../../utils/util')
const postflippedwords = require('../../config').postflippedwords
var uploadFileUrl = "https://14592619.qcloud.la/upload"
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
    data.sendto = this.data.phone
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
          title: '发送成功',
          content: '返回id是 【' + res.data.id+'】',
          showCancel: false
        })
      }
    ).catch(function(res){
      console.log(res);
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
    var self = this

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: function (res) {
        console.log('chooseImage success, temp path is', res.tempFilePaths[0])

        var imageSrc = res.tempFilePaths[0]

        wx.uploadFile({
          url: uploadFileUrl,
          filePath: imageSrc,
          name: 'data',
          success: function (res) {
            console.log('uploadImage success, res is:', res)

            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 1000
            })

            self.setData({
              imageSrc
            })
          },
          fail: function ({errMsg}) {
            console.log('uploadImage fail, errMsg is', errMsg)
          }
        })

      },
      fail: function ({errMsg}) {
        console.log('chooseImage fail, err is', errMsg)
      }
    })
  },
  chooseVideo: function () {
    var self = this

    wx.chooseVideo({
      maxDuration:30,
      success: function (res) {
        console.log('chooseVideo success, temp path is', res.tempFilePath)

        var videoSrc = res.tempFilePath

        wx.uploadFile({
          url: uploadFileUrl,
          filePath: videoSrc,
          name: 'data',
          success: function (res) {
            console.log('uploadVideo success, res is:', res)

            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 1000
            })

            self.setData({
              videoSrc
            })
          },
          fail: function ({errMsg}) {
            console.log('uploadVideo fail, errMsg is', errMsg)
          }
        })

      },
      fail: function ({errMsg}) {
        console.log('chooseVideo fail, err is', errMsg)
      }
    })
  }
})