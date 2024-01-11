// pages/cart/cart.js
var util = require('../../utils/utils');
var api = require('../../config/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartGoods: [],
    cartTotal: {
        //从数据库获取得数据
        "goodsCount": 0,//某件商品数量
        "goodsAmount": 0.00,//某件商品总价格
        "checkedGoodsCount": 0,//选中商品总数量
        "checkedGoodsAmount": 0.00,//选中商品总价格
        "userId_test": '',
    },
    isEditCart: false,
    editCartList: [],
    isTouchMove: false,
    startX: 0, //开始坐标
    startY: 0,
    hasCartGoods: 0,//判断购物车是否有商品
    allSelect: false,
    goodsNum:'',
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getCart();
  },

    toIndexPage: function() {
      wx.switchTab({
          url: '/pages/index/index',
      });
    },

    

    /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getCart();
  },


  //开始触摸时 重置所有删除
    touchstart: function(e) {
        this.data.cartGoods.forEach(function(v, i) {
            if (v.isTouchMove) //只操作为true的
                v.isTouchMove = false;
        })
        this.setData({
            startX: e.changedTouches[0].clientX,
            startY: e.changedTouches[0].clientY,
            cartGoods: this.data.cartGoods
        })
    },
    //滑动事件处理
    touchmove: function(e) {
        var that = this,
            index = e.currentTarget.dataset.index, //当前索引
            startX = that.data.startX, //开始X坐标
            startY = that.data.startY, //开始Y坐标
            touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
            touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
            //获取滑动角度
            angle = that.angle({
                X: startX,
                Y: startY
            }, {
                X: touchMoveX,
                Y: touchMoveY
            });
        that.data.cartGoods.forEach(function(v, i) {
            v.isTouchMove = false
            //滑动超过30度角 return
            if (Math.abs(angle) > 30) return;
            if (i == index) {
                if (touchMoveX > startX) //右滑
                    v.isTouchMove = false
                else //左滑
                    v.isTouchMove = true
            }
            //console.log(index)
        })
        //更新数据
        that.setData({
            cartGoods: that.data.cartGoods
        })
    },
    /**
     * 计算滑动角度
     * @param {Object} start 起点坐标
     * @param {Object} end 终点坐标
     */
    angle: function(start, end) {
      var _X = end.X - start.X,
          _Y = end.Y - start.Y
      //返回角度 /Math.atan()返回数字的反正切值
      return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },

    //减少商品数量
    reduce: function(e) {
      const{id} =e.currentTarget.dataset;
      let {cartGoods} = this.data
      let index = cartGoods.findIndex(v=>v.shopcart_id===id)
      console.log(index);
      let cartItem = this.data.cartGoods[index];
      console.log(cartItem);
      if (cartItem.shopcart_amount - 1 == 0) {
          util.showErrorToast('删除左滑试试')
      }
      let shopcart_amount = (cartItem.shopcart_amount - 1 > 1) ? cartItem.shopcart_amount - 1 : 1;
      this.setData({
          cartGoods: this.data.cartGoods,
      });
      this.updateCart(index,shopcart_amount, cartItem.shopcart_id);
    },
    //增加商品数量
    increase: function(e) {
        const{id} =e.currentTarget.dataset;
        let {cartGoods} = this.data
        let index = cartGoods.findIndex(v=>v.shopcart_id===id)
        let cartItem = this.data.cartGoods[index];
        let shopcart_amount = Number(cartItem.shopcart_amount) + 1;
        this.setData({
            cartGoods: this.data.cartGoods,
        });
        this.updateCart(index,shopcart_amount, cartItem.shopcart_id);
    },
    //更新购物车商品
    updateCart: function(index,shopcart_amount, shopcart_id) {
      let that = this;
      util.request(api.CartUpdate, {
          openId: wx.getStorageSync('openId'),
          shopcart_id: shopcart_id,
          shopcart_amount: shopcart_amount
      }, 'GET').then(function(res) {
        console.log(res);
          if (res.errno === 0) {
              that.setData({
                  cartGoods: res.cartList,
                  cartTotal: res.cartTotal
              });
              // let cartItem = that.data.cartGoods[index];
              // cartItem.shopcart_amount = shopcart_amount;
          }
           else {
              util.showErrorToast('库存不足了')
          }
          that.setData({
            allSelect: that.isCheckedAll()
          });
      });
    },
    //删除购物车
    deleteGoods: function(e) {
     //获取已选择的商品
     const{id} =e.currentTarget.dataset;
     let {cartGoods} = this.data
     let index = cartGoods.findIndex(v=>v.shopcart_id===id)
     console.log(index);
     console.log(this.data.cartGoods[index]);
     let shopcart_id = this.data.cartGoods[index].shopcart_id;
     let that = this;
     util.request(api.CartDelete, {
        openId: wx.getStorageSync('openId'),
        shopcart_id: shopcart_id
     }, 'GET').then(function(res) {
         if (res.errno === 0) {
             let cartList = res.cartList;
             that.setData({
                 cartGoods: cartList,
                 cartTotal: res.cartTotal
             });
         }
         that.setData({
           allSelect: that.isCheckedAll()
         });
     });
    },

    //商品全选事件处理
    handallselect(){
    let that = this;
    if (!this.data.isEditCart) {
        console.log(that.isCheckedAll());
        console.log(that.isCheckedAll() ? 1 : 0);
        var shopcart_id = this.data.cartGoods.map(function(v) {
            return v.shopcart_id;
        });
        util.request(api.CartCheckedAll, {
            openId: wx.getStorageSync('openId'),
            // shopcart_id: shopcart_id.join(','),
            isChecked: that.isCheckedAll() ? 1 : 0
        }, 'GET').then(function(res) {
            console.log(res);
            if (res.errno === 0) {
                that.setData({
                    cartGoods: res.cartList,
                    cartTotal: res.cartTotal
                });
            }
            that.setData({
              allSelect: that.isCheckedAll()
            });
        });
        }
    },

    //去结算
    checkoutOrder: function() {
      //获取已选择的商品
      // util.loginNow();
      let that = this;
      var checkedGoods = this.data.cartGoods.filter(function(element, index, array) {
          if (element.checked == true) {
              return true;
          } else {
              return false;
          }
      });
      if (checkedGoods.length <= 0) {
          util.showErrorToast('你好像没选中商品');
          return false;
      }
      wx.navigateTo({
          url: '/pages/pay/settlement/settlement?addtype=0'
      })
    }, 

    //从数据库检查是否上架-----commodity_state表示商品状态
    checkedItem: function(e) {
      let that = this
      const{id} =e.currentTarget.dataset;
      let {cartGoods} = this.data
      let index = cartGoods.findIndex(v=>v.shopcart_id===id)
      console.log(index);
      if(cartGoods[index].checked == 1){
        cartGoods[index].checked = 0
      }else{
        cartGoods[index].checked = 1
      }
      console.log(cartGoods[index].checked);
      // that.setData({
      //   cartGoods
      // });
      console.log(this.data);

      if (!this.data.isEditCart) {
          util.request(api.CartChecked, {
              openId: wx.getStorageSync('openId'),
              shopcart_id: e.currentTarget.dataset.id,
              checked: cartGoods[index].checked ? 0 : 1,
              good_index:  cartGoods[index].commoditySonAttribute.sonAttribute_id,
          }, 'GET').then(function(res) {
              console.log(res);
              if (res.errno === 0) {
                  that.setData({
                      cartGoods: res.cartList,//后端传过来得购物车商品数据
                      cartTotal: res.cartTotal//从后端传过来得计算信息
                  });
              }
              that.setData({
                allSelect: that.isCheckedAll()
              });
          });
      }
    },

    //判断购物车商品已全选
    isCheckedAll: function() {
      return this.data.cartGoods.every(function(element, index, array) {
        if (element.checked == true) {
            return true;
        } else {
            return false;
        }
    });
    },

    //获取商品的信息
    getCart: function() {
      let that = this
      console.log("openid"+wx.getStorageSync('openId'));
      util.request(api.CartGoods, {
              openId: wx.getStorageSync('openId')
          }, 'GET').then(function(res) {
          if (res.errno === 0) {
              console.log(res);
              if (res.shopcart_id == 0) {
                  wx.removeTabBarBadge({
                      index: 2,
                  })
              }
              if (res.errno === 0) {
                  that.setData({
                      cartGoods: res.cartList,//后端传过来得购物车商品数据
                      cartTotal: res.cartTotal//从后端传过来得计算信息
                  });
              }

              that.setData({
                allSelect: that.isCheckedAll()
              }); 
          }
      });
  },
  

/**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
     
})