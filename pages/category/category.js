var config = require('../../utils/utils');
// var http = require('../../config/api');
const util = require('../../utils/utils.js');
const api = require('../../config/api.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    List:[],
    commodity: [ //所有商品类型
      // {
      //   commodity_type: "水果",
      //   commodity_flag: "a"
      // },
      // {
      //   commodity_type: "蔬菜",
      //   commodity_flag: "b"
      // },
      // {
      //   commodity_type: "生鲜",
      //   commodity_flag: "c"
      // },
      // {
      //   commodity_type: "其它",
      //   commodity_flag: "d"
      // }
    ],
    commodityList: [ //所有商品
      // { 
      //   commodity_flag: "a",
      //   commodity_id: '11',
      //   commodity_img: '../../images/icon/commodity.png',
      //   commodity_name: '廉江红橙',
      //   commodity_introduce: '真的很好吃，商家推荐！',
      //   commodity_price: '12',
      //   f_Price: '18',
      //   quantity: '0'
      // },
      // {
      //   commodity_flag: "a",
      //   commodity_id: '12',
      //   commodity_img: '../../images/icon/commodity.png',
      //   commodity_name: '红富士',
      //   commodity_introduce: '真的很好吃，商家推荐！',
      //   commodity_price: '12',
      //   f_Price: '18',
      //   quantity: '0'
      // },
      // {
      //   commodity_flag: "b",
      //   commodity_id: '13',
      //   commodity_img: '../../images/icon/commodity.png',
      //   commodity_name: '西红柿',
      //   commodity_introduce: '真的很好吃，商家推荐！',
      //   commodity_price: '12',
      //   f_Price: '18',
      //   quantity: '0'
      // },
      // {
      //   commodity_flag: "b",
      //   commodity_id: '14',
      //   commodity_img: '../../images/icon/commodity.png',
      //   commodity_name: '土豆',
      //   commodity_introduce: '真的很好吃，商家推荐！',
      //   commodity_price: '12',
      //   f_Price: '18',
      //   quantity: '0'
      // },
      // {
      //   commodity_flag: "c",
      //   commodity_id: '15',
      //   commodity_img: '../../images/icon/commodity.png',
      //   commodity_name: '虾',
      //   commodity_introduce: '真的很好吃，商家推荐！',
      //   commodity_price: '12',
      //   f_Price: '18',
      //   quantity: '0'
      // },
      // {
      //   commodity_flag: "c",
      //   commodity_id: '16',
      //   commodity_img: '../../images/icon/commodity.png',
      //   commodity_name: '鱼',
      //   commodity_introduce: '真的很好吃，商家推荐！',
      //   commodity_price: '12',
      //   f_Price: '18',
      //   quantity: '0'
      // },
      // {
      //   commodity_flag: "d",
      //   commodity_id: '17',
      //   commodity_img: '../../images/icon/commodity.png',
      //   commodity_name: '精品',
      //   commodity_introduce: '真的很好吃，商家推荐！',
      //   commodity_price: '12',
      //   f_Price: '18',
      //   quantity: '0'
      // }
    ],
    indexId: 0,
    toTitle: "title-0",
    scrollTop: 0,
    top: [],
    totalPrice: 0, //选中商品总价格
    totalNum: 0, //选中商品数量
    cartList: [], //选中商品列表
    loading: 0, //加载页面
  },
  //查询分类的类型
  getAllType() {
    let that = this;
    util.request(api.getAllType).then(function (res) {
      console.log("getAllType：", res);
      that.setData({
        commodity: res,
        // loading: 1,
      });
    });
  },

  //查询所有商品
  findAllCommodity() {
    let that = this;
    util.request(api.findAllCommodity).then(function (res) {
      console.log("findAllCommodity", res);
      that.setData({
        commodityList: res,
        loading: 1,
      });
    });
  },

  //查询所有有数量得商品
  // findAllCommodityHasNum() {
  //   let that = this;
  //   util.request(api.findAllCommodityHasNum).then(function (res) {
  //     console.log("List", res);
  //     that.setData({
  //       List: res,
  //       loading: 1,
  //     });
  //   });
  // },


  // 左侧点击事件
  jumpIndex(e) {
    let index = e.currentTarget.dataset.menuindex;
    console.log("当前的索引menuindex:", index)
    let commodity_flag = e.currentTarget.dataset.id;
    console.log("当前的索引commodity_type:", e.currentTarget.dataset.id)
    let that = this
    that.setData({
      indexId: index,
      toTitle: "title-" + commodity_flag
    });
  },
  scrollToLeft(res) {
    console.log("scrollToLeft-res:" + JSON.stringify(res) + JSON.stringify(this.data.top));
    console.log("节点上边界top：", this.data.top)
    this.setData({
      scrollTop: res.detail.scrollTop
    })
    console.log("滚动条scrollTop：", this.data.scrollTop)
    var length = this.data.top.length;
    for (var i = 0; i < this.data.top.length; i++) {
      if (this.data.top[i] - this.data.top[0] <= this.data.scrollTop && (i < length - 1 && this.data.top[i + 1] - this.data.top[0] > this.data.scrollTop)) {
        if (this.data.indexId != i) {
          this.setData({
            indexId: i,
          });
        }
      }
    }
  },

  onLoad: async function (options) {
    this.getAllType();
    this.findAllCommodity();
    console.log(this.data.commodityList)
    var that = this;
    wx.showLoading({
      mask: true,
      title: '加载中…',
    })
    wx.hideLoading()
    console.log(that.data.commodityList)
    //赋值
    wx.getSystemInfo({
        success: function (res) {
        that.setData({
          winHeight: res.windowHeight - 100
        });
        var top2 = new Array();
        for (var i = 0; i < that.data.commodity.length; i++) {
          wx.createSelectorQuery().select('#view-' + that.data.commodity[i].commodity_flag).boundingClientRect(function (rect) {
            console.log("都会很好的")
            var isTop = Number(rect.top);
            console.log("都会得到很好的isTop:", isTop)
            top2.push(isTop);
            console.log("view-c:" + JSON.stringify(rect));
          }).exec();
        }
        that.setData({
          top: top2
        });
      }
    });
    this.onShow()
  },
  onShow: function (options) {
    // this.findAllCommodityHasNum();
    let userInfo = wx.getStorageSync('userInfo');
        let info = wx.getSystemInfoSync();
        let sysHeight = info.windowHeight - 100;
        let userId = userInfo.id;
        if (userId > 0) {
            this.setData({
                userId: userId,
                userInfo: userInfo,
            });
        }
        this.setData({
            priceChecked: false,
            sysHeight: sysHeight
        })
    
  },
  
  // 定义根据id删除数组的方法
  // removeByValue: function (array, val) {
  //   for (var i = 0; i < array.length; i++) {
  //     if (array[i].commodity_id == val) {
  //       array.splice(i, 1);
  //       break;
  //     }
  //   }
  // },
 
  //跳转搜索
  searchNav: function () {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },
  toDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    var goodDetail = [];
    for (var i = 0; i < this.data.commodityList.length; i++) {
      if (this.data.commodityList[i].commodity_id == id) {
        goodDetail.push(this.data.commodityList[i]);
      }
    }
    // wx.navigateTo({
    //   url: '../../category/goodDetail/goodDetail?goodDetail=' + JSON.stringify(goodDetail),
    // })
  },

  // gotoOrder: function () {
  //   var count = wx.getStorageSync('cart').length
  //   console.log(count)
  //   if (count <= 0) {
  //     wx.showToast({
  //       title: '请先选择菜品',
  //       icon: "none"
  //     })
  //     return
  //   }
  //   // 跳转到支付页面
  //   wx.navigateTo({
  //     url: '../../category/previewOrder/previewOrder',
  //   })
  // },


  handleTap: function (event) { //阻止冒泡 
  },


  //更新购物车商品
  // update: function(index,shopcart_amount, shopcart_id) {
  //   let that = this;
  //   util.request(api.CartUpdate, {
  //       openId: wx.getStorageSync('openId'),
  //       shopcart_id: shopcart_id,
  //       shopcart_amount: shopcart_amount
  //   }, 'GET').then(function(res) {
  //     console.log(res);
  //       if (res.errno === 0) {
  //           that.setData({
  //               cartGoods: res.cartList,
  //               cartTotal: res.cartTotal
  //           });
  //       }
  //        else {
  //           util.showErrorToast('库存不足了')
  //       }
  //       that.setData({
  //         allSelect: that.isCheckedAll()
  //       });
  //   });
  // },
  
