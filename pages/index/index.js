// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canvas_width:0,
    canvas_height:0,
    IMAGE_OBJECT:null,
    canvas_compress: { // 裁剪层画布
      id: 'canvas_compress',
      canvas: null,
      context: null,
      create_status: false
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      
  },
  click_img_select(){
      wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: ['album', 'camera'],
          success: img_res => {
            wx.navigateTo({
                url: '/pages/scissors_page/scissors_page?url='+ img_res.tempFiles[0].tempFilePath,
            })
          }
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})