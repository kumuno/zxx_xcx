const app = getApp();
var util = require('../../../utils/utils');
var api = require('../../../config/api');
import Toast from '@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    columns: ['不想要了', '买多了', '不喜欢', '信息填错了', '其他'],
    result: '',//选择的退款原因
    money: '',
    message: '',//退款说明
    orderId: '',//订单编号
    actualprice: '',//退款金额
    orderGoods: '',//订单的商品具体信息
    orderaccount: '',//订单的商品总数量
  },
  //查看商品列表
  toGoodsList: function (e) {
    let orderId = this.data.orderId;
    // console.log("orderId",orderId);
    wx.navigateTo({
      url: '/pages/pay/goods-list/index?orderId=' + orderId,
    });
  },
  // 下拉框确认
  onConfirm(event) {
    console.log(event.detail.value)
    // const { picker, value, index } = event.detail;
    // Toast(`当前值：${value}, 当前索引：${index}`);
    this.setData({
      result: event.detail.value
    })
    console.log("hhhhhjjkkkk", this.data.result)
    if (this.data.result != null) {
      this.setData({
        show: false
      });
    }
  },
  // 下拉框取消
  onCancel() {
    Toast('取消');
  },
  // 隐藏下拉框
  onClose() {
    this.setData({
      show: false
    });
  },
  // 显示下拉框
  bindRefund: function (evnet) {
    this.setData({
      show: true,
    })
  },
  onDescribe:function(e){
    console.log("退款说明:",e.detail.value);
    this.setData({
      message:e.detail.value
    });
  },
  // 删除照片
  bindUpImg: function (event) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
      }
    })
  },
  // 提交申请退款
  orderSubmit: function () {
    let that = this;
    if (that.data.result == '' || that.data.result == undefined) {
      util.showErrorToast('请选择退款原因');
      return false;
    }
    util.request(api.applyRefund, { //修改总订单备注
      user_id: wx.getStorageSync('openId'),
      order_id: that.data.orderId,
      order_refund_reason: that.data.result,
      order_refund_instructions: that.data.message,
      order_refund_image: '',
  }).then(function (res) {
      console.log(res);
      if (res.code == 0) {
        wx.showModal({
          title: "提交申请退款成功",
          content: "具体退货退款情况,请联系客服",
          confirmText: "知道啦",
          showCancel: false,
          success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/order/all_order/all_order',
                })
              } else if (res.cancel) {
                wx.navigateTo({
                  url: '/pages/order/all_order/all_order',
                })
              }
          }

      })
      }
  });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderId = options.orderId;
    let actualprice = options.actualprice;
    let orderGoods = options.orderGoods;
    let orderaccount = options.orderaccount;
    //将字符串解码
    var dataStr = decodeURIComponent(orderGoods);
    //将json格式的字符串转化成json对象
    var dataJson = JSON.parse(dataStr);
    console.log("订单号：", orderId);
    console.log("当前的退款金额是：", actualprice);
    console.log("当前的商品信息是：", dataJson);
    console.log("当前的商品总数是：", orderaccount);
    this.setData({
      orderId: orderId,
      actualprice: actualprice,
      orderGoods: dataJson,
      orderaccount: orderaccount
    })
    console.log("111", this.data.show);
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
    console.log("111", this.data.show);
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

  }
})