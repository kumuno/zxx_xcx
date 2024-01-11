const util = require('../../utils/utils.js');
const api = require('../../config/api.js');
// const user = require('../../services/user.js');

//获取应用实例
const app = getApp()

Page({
  data: {
    floorGoods: [],
    openAttr: false,
    showChannel: 0,
    showBanner: 0,
    showBannerImg: 0,
    banner: [],
    index_banner_img: 0,
    userInfo: {},
    imgurl: '',
    sysHeight: 0,
    loading: 0,
    autoplay: true,
    showContact: 1,

    imgUrls: [
      "http://119.29.13.56:8081/photo/CarouselPhoto/565c7382ba824fd0f7299190d30c783.jpg",
      "http://119.29.13.56:8081/photo/CarouselPhoto/53313c41f27d71552debc1ae3b5ac6d.jpg",
      "http://119.29.13.56:8081/photo/CarouselPhoto/3b55951b5f101ac571922381a34f090.jpg",
      "http://119.29.13.56:8081/photo/CarouselPhoto/73a8f5c4c87af1787079baf0511beed.jpg",
      "http://119.29.13.56:8081/photo/CarouselPhoto/a27b89e488145c3adccd8ec512923ac.jpg",
      "http://119.29.13.56:8081/photo/CarouselPhoto/d986363cab7282575c148b8b61eee8b.jpg"
    ],
    currenttControl: 0,

  },
  //轮播图
  swiperChange(e) {
    console.log(e)
    this.setData({
      currentIndex: e.detail.current
    })
  },

  //点击切换，滑块index赋值 
  currentControl: function (e) {
    const that = this;
    if (that.data.currenttControl === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currenttControl: e.target.dataset.current
      })
    }
  },

  //手动滑动，导航下标也要变，颜色才能随着变化
  handleSwiper(e) {
    let {
      current,
      source
    } = e.detail
    if (source === 'autoplay' || source === 'touch') {
      const currentTab = current
      this.setData({
        currenttControl: currentTab
      })
    }
  },

  //查看更多商品
  goCategory: function (e) {
    // let id = e.currentTarget.dataset.cateid;
    // wx.setStorageSync('categoryId', id);
    wx.switchTab({
      url: '/pages/category/category',
    })
  },

  onPageScroll: function (e) {
    let scrollTop = e.scrollTop;
    let that = this;
    if (scrollTop >= 2000) {
      that.setData({
        showContact: 0
      })
    } else {
      that.setData({
        showContact: 1
      })
    }
  },
  onHide: function () {
    this.setData({
      autoplay: false
    })
  },
  goSearch: function () {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },

  handleTap: function (event) {
    //阻止冒泡 
  },
  onShareAppMessage: function () {
    let info = wx.getStorageSync('userInfo');
    return {
      title: '湛小鲜',
      desc: '',
      path: '/pages/index/index?id=' + info.id
    }
  },
  toDetailsTap: function () {
    wx.navigateTo({
      url: '/pages/goods-details/index',
    });
  },
  getIndexData: function () {
    let that = this;
    util.request(api.IndexUrl).then(function (res) {
      console.log(res);
      var array = [];
      array.push(res['水果'])
      array.push(res['蔬菜'])
      array.push(res['肉'])
      array.push(res['海鲜'])
      array.push(res['研学活动'])
      console.log(array);
      that.setData({
        floorGoods: array,
        loading: 1,
      });
    });
  },


  onLoad: function (options) {

  },
  onShow: function () {
    this.getIndexData();
    var that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo != '') {
      that.setData({
        userInfo: userInfo,
      });
    };
    let info = wx.getSystemInfoSync();
    let sysHeight = info.windowHeight - 100;
    this.setData({
      sysHeight: sysHeight,
      autoplay: true
    });
    wx.removeStorageSync('categoryId');
  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.getIndexData();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
})