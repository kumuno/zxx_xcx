// pages/login/login.js
const api = require('../../../config/api.js');
Page({

  data: {
    avatarUrl: '../../../images/icon/avatar.png',
    openId: '',
    userInfo: {},
    phone: '',
    hasUserInfo: false,
    logged: false,
    takeSession: false,
    requestResult: '',
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl')
  },

  onLoad: function () {
    //根据code获取openid等信息
    let that = this;
    wx.login({
      //获取code
      success: function (res) {
        var code = res.code; //返回code
        console.log(code);
        var appId = 'wxd8747581989400b2';
        var secret = '462826b205d28d7450d66a9d7f085be8';
        wx.request({
          url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appId + '&secret=' + secret + '&js_code=' + code + '&grant_type=authorization_code',
          data: {},
          header: {
            'content-type': 'json'
          },
          success: function (res) {
            var openid = res.data.openid //返回openid
            that.setData({
              openId: openid
            });
            console.log('openid为' + openid);
          }
        })
      }
    });


  },


  //获取手机号码
  getPhoneNumber(e) {
    //根据code获取openid等信息
    let that = this;
    console.log("e:" + e.detail.errMsg);
    console.log("phone-code:" + e.detail.code)
    console.log("openId:" + that.data.openId);
    wx.request({
      // api.AuthLoginByWeixin
      url: api.WXphone,
      data: {
        code: e.detail.code, //临时登录凭证
        openId: that.data.openId
      },
      success: function (res) {
        if (e.detail.errMsg == "getPhoneNumber:ok") {//判断是接受授权还是拒绝授权
          console.log('phone-request success');
          console.log(res);
          wx.setStorageSync('openId', that.data.openId);
          wx.setStorageSync('userInfo', res.data.userInfo),
            wx.reLaunch({
              url: '/pages/mine/mine'
            }),
            wx.showToast({
              image: "../../../images/icon/success.png",
              icon: "success",
              title: '欢迎登录湛小鲜',
              duration: 1000,
            })
        } else {
          wx.showToast({
            image: "../../../images/icon/error.png",
            title: '用户拒绝授权',
            icon: "error",
            duration: 1000
          });
        }
      },
      fail: function (error) {
        console.log(error);
        wx.showToast({
          image: "../../../images/icon/error.png",
          title: '系统出现错误啦~',
          icon: "error",
          duration: 1000
        });
      }
    });
  },
  onShow() {
    this.setData({
      userInfo: wx.getStorageSync('userInfo')
    })
  },


})