// 选择规格
// switchAttrPop: function () {
//   // console.log(util.WXlogin());
//   // util.WXlogin();
//   var that = this;
//   let userInfo = wx.getStorageSync('userInfo');
//   let openId = wx.getStorageSync('openId');
//   console.log("userInfo", userInfo);
//   console.log("openId" + openId);
//   // let productLength = this.data.productList.length;
//   if (userInfo == '') {
//       wx.showToast({
//           // image: '/images/icon/icon_error.png',
//           title: '请先登录',

//       });
//       return false;
//   }
//   if (this.data.openAttr == false) {
//       //打开规格选择窗口
//       this.setData({
//           openAttr: !that.data.openAttr
//       });
//       this.setData({
//           alone_text: '加入购物车'
//       })
//   } else {
//       //判断是否选中规格按钮，false即为无选中
//       if (this.data.priceChecked == false) {
//           wx.showToast({
//               // image: '/images/icon/icon_error.png',
//               title: '请选择规格',
//           });
//           return false;
//       } else {
//           console.log("this.data.id:" + this.data.id);
//           console.log("this.data.good_index:" + this.data.good_index);
//           console.log("this.data.good_name:" + this.data.good_name);
//           console.log("this.data.good_price:" + this.data.good_price);
//           console.log("this.data.number:" + this.data.number);
//           wx.request({
//               // api.AuthLoginByWeixin
//               url: api.CartAdd,
//               data: {
//                   good_id: this.data.id,
//                   good_index: this.data.good_index,
//                   number: this.data.number,
//                   openId: wx.getStorageSync('openId')
//               },
//               success: function (res) {
//                   console.log("========================添加购物车传输数据成功=========================");
//                   console.log(res);
//                   wx.setStorageSync('cartGoodsCount', res.data.cartGoodsCount); //设置返回来得商品总数
//                   console.log("cartGoodsCount=" + res.data.cartGoodsCount);
//                   console.log('number=' + res.data.number);
//                   wx.showToast({
//                       title: '加入购物车成功',
//                   });
//               },

