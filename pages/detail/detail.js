// detail.js
var g_flippedword;

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },
  audioError: function (e) {
    console.log(e)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.audioCtx = wx.createAudioContext('myAudio')
    var data = options.data;
    var flippedword = JSON.parse(data);
    g_flippedword = flippedword
    this.setData({
      flippedword: flippedword,
      animateStatus: 'stopanimate'
    })

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
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  imagePreview: function (event) {
    var url = event.currentTarget.dataset.url
    wx.previewImage({
      urls: [url]
    })
  },

  play: function (event) {
    this.setData({
      animateStatus: ''
    })

    var flippedword = g_flippedword

    var i = 0
    var that = this
    for (i; i < flippedword.contents.length; i++) {
      var content = flippedword.contents[i]
      if (content.type == 'audio') {
        let j = i
        if (flippedword.contents[j].text.startsWith('wxfile:')) {
          wx.playVoice({
            filePath: flippedword.contents[j].text
          })
        } else {
          flippedword.contents[j].text = flippedword.contents[j].text.replace(/http/, "https")
          wx.downloadFile({
            url: flippedword.contents[j].text,
            success: function (res) {
              wx.playVoice({
                filePath: res.tempFilePath
              })

              flippedword.contents[j].text = res.tempFilePath

            }
          })
        }
      }
    }
  }
})