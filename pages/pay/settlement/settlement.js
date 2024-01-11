var util = require('../../../utils/utils');
var api = require('../../../config/api.js');
// const pay = require('../../services/pay.js');
Page({
    data: {
        checkedGoodsList: [{
            commodity_id: 1,
            shopcart_amount: 10,
            commodity_name: '水果',
            commodity_price: '149.5',
            commodity_img: "/images/nav/test.jpg",
            commodity_introduce: "介绍",
            Attribute_id: "属性id",
            commodity_state: "1", //判断是否上架
            select: true, //判断是否选中 true是 false否
        }],
        checkedAddress: {},
        goodsTotalPrice: 0.00, //商品总价也就是cartTotal.checkedGoodsAmount
        freightPrice: 0.00, //快递费
        orderTotalPrice: 0.00, //订单总价
        actualPrice: 0.00, //实际需要支付的总价
        addressId: 0,
        addType: '', //1是不通过加入购物车购买，0是在购物车购买
        //直接购买时候，有用到下面四个变量
        commodity_id: 0, //商品id
        attribute_id: 0, //商品属性id
        sonAttribute_id: 0, //商品子属性id
        number: 0, //用户直接购买的商品数量
        goodsCount: 0, //也就是选中的商品总数量cartTotal.checkedGoodsCount
        postscript: '', //订单备注
        outStock: 0,
        orderId: '', //后端生成的总订单号
        listGoodName: '', //后端生成的所有商品名称
    },
    //查看商品详情（可删除可重写）
    toGoodsList: function (e) {
        let that = this;
        if (that.data.addType == 0) {
            wx.navigateTo({
                url: '/pages/pay/goods-list/index?addType=' + that.data.addType,
            });
        } else if (that.data.addType == 1) {
            wx.navigateTo({
                url: '/pages/pay/goods-list/index?addType=' + that.data.addType + '&commodity_id=' + that.data.commodity_id + '&attribute_id=' + that.data.attribute_id + '&sonAttribute_id=' + that.data.sonAttribute_id + '&number=' + that.data.number,
            });
        }

    },
    //选择地址
    toSelectAddress: function (event) {
        let address_id = event.currentTarget.dataset.address_id;
        console.log("address_id:", address_id);
        wx.navigateTo({
            url: '/pages/mine-details/address/address?type=1' + '&address_id=' + address_id,
        });
    },
    //添加地址
    toAddAddress: function () {
        wx.navigateTo({
            url: '/pages/ucenter/address-add/index',
        })
    },
    //获取备注
    bindinputMemo(event) {
        let postscript = event.detail.value;
        this.setData({
            postscript: postscript
        });
    },
    //更新页面信息
    onLoad: function (options) {
        let addType = options.addtype;
        // let orderFrom = options.orderFrom;
        if (addType != undefined) {
            if (addType == 0) {
                this.setData({
                    addType: addType
                })
            } else if (addType == 1) {
                console.log("commodity_id:", options.commodity_id);
                console.log("attribute_id:", options.attribute_id);
                console.log("sonAttribute_id:", options.sonAttribute_id);
                console.log("number:", options.number);
                this.setData({
                    addType: addType,
                    commodity_id: options.commodity_id,
                    attribute_id: options.attribute_id,
                    sonAttribute_id: options.sonAttribute_id,
                    number: options.number
                })
            }

        }
        // if (orderFrom != undefined) {
        //     this.setData({
        //         orderFrom: orderFrom
        //     })
        // }
    },
    onUnload: function () {
        // wx.removeStorageSync('addressId');
    },
    onShow: function () {
        // 页面显示
        // TODO结算时，显示默认地址，而不是从storage中获取的地址值
        try {
            var addressId = wx.getStorageSync('addressId');
            if (addressId == 0 || addressId == '') {
                addressId = '';
            }
            this.setData({
                'addressId': addressId
            });
        } catch (e) {}
        this.getCheckoutInfo();
        this.getAddressInfo();
    },
    onPullDownRefresh: function () {
        wx.showNavigationBarLoading()
        try {
            var addressId = wx.getStorageSync('addressId');
            if (addressId == 0 || addressId == '') {
                addressId = 0;
            }
            this.setData({
                'addressId': addressId
            });
        } catch (e) {
            // Do something when catch error
        }
        this.getCheckoutInfo();
        this.getAddressInfo();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },

    //获取收货地址的信息
    getAddressInfo: function () {
        let that = this;
        let addressId = that.data.addressId;
        console.log("addressId:", addressId);
        util.request(api.OrderGetAddress, {
            addressId: addressId, //收货地址id
            openId: wx.getStorageSync('openId'),
        }).then(function (res) {
            console.log(res);
            that.setData({
                checkedAddress: res,
            });
        });
    },


    //获取下单商品的信息
    getCheckoutInfo: function () {
        let that = this;
        let addType = that.data.addType;
        console.log("addType", addType); // 0：正常加入购物车，1:立即购买，2:再来一单
        if (addType == 0) { //购物车购买
            util.request(api.OrderGetGoods, {
                openId: wx.getStorageSync('openId'),
            }).then(function (res) {
                console.log(res);
                that.setData({
                    checkedGoodsList: res.shopCarts,
                    freightPrice: 0, //运费价格
                    goodsTotalPrice: res.checkedGoodsAmount, //商品总价
                    actualPrice: res.checkedGoodsAmount + 0, //实际支付
                    goodsCount: res.checkedGoodsCount, //商品数量
                });
            });
        } else if (addType == 1) { //直接购买
            util.request(api.OrderDirectGetGoods, {
                commodity_id: that.data.commodity_id, //商品id
                attribute_id: that.data.attribute_id, //商品属性id
                sonAttribute_id: that.data.sonAttribute_id, //商品子属性
                number: that.data.number, //购买数量
            }).then(function (res) {
                console.log(res);
                that.setData({
                    checkedGoodsList: res.shopCarts,
                    freightPrice: 0, //运费价格 
                    goodsTotalPrice: res.checkedGoodsAmount, //商品总价
                    actualPrice: res.checkedGoodsAmount + 0, //实际支付
                    goodsCount: res.checkedGoodsCount, //商品数量
                });
            });
        }

    },


    // TODO 有个bug，用户没选择地址，支付无法继续进行，在切换过token的情况下
    //提交订单
    submitOrder: function (e) {
        if (this.data.addressId <= 0) {
            util.showErrorToast('请选择收货地址');
            return false;
        }
        let that = this;
        let checkedGoodsList = this.data.checkedGoodsList;
        let addressId = this.data.addressId;
        let postscript = this.data.postscript;
        let freightPrice = this.data.freightPrice;
        let actualPrice = this.data.actualPrice;
        let goodsTotalPrice = this.data.goodsTotalPrice;
        let addType = this.data.addType;
        console.log("actualPrice:", actualPrice);
        console.log("goodsTotalPrice:", goodsTotalPrice);
        let goodsCount = this.data.goodsCount;
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        setTimeout(function () {
            wx.hideLoading()
        }, 2000)
        util.request(api.OrderSubmit, {
            checkedGoodsList: checkedGoodsList, //购买的商品信息
            openId: wx.getStorageSync('openId'),
            addressId: addressId, //地址id
            postscript: postscript, //备注信息
            freightPrice: freightPrice, //运费
            goodsTotalPrice: goodsTotalPrice, //商品总价钱
            actualPrice: actualPrice, //实际支付价钱
            goodsCount: goodsCount, //总商品数量
            addType: addType // 0：正常加入购物车，1:立即购买(判断是否要删除购物车信息)
        }).then(res => {
            if (res.code === 0) { //生成订单成功就跳到微信支付
                that.setData({
                    orderId: res.data.orderId,
                    listGoodName: res.data.listGoodName
                });
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
                                                    wx.redirectTo({
                                                        url: '/pages/pay/pay_result/pay_result?status=1&orderId=' + that.data.orderId + '&totalFee=' + actualPrice + '&listGoodName' + that.data.listGoodName
                                                    });
                                                }
                                            });
                                        },
                                        fail(res) {
                                            console.log("支付失败:", res.errMsg);
                                            wx.redirectTo({
                                                url: '/pages/pay/pay_result/pay_result?status=0&orderId=' + that.data.orderId + '&totalFee=' + actualPrice + '&listGoodName=' + that.data.listGoodName
                                            });
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            } else {
                util.showErrorToast(res.errmsg);
            }
            wx.hideLoading()
        });
    },
})