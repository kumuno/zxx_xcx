var util = require('../../utils/utils');
var api = require('../../config/api');
// var timer = require('../../../utils/wxTimer.js');
// var remaintimer = require('../../../utils/remainTime.js');
// const pay = require('../../../services/pay.js');
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        status: {},
    },
    goProfile: function (e) {
        wx.navigateTo({
            url: '/pages/mine-details/setting/setting',
        });
        // let res = util.loginNow();
        // if (res == true) {
        //     wx.navigateTo({
        //         url: '/pages/mine-details/setting/setting',
        //     });
        // }
    },
    orderList: function(event) {
        let showType = event.currentTarget.dataset.index;
            wx.setStorageSync('showType', showType);
            wx.navigateTo({
                url: '/pages/order/all_order/all_order?showType=' + showType,
            });
        // let res = util.loginNow();
        // if (res == true) {
        //     let showType = event.currentTarget.dataset.index;
        //     wx.setStorageSync('showType', showType);
        //     wx.navigateTo({
        //         url: '/pages/ucenter/order-list/index?showType=' + showType,
        //     });
        // }
    },
    addressList: function(e) {
        let userInfo = wx.getStorageSync('userInfo');
        if(userInfo != ''){
            wx.navigateTo({
                url: '/pages/mine-details/address/address?type=0',
            });
        }
        else{
            wx.showToast({
              title: '亲~您还没登录',
              image:'../../images/icon/emotion-unhappy.png',
              icon:'none'
            })
            }
        //let res = util.loginNow();
        // if (res == true) {
        //     wx.navigateTo({
        //         url: '/pages/ucenter/address/index?type=0',
        //     });
        // }
    },
    toMyself: function () {
        let userInfo = wx.getStorageSync('userInfo');
        if(userInfo != ''){
            wx.navigateTo({
                url: '/pages/mine-details/setting/setting',
            });
        }
        else{
            wx.showToast({
              title: '亲~您还没登录',
              image:'../../images/icon/emotion-unhappy.png',
              icon:'none'
            })
            }
    },
   
    toCoupon: function () {
        let userInfo = wx.getStorageSync('userInfo');
        if(userInfo != ''){
            wx.navigateTo({
                url: '/pages/mine-details/coupon/coupon',
            });
        }
        else{
            wx.showToast({
              title: '亲~您还没登录',
              image:'../../images/icon/emotion-unhappy.png',
              icon:'none'
            })
            }
    },
    goLogin: function(e) {
        wx.navigateTo({
            url: '/pages/mine-details/login/login',
        });
    },
    onLoad: function(options) {
    
    },
    onShow: function() {
      let userInfo = wx.getStorageSync('userInfo');
      console.log('获取好好',userInfo)
      if(userInfo == ''){
          this.setData({
              hasUserInfo: 0,
          });
      }else{
          this.setData({
              hasUserInfo: 1,
          });
      }
      this.setData({
          userInfo: wx.getStorageSync('userInfo') 
        });
      this.getOrderInfo();
      wx.removeStorageSync('categoryId');
    },

    onPullDownRefresh: function() {
        wx.showNavigationBarLoading()
        this.getOrderInfo();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },
    
    getOrderInfo: function (e) {
        let that = this;
        util.request(api.OrderCountInfo, {
            openId: wx.getStorageSync('openId'),
        }).then(function (res) {
            // console.log(res);
            if (res.code === 0) {
                let status = res.data;
                that.setData({
                    status: status
                });
            }
        });
    },
    
})