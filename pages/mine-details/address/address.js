var util = require('../../../utils/utils');
var api = require('../../../config/api');
// const pay = require('../../../services/pay.js');
const app = getApp()
Page({
    data: {
        type:0,
        addresses: [],
        region: [],
        nowAddress: 0
    },
    goAddressDetail: function (e) {
        let id = e.currentTarget.dataset.addressid;
        console.log("进入修改地址：" + id);
        wx.navigateTo({
            url: '/pages/mine-details/address-details/address-details?id=' + id + '&&revise=' + 1,
        })
    },
    getAddresses() {
        let that = this;
        util.request(api.AddressListnew + wx.getStorageSync('openId')).then(function (res) {
            console.log("用户所有地址信息:", res)
            that.setData({
                addresses: res,
            })
        });
    },
    selectAddress: function (e) {
        let addressId = e.currentTarget.dataset.addressid
        // console.log("addressId", addressId);
        wx.setStorageSync('addressId', addressId);
        wx.navigateBack();
    },
    onLoad: function (options) {
        wx.setStorageSync('addressId', options.address_id);//直接传地址id过来，为了点亮打勾图标
        let type = options.type;
        this.setData({
            type: type
        })
    },
    onUnload: function () {},
    onShow: function () {
        this.getAddresses();
        let addressId = wx.getStorageSync('addressId');
        if (addressId) {
            this.setData({
                nowAddress: wx.getStorageSync('addressId')
            });
        } else {
            this.setData({
                nowAddress: 0
            });
        }
    },
    addAddress: function () {
        wx.navigateTo({
            url: '/pages/mine-details/address-details/address-details?id=' + 0 + '&&revise=' + 0,
        })
    },
    onPullDownRefresh: function () {
        wx.showNavigationBarLoading()
        this.getAddresses();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    }
})