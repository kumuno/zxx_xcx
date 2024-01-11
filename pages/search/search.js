var util = require('../../utils/utils');
var api = require('../../config/api.js');
// let openId = wx.getStorageSync('openId');
var app = getApp()
Page({
  data: {
    keywrod: '',
    searchStatus: false,
    goodsList: [],
    helpKeyword: [],
    historyKeyword: [],
    categoryFilter: false,
    currentSortType: 'default',
    filterCategory: [],
    defaultKeyword: {},
    hotKeyword: [],
    currentSortOrder: 'desc',
    salesSortOrder: 'desc',
    categoryId: 0,
  },
  //事件处理函数
  closeSearch: function () {
    wx.navigateBack()
  },
  clearKeyword: function () {
    this.setData({
      keyword: '',
      searchStatus: false
    });
  },
  onLoad: function () {
    this.getSearchKeyword();
  },
  getSearchKeyword() {
    let that = this;
    util.request(api.SearchIndex, {
      user_id: wx.getStorageSync('openId')
    }).then(function (res) {
      console.log("getSearchKeyword：", res);
      console.log("openId", wx.getStorageSync('openId'));
      that.setData({
        historyKeyword: res,
        // defaultKeyword: res.data.defaultKeyword,
        // hotKeyword: res.data.hotKeywordList
      });
    });
  },

  inputChange: function (e) {
    this.setData({
      keyword: e.detail.value,
      searchStatus: false
    });
    // this.getHelpKeyword();
  },

  //将搜索记录存储进数据库
  insertSearch: function () {
    let that = this;
    util.request(api.SearchHelper, {
      keyword: that.data.keyword,
      user_id: wx.getStorageSync('openId')
    }).then(function (res) {
      console.log(res);
    });
  },

  inputFocus: function () {
    this.setData({
      searchStatus: false,
      goodsList: []
    });

    if (this.data.keyword) {
      // this.getHelpKeyword();
    }
  },

  //清除个人搜索记录
  clearHistory: function () {
    this.setData({
      historyKeyword: []
    })

    util.request(api.SearchClearHistory, {
        user_id: wx.getStorageSync('openId')
      })
      .then(function (res) {
        wx.showToast({
          image: "../../images/icon/success.png",
          icon: "success",
          title: '已清除搜索记录',
          duration: 1500,
        })
      });
  },

  //获取搜索的商品信息
  getGoodsList: function () {
    let that = this;
    util.request(api.GoodsList, {
      keyword: that.data.keyword,
      sort: that.data.currentSortType,
      order: that.data.currentSortOrder,
      sales: that.data.salesSortOrder
    }).then(function (res) {
      console.log(res);
      that.setData({
        searchStatus: true,
        goodsList: res,
      })
      //重新获取关键词
      // that.getSearchKeyword();
    });
  },

  //点击历史记录或者热门搜索信息直接搜索
  onKeywordTap: function (event) {
    this.getSearchResult(event.target.dataset.keyword);
  },

  getSearchResult(keyword) {
    this.setData({
      keyword: keyword,
      goodsList: []
    });

    this.getGoodsList();
    this.insertSearch();
  },


  openSortFilter: function (event) {
    let currentId = event.currentTarget.id;
    switch (currentId) {
      case 'salesSort':
        let _SortOrder = 'asc';
        if (this.data.salesSortOrder == 'asc') {
          _SortOrder = 'desc';
        }
        this.setData({
          'currentSortType': 'sales',
          'currentSortOrder': 'asc',
          'salesSortOrder': _SortOrder
        });
        this.getGoodsList();
        break;
      case 'priceSort':
        let tmpSortOrder = 'asc';
        if (this.data.currentSortOrder == 'asc') {
          tmpSortOrder = 'desc';
        }
        this.setData({
          'currentSortType': 'price',
          'currentSortOrder': tmpSortOrder,
          'salesSortOrder': 'asc'
        });
        this.getGoodsList();
        break;
      default:
        //综合排序
        this.setData({
          'currentSortType': 'default',
          'currentSortOrder': 'desc',
          'salesSortOrder': 'desc'
        });
        this.getGoodsList();
    }
  },
  onKeywordConfirm(event) {
    this.getSearchResult(event.detail.value);
  }
})