const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    count: 4,
  },

  onLoad() {
    this.countDown();
  },

  go() {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },


  countDown: function () {
    let that = this;
    let total = 4;
    this.interval = setInterval(function () {
      total > 0 && (total--, that.setData({
        count: total
      })), 0 === total && (that.setData({
        count: total
      }), wx.switchTab({
        url: '/pages/index/index'
      }), clearInterval(that.interval));
    }, 1e3);
  },
})