//           });

//       }
//   }
// }


  })

//获取商品信息
// function GetFoodCook(_this) {
//   var that = _this
//   return new Promise((resove, reject) => {
//     //获取分类
//     let data = {
//       CookName: ""
//     }
//     let header = {}
//     api.request(config.GetFoodCook_WXList, data, 'POST', header).then(function (res) {
//       var e = res
//       if (e.meta.Code == 200) {
//         that.setData({
//           commodityList: e.data.foodCookInfo == null ? [] : e.data.foodCookInfo
//         })
//         resove(true);
//       } else {
//         wx.showToast({
//           title: res.Msg,
//           duration: 2000,
//           icon: "none",
//           mask: true
//         })
//         reject(false)
//       }
//     }).catch((res) => {
//       wx.showToast({
//         title: res.Msg,
//         duration: 2000,
//         icon: "none",
//         mask: true
//       })
//       reject(false)
//     })
//   })
// }
//获取商品类别
// function GetFoodType(_this) {
//   var that = _this
//   return new Promise((resove, reject) => {
//     let data = {
//       pagenum: 1,
//       pagesize: 100
//     }
//     let header = {}
//     api.request(config.GetFoodTypeList, data, 'POST', header).then(function (res) {
//       var e = res
//       if (e.meta.Code == 200) {
//         that.setData({
//           commodity: e.data.foodTypeInfo == null ? [] : e.data.foodTypeInfo
//         })
//         resove(true);
//       } else {
//         wx.showToast({
//           title: res.Msg,
//           duration: 2000,
//           icon: "none",
//           mask: true
//         })
//         reject(false)
//       }
//     }).catch((res) => {
//       wx.showToast({
//         title: res.Msg,
//         duration: 2000,
//         icon: "none",
//         mask: true
//       })
//       reject(false)
//     })
//   })
// }