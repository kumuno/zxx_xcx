var util = require('../../../utils/utils');
var api = require('../../../config/api.js');
// const pay = require('../../services/pay.js');

var app = getApp();
Page({
  data: {
    status: 0, //是否支付成功
    orderId: 0, //总订单号
    actualPrice: 0, //支付金额
    listGoodName:'',//所有商品名称
    is_over: 0,
    productId: 0,
    imageUrl: ''
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.orderId,
      status: options.status,
      actualPrice: options.totalFee,
      listGoodName: options.listGoodName
    })
  },
  toOrderListPage: function (event) {
    wx.switchTab({
      url: '/pages/mine/mine',
    });
  },
  toIndex: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['w6AMCJ0FI2LqjCjWPIrpnVWTsFgnlNlmCf9TTDmG6_U'],
      success(res) {
        console.log(res);
        wx.switchTab({
          url: '/pages/index/index'
        });
      },
      fail(err) {
        console.log(err);
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    })
  },
  payOrder() {
    let that = this;
    let actualPrice = this.data.actualPrice;
    wx.login({
      success(res) {
        if (res.code) {
          wx.request({
            url: 'http://119.29.13.56:28079/pay', //仅为示例，并非真实的接口地址
            data: {
              totalFee: actualPrice,
              code: res.code,
              listGoodName: that.data.listGoodName
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success(res) {
              console.log(res.data)
              const params = res.data.data;
              wx.requestPayment({
                timeStamp: params.timeStamp + '',
                nonceStr: params.nonceStr,
                package: 'prepay_id=' + params.prepay_id,
                signType: params.signType,
                paySign: params.paySign,
                success(res) {
                  console.log("支付成功:", res.errMsg);
                  util.request(api.orderUpdatePayInformation, { //支付成功就修改总订单信息
                    openId: wx.getStorageSync('openId'),
                    orderId: that.data.orderId
                  }).then(function (res) {
                    console.log(res);
                    if (res.code == 0) {
                      that.setData({
                        status: true
                      });
                    }
                  });
                },
                fail(res) {
                  console.log("支付失败:", res.errMsg);
                  util.showErrorToast(res.errMsg);
                }
              })
            }
          })
        }
      }
    })
  }
})