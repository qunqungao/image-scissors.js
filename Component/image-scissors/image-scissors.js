// pages/scissors/scissors.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        // 接收图片路径
        set_image_url: {
            type: String
        },
        // 接收裁剪框形状
        set_mask_form: {
            type: Number,
            value: 1,
        },
        // 接收裁剪框宽度
        set_mask_width: {
            type: Number,
        },
        // 接收裁剪框高度
        set_mask_height: {
            type: Number
        },
        // 是否锁定裁剪框宽高
        set_mask_shift:{
            type:Boolean
        },
        // 接收裁剪框直径
        set_mask_diameter: {
            type: Number
        }
    },
    /**
     * 监听数据变化
     */
    observers: {
        'set_mask_shift'(event) {
            this.data.mask_shift = event;
        },  
        'set_mask_diameter'(event) {
            if(event < this.data._mask_min_diameter){
                this.properties.set_mask_diameter = this.data._mask_min_diameter
            }
            if(this.data._screenScale > 0){
                this.set_mask_scale()
            }
        },  
        'set_mask_width'(event) {
            if(event < this.data._mask_min_width){
                this.properties.set_mask_width = this.data._mask_min_width
            }
            if(this.data._screenScale > 0){
                this.set_mask_scale()
            }
        },
        'set_mask_height'(event) {
            if(event < this.data._mask_min_height){
                this.properties.set_mask_height = this.data._mask_min_height
            }
            if(this.data._screenScale > 0){
                this.set_mask_scale()
            }
        },
        'set_mask_form'(event) {
            this.setData({_mask_form: event})
            if(this.data._screenScale > 0){
                this.set_mask_scale()
            }
        },
        'set_image_url'(event) {
            this.setData({ IMAGE_SRC: event })
            this.data.IMAGE_OBJECT.src = event;
        },
        'canvas_scissors.create_status'(event) {
            this.data.IMAGE_OBJECT = this.data.canvas_scissors.canvas.createImage();//创建img对象
            this.data.IMAGE_OBJECT.src = this.data.IMAGE_SRC;
            // this.data.IMAGE_OBJECT.onload = () => {console.log("img对象加载完成")}
        },
    },
    /**
     * 组件的初始数据
     */
    data: {
        IMAGE_SRC: "", // 图片路径
        IMAGE_OBJECT:{}, //图片对象
        WINDOW_WIDTH: 0, // 设备屏幕宽度
        WINDOW_HEIGHT: 0, // 设备屏幕高度
        _INIT_IMAGE_WIDTH: 0, // 图片初始宽度
        _INIT_IMAGE_HEIGHT: 0, // 图片初始高度
        MOVE_THROTTLE_FLAG: true, // 安卓触摸节流
        MOVE_THROTTLE: null, // 触摸截流延迟器
        mask_shift:null, //是否禁止蒙版移动
        _screenScale: 0, // 屏幕宽度比例的百分之75
        info: null, // 设备信息
        _origin_scale: 1, // 图片原始比例
        current_scale: 1, // 图片当前比例
        min_scaling: 1, // 图片最小缩放比例
        image_left: 0, // 图片X轴距离
        image_top: 0, // 图片Y轴距离
        image_width: 0, // 图片宽度
        image_height: 0, // 图片高度
        _image_rotate: 0, // 图片旋转角度
        _image_scale: 1, // 图片缩放比例
        touchstart_finger_left: 0, // touchStart时手指所在的X坐标
        touchstart_finger_top: 0, // touchStart时手指所在的Y坐标
        touchstart_img_left: 0, // touchStart时图片所在的X坐标
        touchstart_img_top: 0, // touchStart时图片所在的Y坐标
        touch_move_switch: false, // 触摸开关，用于防止双指移动时，会触发两次离开事件
        canvas_scissors: { // 裁剪层画布
          id: 'canvas_scissors',
          canvas: null,
          context: null,
          create_status: false
        },
         _transition_time: 0, // 控制css动画持续时间
        _border_left: 0, // 裁剪框左边距
        _border_top: 0, // 裁剪框上边距
        _border_right: 0, // 裁剪框右边距
        _border_bottom: 0, // 裁剪框下边距
        _mask_width: 0, // 裁剪框宽度
        _mask_height: 0, // 裁剪框高度
        _mask_min_width: 100, // 裁剪框最小宽度
        _mask_min_height: 100, // 裁剪框最小高度,
        _mask_min_diameter:100, // 裁剪框最小直径,
        _border_click_location: 0, //判断裁剪框点击区域是否在四个角
        mask_reset_settime: null, // 蒙版归位方法里的延迟器
        _rotation_angle: 0, // 当前图片的旋转真实角度
        touch_gap_left:0, // 点击区域和裁剪框四个角的X轴间隙
        touch_gap_top:0, // 点击区域和裁剪框四个角的Y轴间隙
        _mask_pellucidity:0.6 // 蒙版透明度
    },
    /**
     * 页面初次渲染完成
     */
    ready() {
        // 获取系统信息
        wx.getSystemInfo({
            success: event => {
                // 获取可使用窗口宽度
                let _clientHeight = event.windowHeight;
                // 获取可使用窗口高度
                let _clientWidth = event.windowWidth;
                // 设置蒙版边框
                this.setData({
                    WINDOW_WIDTH: _clientWidth,
                    WINDOW_HEIGHT: _clientHeight,
                    info: event,
                    _screenScale: (_clientWidth / 100) * 75
                });
                //适应蒙版居中
                this.set_mask_scale()
            }
        });
        // 创建画布
        this.create_canvas(this.data.canvas_scissors)
    },
    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 手指点击事件
         */
        handler_touchStart(event) {
            if (event.touches.length == 1) {
                this.data.touchstart_finger_left = event.touches[0].clientX;
                this.data.touchstart_finger_top = event.touches[0].clientY;
                this.data.touchstart_img_left = this.data.image_left;
                this.data.touchstart_img_top = this.data.image_top;
                this.data.touchstart_finger_arr = null
                // 判断点击区域是不是在裁剪框四个角的周围
                this._border_click_range(event);
            } else if (event.touches.length == 2) {
                this.data.touchstart_finger_arr = event.touches;
                this.data.touchstart_img_left = this.data.image_left;
                this.data.touchstart_img_top = this.data.image_top;
                this.data._origin_scale = this.data.current_scale;
            };
            //修改蒙版透明度
            this._set_mask_pellucidity('start')
            this.data.touch_move_switch = true;
        },
        /**
         * 手指移动事件
         */
        handler_touchMove(event) {
          // 如果_border_click_range()方法判断，初始点击区域在裁剪框的四个角落，
          // 就只移动蒙版，禁止移动图片
            if (this.data._border_click_location != 0) {
                // 修改蒙版参数
                this._move_mask_border(event);
                return
            }
            // 双指移动后离开时，会造成移动事件handlerTouchMove()触发两次
            //  这里用touch_move_switch 来让 移动事件每次只触发一遍
            if (!this.data.touch_move_switch) { return; }
            if (this.data.MOVE_THROTTLE_FLAG) {
                // 安卓截流，防止touchmove执行速度过快
                this._move_throttle()
                if (event.touches.length == 1) {
                    let _move_left = event.touches[0].clientX - (this.data.touchstart_finger_left - this.data.touchstart_img_left);
                    let _move_top = event.touches[0].clientY - (this.data.touchstart_finger_top - this.data.touchstart_img_top);
                    this.setData({
                        image_left: _move_left,
                        image_top: _move_top,
                    })
                } else if (event.touches.length == 2) {
                    let _now_finger_coordinate = event.touches;
                    //得到缩放比例， getDistance 是勾股定理的一个方法
                    let _scale = this.get_distance(_now_finger_coordinate[0], _now_finger_coordinate[1]) / this.get_distance(this.data.touchstart_finger_arr[0], this.data.touchstart_finger_arr[1]);
                    let _new_scale = this.data._origin_scale * _scale;
                    // 根据裁剪框大小，改变图片最小缩放值，防止图片小于裁剪框的宽高
                    let image_wh = this._get_image_scope()
                    if (image_wh._img_height < this.data._mask_height) {
                        this.data.min_scaling = this.data._mask_height / image_wh._img_height
                    } else if (image_wh._img_width < this.data._mask_width) {
                        this.data.min_scaling = this.data._mask_width / image_wh._img_width
                    } else {
                        this.data.min_scaling = 1
                    }
                    // 图片缩小的极限倍数不能小于 this.data.min_scaling
                    if (_new_scale < this.data.min_scaling) {
                        _new_scale = this.data.min_scaling;
                    };
                    this.setData({
                        _image_scale: _new_scale
                    })
                    // 记住使用的缩放值
                    this.data.current_scale = _new_scale;
                }
            }
        },
        /**
         * 手指松开事件
         */
        handler_touchEnd() {
            this.data.touchstart_img_left = this.data.image_left;
            this.data.touchstart_img_top = this.data.image_top;
            this.data.touch_move_switch = false;
            // 判断图片是否超出了蒙版边界
            this.mask_range_constraint('end');
            // 蒙版中心归位
            this.mask_reset();
            //修改蒙版透明度
            this._set_mask_pellucidity('end')
        },
        /**
         * 获取当前图片翻转后的视觉宽高
         */
        _get_image_scope() {
            let _img_width
            let _img_height
            if (this.data._rotation_angle == 0 || this.data._rotation_angle == 180) {
                _img_width = this.data.image_width
                _img_height = this.data.image_height
            } else if (this.data._rotation_angle == 90 || this.data._rotation_angle == 270) {
                _img_height = this.data.image_width
                _img_width = this.data.image_height
            }
            return {
                _img_width,
                _img_height
            }
        },
        /**
         * 图片旋转事件
         */
        handler_img_rotate() {
            this.data._rotation_angle = this.data._rotation_angle == 270 ? 0 : this.data._rotation_angle + 90;
            // 判断图片是否超出了蒙版边界
            this.mask_range_constraint('rotate')
            // 控制css过渡动画
            this._set_time_out(0.4)
            this.setData({
                _image_rotate: this.data._image_rotate + 90
            })
        },
        /**
         * 判断图片是否超出裁剪框边界
         */
        mask_range_constraint(str) {
            let _img_width = this._get_image_scope()._img_width * this.data._image_scale
            let _img_height = this._get_image_scope()._img_height * this.data._image_scale
            let _cross_border = [
                {
                  tips: "宽",
                  count: this.data._mask_width - _img_width,
                  execute_function: () => {
                      let _width_value = (_img_width + _cross_border[0].count) * this.data._image_scale
                      this.setData({
                          _image_scale: _width_value / _img_width,
                      })
                  }
                },
                {
                  tips: "高",
                  count: this.data._mask_height - _img_height,
                  execute_function: () => {
                      let _height_value = (_img_height + _cross_border[1].count) * this.data._image_scale
                      this.setData({
                          _image_scale: _height_value / _img_height,
                      })
                  }
                },
                {
                  tips: "上",
                  count: (this.get_image_center()._center_top - (_img_height / 2)) - this.data._border_top,
                  execute_function: () => {
                      this.setData({
                          image_top: this.data.image_top - _cross_border[2].count
                      })
                  }
                },
                {
                  tips: "左",
                  count: (this.get_image_center()._center_left - (_img_width / 2)) - this.data._border_left,
                  execute_function: () => {
                      this.setData({
                          image_left: this.data.image_left - _cross_border[3].count
                      })
                  }
                },
                {
                  tips: "右",
                  count: this.data._border_left + this.data._mask_width - (this.get_image_center()._center_left + (_img_width / 2)),
                  execute_function: () => {
                      this.setData({
                          image_left: this.data.image_left + _cross_border[4].count
                      })
                  }
                },
                {
                  tips: "下",
                  count: this.data._border_top + this.data._mask_height - (this.get_image_center()._center_top + (_img_height / 2)),
                  execute_function: () => {
                      this.setData({
                          image_top: this.data.image_top + _cross_border[5].count
                      })
                  }
                },
            ];
            for (let i = 0; i < _cross_border.length; i++) {
                if (_cross_border[i].count > 0) {
                    if (str == 'move') {
                        _cross_border[i].execute_function();
                    } else if (str == 'end' ) {
                        this._set_time_out(0.4)
                        _cross_border[i].execute_function();
                    } else if (str == 'rotate') {
                        this._set_time_out(0.4)
                        if (_cross_border[i].tips == '高' || _cross_border[i].tips == '宽') {
                            let _center_offset_left = this.get_image_center()._center_left - (this.data.WINDOW_WIDTH / 2)
                            let _center_offset_top = this.get_image_center()._center_top - (this.data.WINDOW_HEIGHT / 2)
                            _cross_border[i].execute_function();
                            this.setData({
                                image_top: this.data.image_top - _center_offset_top,
                                image_left: this.data.image_left - _center_offset_left
                            })
                            break;
                        } else {
                            _cross_border[i].execute_function();
                        }
                    }
                };
            };
        },
        /**
         * 图片加载成功函数
         */
        loading_image(event) {
            let _get_shape = event.detail.width - event.detail.height <= 0 ? true : false;
            // 图片初始宽度
            let _init_image_width = _get_shape ? this.data._screenScale : event.detail.width / (event.detail.height / this.data._screenScale);
            // 图片初始高度
            let _init_image_height = _get_shape ? event.detail.height / (event.detail.width / this.data._screenScale) : this.data._screenScale;
            // 设置图片初始宽高与初始图片边距
            this.setData({
                image_width: _init_image_width,
                image_height: _init_image_height,
                _INIT_IMAGE_WIDTH: _init_image_width,
                _INIT_IMAGE_HEIGHT: _init_image_height,
                image_left: (this.data.WINDOW_WIDTH - _init_image_width) / 2,
                image_top: (this.data.WINDOW_HEIGHT - _init_image_height) / 2,
            })
        },
        /**
         * 裁剪框移动后自动居中
         */
        mask_reset() {
            if (this.data._border_click_location > 0 && this.data._border_click_location < 5) {
                let center_top = (this.data.WINDOW_HEIGHT - this.data._mask_height) / 2
                let center_left = (this.data.WINDOW_WIDTH - this.data._mask_width) / 2
                let gap_left = center_left - this.data._border_left
                let gap_right = center_left - this.data._border_right 
                let gap_top = center_top - this.data._border_top 
                let gap_bottom = center_top - this.data._border_bottom 
                  clearTimeout(this.data.mask_reset_settime);
                  this.data.mask_reset_settime = setTimeout(() => {
                      this._set_time_out(0.4)
                      this.setData({
                          _border_left : this.data._border_left + gap_left,
                          _border_right : this.data._border_right + gap_right,
                          _border_top : this.data._border_top + gap_top,
                          _border_bottom : this.data._border_bottom + gap_bottom,
                          image_left: this.data.image_left + gap_left,
                          image_top: this.data.image_top + gap_top
                      })
                }, 500)
            }
        },
        /**
         * 初始化组件时，适应遮罩层裁剪框的方法 
         */
        set_mask_scale() {
            let mask_width = 0,mask_height = 0
            if(this.properties.set_mask_form == 1){
                if (this.properties.set_mask_width > this.data._screenScale) {
                    let ratio = this.properties.set_mask_width / this.data._screenScale;
                    mask_width = this.data._screenScale
                    mask_height = this.properties.set_mask_height / ratio;
                } else if (this.properties.set_mask_height > this.data._screenScale) {
                    let ratio = this.properties.set_mask_height / this.data._screenScale;
                    mask_height = this.data._screenScale
                    mask_width = this.properties.set_mask_width / ratio;
                } else {
                    mask_width = this.properties.set_mask_width
                    mask_height = this.properties.set_mask_height
                }
            }else if(this.properties.set_mask_form == 2){
                if(this.properties.set_mask_diameter > this.data._screenScale){
                    mask_width = this.data._screenScale
                    mask_height = this.data._screenScale
                }else{
                    mask_width = this.properties.set_mask_diameter
                    mask_height = this.properties.set_mask_diameter
                }
            }
            let _left_right = (this.data.WINDOW_WIDTH - mask_width) / 2;
            let _up_down = (this.data.WINDOW_HEIGHT - mask_height) / 2;
            this.setData({
                _mask_width : mask_width,
                _mask_height : mask_height,
                _border_top : _up_down,
                _border_left : _left_right,
                _border_right : _left_right,
                _border_bottom : _up_down
            })
        },
        /**
         * 移动裁剪框
         */
        _move_mask_border(event) {
            //_mask_max_scope() 限制了裁剪框的最大范围
            let _now_finger_coordinate = this._mask_max_scope(event)
            let _remove_left = 0 , _remove_top = 0 , _remove_right = 0, _remove_bottom = 0 ,_mask_width = 0,_mask_height = 0
            switch (this.data._border_click_location) {
                case 1:
                    _remove_left = this.data._border_left - _now_finger_coordinate[0].clientX
                    _remove_top = this.data._border_top - _now_finger_coordinate[0].clientY
                    _mask_width = this.data._mask_width + _remove_left,
                    _mask_height = this.data._mask_height + _remove_top
                  break;
                case 2:
                    _remove_right = (this.data._border_left + this.data._mask_width) - _now_finger_coordinate[0].clientX
                    _remove_top = this.data._border_top - _now_finger_coordinate[0].clientY
                    _mask_width = this.data._mask_width - _remove_right
                    _mask_height = this.data._mask_height + _remove_top
                  break;
                case 3:
                    _remove_left = this.data._border_left - _now_finger_coordinate[0].clientX
                    _remove_bottom = (this.data._border_top + this.data._mask_height) - _now_finger_coordinate[0].clientY
                    _mask_width = this.data._mask_width + _remove_left
                    _mask_height = this.data._mask_height - _remove_bottom
                  break;
                case 4:
                    _remove_right = (this.data._border_left + this.data._mask_width) - _now_finger_coordinate[0].clientX
                    _remove_bottom = (this.data._border_top + this.data._mask_height) - _now_finger_coordinate[0].clientY
                    _mask_width = this.data._mask_width - _remove_right
                    _mask_height = this.data._mask_height - _remove_bottom
                  break;
            }
            // 限制裁剪框部分最小宽度
            if(_mask_width < this.data._mask_min_width){
                let gap = this.data._mask_min_width - _mask_width
                if( _remove_left != 0 ) _remove_left = _remove_left + gap
                if( _remove_right != 0 ) _remove_right = _remove_right - gap
                _mask_width = this.data._mask_min_width
            }
             // 限制裁剪框部分最小高度
            if(_mask_height < this.data._mask_min_height){
                let gap = this.data._mask_min_height - _mask_height
                if( _remove_top != 0 ) _remove_top = _remove_top + gap
                if( _remove_bottom != 0 ) _remove_bottom = _remove_bottom - gap
                _mask_height = this.data._mask_min_height
            }
            this.setData({
                _border_left : this.data._border_left - _remove_left,
                _border_right : this.data._border_right + _remove_right,
                _border_top : this.data._border_top - _remove_top,
                _border_bottom : this.data._border_bottom + _remove_bottom,
                _mask_height:_mask_height,
                _mask_width:_mask_width
            })
            // 判断图片是否超出裁剪框边界
            this.mask_range_constraint('move')
        },
        /**
         * 触摸节流 
         */
        _move_throttle() {
            //安卓需要节流
            if (this.data.info.platform == 'android') {
                this.data.MOVE_THROTTLE_FLAG = false
                // android
                clearTimeout(this.data.MOVE_THROTTLE);
                this.data.MOVE_THROTTLE = setTimeout(() => {
                    this.data.MOVE_THROTTLE_FLAG = true
                }, 25)
            } else {
                this.data.MOVE_THROTTLE_FLAG = true
            }
        },
        /**
         * 手指按下和抬起时修改蒙版透明度
         */
        _set_mask_pellucidity(str){
            if(str == 'start'){
                  this.setData({
                      _mask_pellucidity:0.4
                  })
            }else if(str == 'end'){

                  this.setData({
                      _mask_pellucidity:0.6
                  })
            }
        },
        /**
         * 蒙版裁剪框最大范围 
         */
        _mask_max_scope(event) {
            let _now_finger_coordinate = event
            if(this.properties.set_mask_form == 1){
                let _border_width = this.data.WINDOW_WIDTH / 100 * 10
                let _border_height = this.data.WINDOW_HEIGHT / 100 * 10
                // 限制裁剪框最大值
                if (event.touches[0].clientX < _border_width) {
                    _now_finger_coordinate.touches[0].clientX = event.touches[0].clientX + (_border_width - event.touches[0].clientX)
                }
                if (event.touches[0].clientY < _border_height) {
                    _now_finger_coordinate.touches[0].clientY = event.touches[0].clientY + (_border_height - event.touches[0].clientY)
                }
                if (this.data.WINDOW_WIDTH - event.touches[0].clientX < _border_width) {
                    _now_finger_coordinate.touches[0].clientX = event.touches[0].clientX - (_border_width - (this.data.WINDOW_WIDTH - event.touches[0].clientX))
                }
                if (this.data.WINDOW_HEIGHT - event.touches[0].clientY < _border_height) {
                    _now_finger_coordinate.touches[0].clientY = event.touches[0].clientY - (_border_height - (this.data.WINDOW_HEIGHT - event.touches[0].clientY))
                }
                // 点击裁剪框四个角时，点击位置和实际边界有些余量
                // 这里将余量加了进去，体验会更好
                _now_finger_coordinate.touches[0].clientX = _now_finger_coordinate.touches[0].clientX - this.data.touch_gap_left;
                _now_finger_coordinate.touches[0].clientY = _now_finger_coordinate.touches[0].clientY - this.data.touch_gap_top;
            }
            return _now_finger_coordinate.touches
        },
        /**
         * 判断点击的位置是不是在裁剪框，四个角的周围 
         */
        _border_click_range(event) {
            this.data._border_click_location = 0
            if(this.data.mask_shift) return
            if(this.properties.set_mask_form == 1){
                let lineWidth = this.data.WINDOW_WIDTH / 30
                let _corner_arr = [
                    {
                        _left: this.data._border_left,
                        _top: this.data._border_top,
                        _sign: 1
                    },
                    {
                        _left: this.data._border_left + this.data._mask_width,
                        _top: this.data._border_top,
                        _sign: 2
                    },
                    {
                        _left: this.data._border_left,
                        _top: this.data._border_top + this.data._mask_height,
                        _sign: 3
                    },
                    {
                        _left: this.data._border_left + this.data._mask_width,
                        _top: this.data._border_top + this.data._mask_height,
                        _sign: 4
                    },
                ]
                for (let i = 0; i < _corner_arr.length; i++) {
                    if (event.touches[0].clientX < _corner_arr[i]._left + lineWidth &&
                      event.touches[0].clientX > _corner_arr[i]._left - lineWidth &&
                      event.touches[0].clientY < _corner_arr[i]._top + lineWidth &&
                      event.touches[0].clientY > _corner_arr[i]._top - lineWidth) {
                          this.data._border_click_location = _corner_arr[i]._sign;
                          this.data.touch_gap_left = event.touches[0].clientX - _corner_arr[i]._left
                          this.data.touch_gap_top = event.touches[0].clientY - _corner_arr[i]._top
                        break
                    } else {
                        this.data._border_click_location = 0
                    }
                }
            }
        },
        /**
         * 创建画布
         */
        create_canvas(_canvas_obj) {
            const query = wx.createSelectorQuery().in(this)
            query.select('#' + _canvas_obj.id)
                .fields({ node: true, size: true })
                .exec((res) => {
                    const _canvas = res[0].node
                    const _ctx = _canvas.getContext('2d')
                    let keyName = _canvas_obj.id + '.create_status'
                    _canvas.width = res[0].width * this.data.info.pixelRatio
                    _canvas.height = res[0].height * this.data.info.pixelRatio
                    _ctx.scale(this.data.info.pixelRatio, this.data.info.pixelRatio)
                    _canvas_obj.canvas = _canvas,
                        _canvas_obj.context = _ctx
                    this.setData({ [keyName]: true })
                })
        },
        /**
         * 获取当前图片中心点
         */
        get_image_center() {
            let _scale_width = this.data.image_width * this.data._image_scale
            let _scale_height = this.data.image_height * this.data._image_scale
            let _scale_width_halve = (_scale_width - this.data.image_width) / 2
            let _scale_height_halve = (_scale_height - this.data.image_height) / 2
            let _center_offset_left = (this.data.image_left - _scale_width_halve) + (_scale_width / 2)
            let _center_offset_top = (this.data.image_top - _scale_height_halve) + (_scale_height / 2)
            return {
                _center_top: _center_offset_top,
                _center_left: _center_offset_left
            }
        },
        /**
         * 延迟器控制css动画
         */
        _set_time_out(time) {
            let set_time
            this.setData({ _transition_time: time })
            clearTimeout(set_time);
            set_time = setTimeout(() => {
                this.setData({ _transition_time: 0 })
            }, time * 1000)
        },
        /**
         * 计算双指移动时的图片缩放比例
         */
        get_distance(p1, p2) {
            let x = p2.clientX - p1.clientX,
                y = p2.clientY - p1.clientY;
            return Math.sqrt(x * x + y * y);
        },
        /**
         * 将图片画在画布上，为裁剪图片做准备
         */
        draw_image(){
            let centre_left = this.get_image_center()._center_left;
            let centre_top = this.get_image_center()._center_top;
            if(this.data._rotation_angle != 0) this.data.canvas_scissors.context.save()
            let X = this.get_image_center()._center_left - ((this.data.image_width * this.data._image_scale)/2)
            let Y = this.get_image_center()._center_top - ((this.data.image_height * this.data._image_scale)/2)
            if(this.data._rotation_angle != 0){
                this.data.canvas_scissors.context.translate(centre_left, centre_top);
                this.data.canvas_scissors.context.rotate(this.data._rotation_angle * Math.PI / 180);
                this.data.canvas_scissors.context.translate(-centre_left, -centre_top);
            }
            this.data.canvas_scissors.context.drawImage(this.data.IMAGE_OBJECT,X ,Y, this.data.image_width * this.data._image_scale, this.data.image_height * this.data._image_scale);
            if(this.data._rotation_angle != 0) this.data.canvas_scissors.context.restore()
        },
        /**
         * 裁剪图片
         */
        handler_img_shear(){
            this.data.canvas_scissors.context.clearRect(0,0, this.data.WINDOW_WIDTH,  this.data.WINDOW_HEIGHT);
            if(this.properties.set_mask_form == 1){
                this.draw_image()
            }else if(this.properties.set_mask_form == 2){
                // arc(x, y, r, s, e, counterclockwise)
                // x,y：圆心
                // r：圆的半径
                // s：起始弧度 (0)
                // e：终止弧度 (1.5 * Math.PI)
                // counterclockwise：弧度的方向是否是逆时针
                this.data.canvas_scissors.context.save();
                this.data.canvas_scissors.context.arc( this.data.WINDOW_WIDTH/2  , this.data.WINDOW_HEIGHT/2 , this.data._mask_width / 2, 0, 2 * Math.PI,false); 
                this.data.canvas_scissors.context.clip(); //剪切形状
                this.draw_image()
                this.data.canvas_scissors.context.restore(); //恢复之前保存的绘图上下文 恢复之前保存的绘图上下午即状态 可以继续绘制
            };
            wx.canvasToTempFilePath({
                x:this.data._border_left,
                y:this.data._border_top,
                width:this.data._mask_width,
                height: this.data._mask_height,
                destWidth: this.data._mask_width * this.data.info.pixelRatio,
                destHeight: this.data._mask_height * this.data.info.pixelRatio,
                canvas: this.data.canvas_scissors.canvas,
                quality: 1, 
                success: res => {
                    this.triggerEvent('shear_image', {
                      url: res.tempFilePath,
                    });
                },
                fail: res => {
                    console.log(res);
                }
            });
        }
    }
    
})
