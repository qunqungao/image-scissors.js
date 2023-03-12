// pages/scissors_page/scissors_page.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    items: [
      {value: 1, name: '矩形' , checked: 'true'},
      {value: 2, name: '圆形'},
    ],
    set_scissors:{
      //https://hbimg.b0.upaiyun.com/e079f9a90508a7464e048dc834252d9acc553bb120b1d-9cShqA_fw658
      url:"",
      width:"210",
      height:"210",
      shape:1,
      diameter:"200",
      move:false
    },
    scissors_data:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      this.setData({
          'set_scissors.url':options.url
      })
      this.scissors_data = this.selectComponent("#scissors")
  },
  switch_change(event){
      this.setData({
          'set_scissors.move':event.detail.value
      })
  },
  radio_change(e) {
      this.setData({
          'set_scissors.shape': e.detail.value
      })
      // 判断图片是否超出裁剪框边界
      this.scissors_data.mask_range_constraint('end')
  },
  input_mask_diameter(event){
      this.setData({
          'set_scissors.diameter':event.detail.value
      })
  },
  input_mask_width(event){
      this.setData({
          'set_scissors.width':event.detail.value
      })
      // 判断图片是否超出裁剪框边界
      this.scissors_data.mask_range_constraint('end')
  },
  input_mask_height(event){
      this.setData({
          'set_scissors.height':event.detail.value
      })
      // 判断图片是否超出裁剪框边界
      this.scissors_data.mask_range_constraint('end')
  },
  click_img_rotate(){
      this.scissors_data.handler_img_rotate()
  },
  click_img_shear(){
      wx.showLoading({
        title: '截取中',
      })
      this.scissors_data.handler_img_shear()
  },
  get_shear_image(event){
      console.log(event.detail)
      wx.hideLoading()
      wx.previewImage({
        current: event.detail.url, // 当前显示图片的 http 链接
        urls: [ event.detail.url] // 需要预览的图片 http 链接列表
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