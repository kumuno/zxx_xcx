var util = require('../../../utils/utils');
var api = require('../../../config/api');
var timer = require('../../../utils/wxTimer');
var remaintimer = require('../../../utils/remainTime');
// const pay = require('../../../services/pay.js');
const app = getApp()
Page({
    data: {
        orderId: 0, //订单编号
        orderInfo: {},
        orderGoods: [],
        handleOption: {},
        textCode: {},
        goodsCount: 0,
        addressId: 0,
        postscript: '',
        hasPay: 0,
        success: 0,
        imageUrl: '',
        wxTimerList: {},
        express: {},
        onPosting: 0,
        userInfo: {}
    },
    // 申请退款方法
    toOrderDelete: function (e) {
        let that = this;
        let orderId = this.data.orderId;
        let actualprice = e.currentTarget.dataset.actualprice;
        let orderaccount = e.currentTarget.dataset.orderaccount;
        //首先将json对象转化为json格式的字符串
        var orderGoods = JSON.stringify(that.data.orderGoods);
        //然后将字符串编码为URI组件，因为json字符串里会有特殊字符会干扰页面对uri的解析
        var item = encodeURIComponent(orderGoods);
        console.log("当前的订单号是：", orderId);
        console.log("当前的退款金额是：", actualprice);
        console.log("当前的总商品数量是：", orderaccount);
        console.log("当前的商品信息是：", orderGoods);
        wx.redirectTo({
            url: '/pages/order/order_delete/order_delete?orderId=' + orderId + '&actualprice=' + actualprice + '&orderGoods=' + item + '&orderaccount=' + orderaccount,
        })

    },
    // 再来一单方法
    // reOrderAgain: function () {
    //     let orderId = this.data.orderId
    //     wx.redirectTo({
    //         url: '/pages/order-check/index?addtype=2&orderFrom=' + orderId
    //     })
    // },
    copyText: function (e) {
        let data = e.currentTarget.dataset.text;
        wx.setClipboardData({
            data: data,
            success(res) {
                wx.getClipboardData({
                    success(res) {}
                })
            }
        })
    },
    toGoodsList: function (e) {
        let orderId = this.data.orderId;
        // console.log("orderId",orderId);
        wx.navigateTo({
            url: '/pages/pay/goods-list/index?orderId=' + orderId,
        });
    },
    toExpressInfo: function (e) {
        let orderId = this.data.orderId;
        wx.navigateTo({
            url: '/pages/ucenter/express-info/index?id=' + orderId,
        });
    },
    toRefundSelect: function (e) {
        wx.navigateTo({
            url: '/pages/refund-select/index',
        });
    },

    //继续支付
    payOrder: function (e) {
        let that = this;
        let orderId = that.data.orderId;
        let actualPrice = e.currentTarget.dataset.actualprice;
        console.log("支付金额：", actualPrice);
        var listGoodName = [];
        for (let i = 0; i < that.data.orderGoods.length; i++) {
            listGoodName.push(that.data.orderGoods[i].orderItem_goodname);
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
                                            util.request(api.orderUpdateRemark, { //修改总订单备注
                                                user_id: wx.getStorageSync('openId'),
                                                order_id: orderId,
                                                order_remark: that.data.postscript
                                            }).then(function (res) {
                                                console.log(res);
                                                if (res.code == 0) {
                                                    that.getOrderDetail(); //支付成功更新订单详情页面数据
                                                }
                                            });
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
    toSelectAddress: function () {
        let orderId = this.data.orderId;
        wx.navigateTo({
            url: '/pages/ucenter/address-select/index?id=' + orderId,
        });
    },
    onLoad: function (options) {
        let orderId = options.orderId;
        console.log("订单号：", orderId);
        this.setData({
            orderId: orderId
        })
    },
    onShow: function () {
        var orderId = wx.getStorageSync('orderId');
        let userInfo = wx.getStorageSync('userInfo');
        this.setData({
            orderId: orderId,
            userInfo: userInfo
        });
        wx.showLoading({
            title: '加载中...',
        })
        this.getOrderDetail();
        // this.getExpressInfo();
    },
    //onUnload：页面被卸载，例如使用 wx.redirectTo  重定向一个页面 原页面已经关闭
    onUnload: function () {
        let oCancel = this.data.handleOption.cancel;
        if (oCancel == true) {
            let orderTimerID = this.data.wxTimerList.orderTimer.wxIntId;
            clearInterval(orderTimerID);
        }
    },
    //onHide：页面隐藏，例如使用 wx.navigateTo  只是打开新页面  并不关闭原页面
    onHide: function () {
        let oCancel = this.data.handleOption.cancel;
        if (oCancel == true) {
            let orderTimerID = this.data.wxTimerList.orderTimer.wxIntId;
            clearInterval(orderTimerID);
        }
    },
    orderTimer: function (endTime) {
        let that = this;
        var orderTimerID = '';
        let wxTimer2 = new timer({
            endTime: endTime,
            name: 'orderTimer',
            id: orderTimerID,
            complete: function () {
                that.letOrderCancel(); //自动取消订单
            },
        })
        wxTimer2.start(that);
    },
    bindinputMemo(event) {
        let postscript = event.detail.value;
        this.setData({
            postscript: postscript
        });
    },
    getExpressInfo: function () {
        this.setData({
            onPosting: 0
        })
        let that = this;
        util.request(api.OrderExpressInfo, {
            orderId: that.data.orderId
        }).then(function (res) {
            if (res.errno === 0) {
                let express = res.data;
                express.traces = JSON.parse(res.data.traces);
                that.setData({
                    onPosting: 1,
                    express: express
                });
            }
        });
    },
    getOrderDetail: function () {
        let that = this;
        util.request(api.OrderDetail, {
            order_id: that.data.orderId
        }).then(function (res) {
            console.log(res);
            if (res.code === 0) {
                that.setData({
                    orderInfo: res.data.orderInformation,
                    orderGoods: res.data.orderInformation.orderItem,
                    handleOption: res.data.handleOption,
                    textCode: res.data.textCode,
                    // goodsCount: res.data.goodsCount
                });
                let receive = res.data.handleOption.confirm;
                if (receive == true) {
                    let confirm_remainTime = res.data.orderInformation.order_predict_predictTime;
                    remaintimer.reTime(confirm_remainTime, 'c_remainTime', that);
                    console.log("预计到达时间：", that.data.c_remainTime.minute);
                    if (that.data.c_remainTime.day <=0&&that.data.c_remainTime.hour<=0&&that.data.c_remainTime.minute <= 0) {
                        util.request(api.orderToArrive, { //修改订单状态为已收货
                            user_id: wx.getStorageSync('openId'),
                            order_id: that.data.orderId,
                        }).then(function (res) {
                            console.log(res);
                            if (res.code == 0) {
                                wx.showModal({
                                    title: "该订单已自动收货",
                                    content: "若有疑问，请联系客服人员",
                                    confirmText: "知道啦",
                                    showCancel: false,
                                    success(res) {
                                        if (res.confirm) {
                                            wx.switchTab({
                                                url: '/pages/mine/mine'
                                            })
                                        } else if (res.cancel) {
                                            wx.switchTab({
                                                url: '/pages/mine/mine'
                                            })
                                        }
                                    }
                                });
                            }
                        });
                    }
                }
                let oCancel = res.data.handleOption.cancel;
                let payTime = 0;
                if (oCancel == true) {
                    //15分钟后不支付，取消订单
                    payTime = res.data.orderInformation.order_createTime + 15 * 60 * 1000 //需要把时间单位换成ms
                    console.log(payTime);
                    that.orderTimer(payTime);
                }
            }
        });
        wx.hideLoading();
    },
    //自动取消订单
    letOrderCancel: function () {
        let that = this;
        util.request(api.OrderCancel, {
            order_id: that.data.orderId,
            user_id: wx.getStorageSync('openId'),
        }).then(function (res) {
            console.log(res);
            if (res.code === 0) {
                // that.getOrderDetail();
                wx.showModal({
                    title: "该订单已过期",
                    content: "请重新下单后及时进行支付，避免订单过期",
                    confirmText: "知道啦",
                    showCancel: false,
                    success(res) {
                        if (res.confirm) {
                            wx.switchTab({
                                url: '/pages/mine/mine'
                            })
                        } else if (res.cancel) {
                            wx.switchTab({
                                url: '/pages/mine/mine'
                            })
                        }
                    }

                })

            } else {
                util.showErrorToast(res.errmsg);
            }
        });
    },
    // “删除”点击效果
    deleteOrder: function () {
        let that = this;
        wx.showModal({
            title: '',
            content: '确定要删除此订单？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.OrderCancel, {
                        order_id: that.data.orderId,
                        user_id: wx.getStorageSync('openId'),
                    }).then(function (res) {
                        if (res.code === 0) {
                            wx.navigateBack();
                            wx.showToast({
                                title: '删除订单成功'
                            });
                            wx.removeStorageSync('orderId');
                            wx.setStorageSync('doRefresh', 1);
                            wx.navigateBack();
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },
    // “确认收货”点击效果
    confirmOrder: function () {
        let that = this;
        wx.showModal({
            title: '',
            content: '收到货了？确认收货？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.orderToArrive, { //修改订单状态为已收货
                        user_id: wx.getStorageSync('openId'),
                        order_id: that.data.orderId,
                    }).then(function (res) {
                        if (res.code === 0) {
                            wx.showToast({
                                title: '确认收货成功！'
                            });
                            wx.setStorageSync('doRefresh', 1);
                            that.getOrderDetail();
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },
    // “取消订单”点击效果
    cancelOrder: function (e) {
        let that = this;
        wx.showModal({
            title: '',
            content: '确定要取消此订单？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.OrderCancel, {
                        order_id: that.data.orderId,
                        user_id: wx.getStorageSync('openId'),
                    }).then(function (res) {
                        if (res.code === 0) {
                            wx.navigateBack();
                            wx.showToast({
                                title: '取消订单成功'
                            });
                            wx.setStorageSync('doRefresh', 1);
                            let orderTimerID = that.data.wxTimerList.orderTimer.wxIntId;
                            clearInterval(orderTimerID);
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },
})