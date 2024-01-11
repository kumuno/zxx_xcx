var util = require('../../../utils/utils');
var api = require('../../../config/api.js');

const app = getApp()

Page({
    data: {
        goodsList: [],
    },
    onLoad: function (options) {
        console.log("addType:" + options.addType);
        this.getGoodsList(options);
    },
    getGoodsList: function (options) {
        let that = this;
        if(options.addType==0){// 0：正常加入购物车，1:立即购买，2:再来一单
        util.request(api.OrderGetGoods, { //用正常加入购物车的方式进入订单信息确认的时候查看具体商品信息
            openId: wx.getStorageSync('openId'),
        }).then(function (res) {
            console.log("res.shopCarts:",res.shopCarts);
            that.setData({
                goodsList: res.shopCarts
            });
        });
        }else if(options.addType ==1){//用直接购买的方式进入订单信息确认的时候查看具体商品信息
            console.log(that.options);
            util.request(api.OrderDirectGetGoods, {
                commodity_id: that.options.commodity_id,//商品id
                attribute_id: that.options.attribute_id,//商品属性id
                sonAttribute_id: that.options.sonAttribute_id,//商品子属性
                number: that.options.number,//购买数量
            }).then(function (res) {
                console.log(res);
                that.setData({
                    goodsList: res.shopCarts
                });
            });
        }else{//在订单详情查看具体商品信息options.addType==null
            // console.log(options.orderId);
            util.request(api.OrderGoods, { 
                order_id: options.orderId,
            }).then(function (res) {
                console.log("res:",res);
                if (res.code ==0) {
                    that.setData({
                        goodsList: res.data.orderGoodsList
                    });    
                }
            });
        }

    }
})