var util = require('../../../utils/utils');
var api = require('../../../config/api.js');
// const { UniformBlock } = require('XrFrame/kanata/lib/index');
Page({

  data: {
    tx: "",
    name: "",
    mobile: "",
    email: "",
    gender: "",
    birthday: "",
    //上传头像
    photoPath: '', //选择的图片路径
    avator: '../../../images/icon/whale.png', //传到服务器返回来的图片路径，引号里是默认图片
  },

  bindDateChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      currentDate: e.detail.value
    })
  },
  chooseAddress() {
    wx.chooseAddress({
      success(res) {
        console.log(res.userName)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    var useInfo = wx.getStorageSync('userInfo')
    var that = this;
    that.setData({
      tx: useInfo.user_image,
      name: useInfo.user_name,
      mobile: useInfo.user_phone
    })
  },


  //赋值微信名称
  bindinputname(e) {
    let name = e.detail.value;
    this.setData({
      name: name
    });
  },

  //获取头像并赋值（包含获取微信头像）
  onChooseAvatar: function (e) {
    var useInfo = wx.getStorageSync('userInfo')
    var openid = useInfo.user_id;
    var than = this;
    const {
      avatarUrl
    } = e.detail
    than.setData({
        tx: avatarUrl,
      }),
      console.log(e.detail);
    wx.showLoading({
      title: '上传中！',
    })
    wx.uploadFile({
      //体验版测试用的
      // url: 'http:/124.240.45.38:28079/addImage',
      //本机测试用的
      url: 'http://119.29.13.56:28079/addImage',
      // url: 'http://cd.free.idcfengye.com/upload',
      filePath: avatarUrl,
      name: 'image_file',
      header: {
        'content-type': 'application/json'
        // 'Accept': 'application/json', 
      },
      formData: {
        openid: openid
      },
      success: function (res) {
        // 将获取的数据转换为json
        var DataUserInfo = JSON.parse(res.data);
        console.log(DataUserInfo);
        if (DataUserInfo.userInfo != null) {
          //把对象缓存
          wx.setStorageSync('userInfo', DataUserInfo.userInfo);
          util.showSuccessToast('保存成功');

        } else {
          util.showErrorToast('上传失败');
        }
      }
    });
  },

  //获取头像并赋值（只有拍照和上传）
  Avatar: function () {
    var useInfo = wx.getStorageSync('userInfo')
    var openid = useInfo.user_id;
    var than = this;
    // const { avatarUrl } = e.detail
    // this.setData({
    //   tx: avatarUrl,
    // }),
    // console.log(e.detail);
    wx.chooseMedia({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: function (res) {
        var tempFilePathsnew = res.tempFiles[0].tempFilePath;
        console.log(tempFilePathsnew);
        than.setData({
            tx: tempFilePathsnew,
          }),
          wx.showLoading({
            title: '上传中！',
          })
        wx.uploadFile({
          //体验版测试用的
          // url: 'http://124.240.45.38:28079/addImage',
          //本机测试用的
          // url: 'http://localhost:28079/addImage',
          // url: 'http://cd.free.idcfengye.com/upload',
          filePath: tempFilePathsnew,
          name: 'image_file',
          header: {
            'content-type': 'application/json'
            // 'Accept': 'application/json', 
          },
          formData: {
            openid: openid
          },
          success: function (res) {
            // 将获取的数据转换为json
            var DataUserInfo = JSON.parse(res.data);
            console.log(DataUserInfo);
            if (DataUserInfo.userInfo != null) {
              //把对象缓存
              wx.setStorageSync('userInfo', DataUserInfo.userInfo);
              util.showSuccessToast('保存成功');

            } else {
              util.showErrorToast('上传失败');
            }
          }
        });
      }
    })
  },



  // 退出登录
  logout: function () {
    wx.removeStorage({
      key: 'userInfo',
      success(res) {
        wx.showModal({
          title: '提示',
          content: '确定是否要退出？',
          cancelText: '取消',
          confirmText: '确认',
          confirmColor: '#000000',
          cancelColor: '#576b95',
          success(res) {
            if (res.confirm) {
              wx.removeStorageSync("openId")
              wx.removeStorageSync('userInfo'),
              wx.reLaunch({
                url: '/pages/mine/mine',
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    })
  },
  //保存信息
  reserve: function () {
    var useInfo = wx.getStorageSync('userInfo')
    var openid = useInfo.user_id;
    let name = this.data.name;
    let mobile = this.data.mobile;
    if (name == '') {
      util.showErrorToast('请输入姓名');
      return false;
    }
    if (mobile == '') {
      util.showErrorToast('请输入手机号码');
      return false;
    }

    util.request(api.SaveSettings, {
      name: name,
      mobile: mobile,
      openid: openid
    }).then(function (res) {
      console.log(res);
      var userInfo = res.userInfo;
      if (userInfo != null) {
        wx.setStorageSync('userInfo', userInfo);
        util.showSuccessToast('保存成功');
        wx.navigateBack()
      } else {
        util.showErrorToast('保存失败');
      }
    });
  }
})