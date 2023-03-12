# image-scissors.js

### 初始准备
#### 1.json文件中添加image-scissors
```
"usingComponents": {
    "image-scissors":"../../Component/image-scissors/image-scissors"
  },

```
#### 2.wxml文件
```
  <image-scissors id="scissors" bind:shear_image="get_shear_image" set_mask_form="{{set_scissors.shape}}" set_mask_width="{{set_scissors.width}}" set_mask_height="{{set_scissors.height}}" set_image_url="{{set_scissors.url}}" set_mask_diameter="{{set_scissors.diameter}}" set_mask_shift="{{set_scissors.move}}"></image-scissors>

```
#### 3.简单示例
```
Page({

  /**
   * 页面的初始数据
   */
  data: {
    set_scissors:{
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
  click_img_rotate(){
      // 图片旋转
      this.scissors_data.handler_img_rotate()
  },
  click_img_shear(){
      wx.showLoading({
        title: '截取中',
      })
        // 图片截取
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
})

```

```
 // 有些操作，比如动态修改裁剪框宽高后，可能会让图片超出裁剪框边界，这时可以直接调用此函数可以让图片自动归位
  this.scissors_data.mask_range_constraint('end')
```
     
      // 

### 参数
参数|类型|是否必填|说明
--|:--:|--:|--:|
set_image_url|String|是|图片地址(如果是网络图片需配置安全域名)
set_mask_form|Number|否|裁剪框形状(1为矩形，2为圆形，其他无效)
set_mask_width|Number|否|裁剪框宽度（set_mask_form = 1 时生效）
set_mask_height|Number|否|裁剪框高度（set_mask_form = 1 时生效）
set_mask_diameter|Number|否|裁剪框直径（set_mask_form = 2 时生效）
set_mask_shift|boolean|否|是否锁定裁剪框宽高



- 邮箱: 1033279566@qq.com

---
