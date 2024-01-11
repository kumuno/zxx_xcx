var util = require('../../../utils/utils');
var api = require('../../../config/api');
// const pay = require('../../../services/pay.js');
const app = getApp()
// 触底上拉刷新 TODO 这里要将page传给服务器，作者没写
Page({
    data: {
        orderList: [], //所有订单
        listGoodName: '', //订单的所有商品名称
        allPage: 1, //当前页面
        allCount: 0, //一共有多少个订单
        size: 5, //一页显示5个订单
        showType: 9, //订单类型的标志
        hasOrder: 0, //判断是否有订单存在
        showTips: 0, //判断页面是否到底了
        status: {} //订单类型（待支付、待发货、待收货）
    },
    //查看订单详情
    toOrderDetails: function (e) {
        let orderId = e.currentTarget.dataset.orderid;
        wx.setStorageSync('orderId', orderId)
        wx.navigateTo({
            url: '/pages/order/order-details/order-details?orderId=' + orderId,
        })
    },
    //继续支付
    payOrder: function (e) {
        let orderId = e.currentTarget.dataset.orderid;
        let that = this;
        let actualPrice = e.currentTarget.dataset.actualprice;
        console.log("支付金额：", actualPrice);
        let index = e.currentTarget.dataset.index; //选择订单的下标
        console.log("选择订单的下标：", index);
        var listGoodName = [];
        for (let i = 0; i < that.data.orderList[index].orderItem.length; i++) {
            listGoodName.push(that.data.orderList[index].orderItem[i].orderItem_goodname);
        }
        console.log("listGoodName:", listGoodName);
        wx.login({
            success(res) {
                if (res.code) {
                    wx.request({
                        url: 'http://119.29.13.56:28079/pay', //仅为示例，并非真实的接口地址
                        data: {
                            totalFee: actualPrice,
                            code: res.code,
                            listGoodName: listGoodName
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
                                        orderId: orderId
                                    }).then(function (res) {
                                        console.log(res);
                                        if (res.code == 0) {
                                            let showType = wx.getStorageSync('showType');
                                            that.setData({
                                                showType: showType,
                                                orderList: [],
                                                allPage: 1,
                                                allCount: 0,
                                                size: 5
                                            });
                                            that.getOrderList();
                                            that.getOrderInfo();
                                        }
                                    });
                                },
                                fail(res) {
                                    console.log("支付失败:", res.errMsg);
                                    util.showErrorToast("支付失败");
                                }
                            })
                        }
                    })
                }
            }
        })

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
    getOrderList() {
        let that = this;
        util.request(api.OrderList, {
            openId: wx.getStorageSync('openId'),
            showType: that.data.showType, //订单类型
        }).then(function (res) {
            console.log(res);
            if (res.code === 0) {
                let count = res.data.count;
                that.setData({
                    allCount: count,
                    // allPage: res.data.currentPage,
                    orderList: res.data.orderList,
                });
                if (count == 0) {
                    that.setData({
                        hasOrder: 1
                    });
                }
            }
        });
    },
    toIndexPage: function (e) {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    onLoad: function () {},
    onShow: function () {
        let showType = wx.getStorageSync('showType');
        let nowShowType = this.data.showType;
        let doRefresh = wx.getStorageSync('doRefresh');
        if (nowShowType != showType || doRefresh == 1) {
            this.setData({
                showType: showType,
                orderList: [],
                allPage: 1,
                allCount: 0,
                size: 5
            });
            this.getOrderList();
            wx.removeStorageSync('doRefresh');
        }
        this.getOrderInfo();
    },
    //跳转上面导航栏
    switchTab: function (event) {
        let showType = event.currentTarget.dataset.index;
        wx.setStorageSync('showType', showType);
        this.setData({
            showType: showType,
            orderList: [],
            allPage: 1,
            allCount: 0,
            size: 5
        });
        this.getOrderInfo();
        this.getOrderList();
    },
    // “取消订单”点击效果
    cancelOrder: function (e) {
        let that = this;
        let orderId = e.currentTarget.dataset.index;
        wx.showModal({
            title: '',
            content: '确定要取消此订单？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.OrderCancel, {
                        orderId: orderId
                    }, 'POST').then(function (res) {
                        if (res.errno === 0) {
                            wx.showToast({
                                title: '取消订单成功'
                            });
                            that.setData({
                                orderList: [],
                                allPage: 1,
                                allCount: 0,
                                size: 5
                            });
                            that.getOrderList();
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },

    //触底加载事件,触发分页
    onReachBottom: function () {
        let that = this;
        if (that.data.allCount / that.data.size < that.data.allPage) {
            that.setData({
                showTips: 1
            });
            return false;
        }
        that.setData({
            'allPage': that.data.allPage + 1
        });
        that.getOrderList();
    }
})