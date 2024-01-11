var app = getApp();
var WxParse = require('../../lib/wxParse/wxParse.js');
var util = require('../../utils/utils');
// var timer = require('../../utils/wxTimer.js');
var api = require('../../config/api.js');
// const user = require('../../services/user.js');
Page({
    data: {
        id: 0,
        //一个商品的所有信息
        commodity: [],
        //商品属性
        commodityAttribute: {},
        //商品子属性
        commoditySonAttribute: [],
        //商品规格选择定点
        good_index: 0,
        //商品属性id
        Attribute_id: 0,
        //选择商品的名称
        good_name: '请选择规格和数量',
        //选择商品的价格
        good_price: {},
        //选择商品的库存量
        good_number: '有货',
        //判断是否已经选择规格
        priceChecked: false,
        //商品轮播图照片
        gallery: [],
        current: 0,
        loading: 0,
        shipAddress: {},
        //选择商品时要加入购物车的数量
        number: 1,
        //判断选择的数量大于库存量，true表示最大限制
        disabled: '',
        carGoods: [], //商品列表
        cartGoodsCount: 0, //用户购物车中商品总数
        userInfo: {}, //用户信息，用来判断登陆状态
        goods: {},
        galleryImages: [],
        specificationList: [],
        checkedSpecPrice: 0,
        checkedSpecText: '',
        tmpSpecText: '请选择规格和数量',
        openAttr: false, //默认用户关闭规格窗口
        soldout: false, //检验库存是否售罄
        alone_text: '单独购买',
        userId: 0, //用户ID，作为绑定分享信息
        goodsNumber: 0, //当前商品对应数量（不确定是库存量还是购买数量）
        showShareDialog: 0, //未知
        autoplay: true
    },
    hideDialog: function (e) {
        let that = this;
        that.setData({
            showShareDialog: false,
        });
    },
    shareTo: function () {
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo == '') {
            util.loginNow();
            return false;
        } else {
            this.setData({
                showShareDialog: !this.data.showShareDialog,
            });
        }
    },
    createShareImage: function () {
        let id = this.data.id;
        wx.navigateTo({
            url: '/pages/share/index?goodsid=' + id
        })
    },
    previewImage: function (e) {
        let current = e.currentTarget.dataset.src;
        let that = this;
        wx.previewImage({
            current: current, // 当前显示图片的http链接  
            urls: that.data.galleryImages // 需要预览的图片http链接列表  
        })
    },
    bindchange: function (e) {
        let current = e.detail.current;
        this.setData({
            current: current
        })
    },
    inputNumber(event) {
        let number = event.detail.value;
        let good_number = this.data.good_number;
        if (good_number >= number) {
            this.setData({
                number: number
            });
        } else {
            wx.showToast({
                title: '库存不足',
                image: '/images/icon/error.png',
            })
            this.setData({
                number: 1
            });
        }
    },
    goIndex: function () {
        wx.switchTab({
            url: '/pages/index/index',
        })
    },
    onShareAppMessage: function (res) {
        let id = this.data.id;
        let name = this.data.goods.name;
        let image = this.data.goods.list_pic_url;
        let userId = this.data.userId;
        return {
            title: name,
            path: '/pages/goods/goods?id=' + id + '&&userId=' + userId,
            imageUrl: image
        }
    },
    onUnload: function () {},
    handleTap: function (event) { //阻止冒泡 
    },
    getGoodsInfo: function () {
        let that = this;
        util.request(api.GoodsDetail, {
            id: that.data.id
        }).then(function (res) {
            console.log(res);
            if (res.errno === 0) {
                let _specificationList = res.data.specificationList;
                // 如果仅仅存在一种货品，那么商品页面初始化时默认checked
                if (_specificationList.valueList.length == 1) {
                    _specificationList.valueList[0].checked = true
                    that.setData({
                        checkedSpecText: '已选择：' + _specificationList.valueList[0].value,
                        tmpSpecText: '已选择：' + _specificationList.valueList[0].value,
                    });
                } else {
                    that.setData({
                        checkedSpecText: '请选择规格和数量'
                    });
                }
                let galleryImages = [];
                for (const item of res.data.gallery) {
                    galleryImages.push(item.img_url);
                }
                that.setData({
                    goods: res.data.info,
                    goodsNumber: res.data.info.goods_number,
                    gallery: res.data.gallery,
                    specificationList: res.data.specificationList,
                    productList: res.data.productList,
                    checkedSpecPrice: res.data.info.retail_price,
                    galleryImages: galleryImages,
                    loading: 1
                });
                setTimeout(() => {
                    WxParse.wxParse('goodsDetail', 'html', res.data.info.goods_desc, that);
                }, 1000);
                wx.setStorageSync('goodsImage', res.data.info.https_pic_url);
            } else {
                util.showErrorToast(res.errmsg)
            }
        });
    },
    clickSkuValue: function (event) {
        // goods_specification中的id 要和product中的goods_specification_ids要一样
        let that = this;
        let sonAttribute_id = event.currentTarget.dataset.id;
        let attribute_name = event.currentTarget.dataset.name;
        let commodity_price = event.currentTarget.dataset.price;
        let commodity_number = event.currentTarget.dataset.number;
        let Attribute_id = event.currentTarget.dataset.attributeid;
        console.log(sonAttribute_id)
        console.log(attribute_name)
        console.log(commodity_price)
        console.log(commodity_number)
        console.log(Attribute_id)
        that.setData({
            good_index: sonAttribute_id,
            Attribute_id: Attribute_id,
            good_name: '已选择  -  ' + attribute_name,
            good_price: commodity_price,
            good_number: commodity_number,
            priceChecked: true,
            number: 1
        });

        //判断是否可以点击
        // let _specificationList = this.data.specificationList;
        // if (_specificationList.specification_id == specNameId) {
        //     for (let j = 0; j < _specificationList.valueList.length; j++) {
        //         if (_specificationList.valueList[j].id == specValueId) {
        //             //如果已经选中，则反选
        //             if (_specificationList.valueList[j].checked) {
        //                 _specificationList.valueList[j].checked = false;
        //             } else {
        //                 _specificationList.valueList[j].checked = true;
        //             }
        //         } else {
        //             _specificationList.valueList[j].checked = false;
        //         }
        //     }
        // }
        // this.setData({
        //     'specificationList': _specificationList
        // });
        //重新计算spec改变后的信息
        this.changeSpecInfo();

        //重新计算哪些值不可以点击
    },
    //获取选中的规格信息
    getCheckedSpecValue: function () {
        // let checkedValues = [];
        // //_specificationList 商品规格
        // let _specificationList = this.data.commoditySonAttribute;
        // let _checkedObj = {
        //     nameId: _specificationList.specification_id,
        //     valueId: 0,
        //     valueText: ''
        // };
        // for (let j = 0; j < _specificationList.valueList.length; j++) {
        //     if (_specificationList.valueList[j].checked) {
        //         _checkedObj.valueId = _specificationList.valueList[j].id;
        //         _checkedObj.valueText = _specificationList.valueList[j].value;
        //     }
        // }
        // checkedValues.push(_checkedObj);
        // return checkedValues;
    },
    //根据已选的值，计算其它值的状态
    setSpecValueStatus: function () {

    },
    //判断规格是否选择完整
    isCheckedAllSpec: function () {
        return !this.getCheckedSpecValue().some(function (v) {
            if (v.valueId == 0) {
                return true;
            }
        });
    },
    getCheckedSpecKey: function () {
        let checkedValue = this.getCheckedSpecValue().map(function (v) {
            return v.valueId;
        });
        return checkedValue.join('_');
    },
    changeSpecInfo: function () {
        // let checkedNameValue = this.getCheckedSpecValue();
        // this.setData({
        //     disabled: '',
        //     number: 1
        // });
        // //设置选择的信息
        // let checkedValue = checkedNameValue.filter(function(v) {
        //     if (v.valueId != 0) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // }).map(function(v) {
        //     return v.valueText;
        // });
        // if (checkedValue.length > 0) {
        //     this.setData({
        //         tmpSpecText: '已选择：' + checkedValue.join('　'),
        //         priceChecked: true

        //     });
        // } else {
        //     this.setData({
        //         tmpSpecText: '请选择规格和数量',
        //         priceChecked: false
        //     });
        // }

        // if (this.isCheckedAllSpec()) {
        //     this.setData({
        //         checkedSpecText: this.data.tmpSpecText
        //     });

        //     // 点击规格的按钮后
        //     // 验证库存
        //     let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
        //     if (!checkedProductArray || checkedProductArray.length <= 0) {
        //         this.setData({
        //             soldout: true
        //         });
        //         // console.error('规格所对应货品不存在');
        //         wx.showToast({
        //             image: '/images/icon/icon_error.png',
        //             title: '规格所对应货品不存在',
        //         });
        //         return;
        //     }
        //     let checkedProduct = checkedProductArray[0];
        //     if (checkedProduct.goods_number < this.data.number) {
        //         //找不到对应的product信息，提示没有库存
        //         this.setData({
        //             checkedSpecPrice: checkedProduct.retail_price,
        //             goodsNumber: checkedProduct.goods_number,
        //             soldout: true
        //         });
        //         wx.showToast({
        //             image: '/images/icon/icon_error.png',
        //             title: '库存不足',
        //         });
        //         return false;
        //     }
        //     if (checkedProduct.goods_number > 0) {
        //         this.setData({
        //             checkedSpecPrice: checkedProduct.retail_price,
        //             goodsNumber: checkedProduct.goods_number,
        //             soldout: false
        //         });

        //         var checkedSpecPrice = checkedProduct.retail_price;

        //     } else {
        //         this.setData({
        //             checkedSpecPrice: this.data.goods.retail_price,
        //             soldout: true
        //         });
        //     }
        // } else {
        //     this.setData({
        //         checkedSpecText: '请选择规格和数量',
        //         checkedSpecPrice: this.data.goods.retail_price,
        //         soldout: false
        //     });
        // }
    },
    getCheckedProductItem: function (key) {
        return this.data.productList.filter(function (v) {
            if (v.goods_specification_ids == key) {
                return true;
            } else {
                return false;
            }
        });
    },



    onLoad: function (options) {
        let id = 0;
        var scene = decodeURIComponent(options.scene);
        if (scene != 'undefined') {
            id = scene;
        } else {
            id = options.id;
        }
        this.setData({
            id: id, // 这个是商品id
            valueId: id,
        });
    },
    onShow: function () {
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
            // priceChecked: false,
            sysHeight: sysHeight
        })
        this.getGoodInformation();
        // this.getGoodsInfo();
        this.getCartCount();
    },


    getGoodInformation: function () {
        let that = this;
        console.log(this.data.id);
        util.request(api.GoodsDetailnew + this.data.id).then(function (res) {
            console.log(res);
            let commodity_carousel_Img = res.commodity_carousel_Img;
            var array = [];
            array = commodity_carousel_Img.split("--");
            console.log(array);
            that.setData({
                commodity: res,
                gallery: array,
                commodityAttribute: res.commodityAttribute,
                loading: 1,
            });
        });
        util.request(api.GoodSpecs + this.data.id).then(function (res) {
            console.log(res);
            that.setData({
                commoditySonAttribute: res,
            });
        });
        // util.request(api.AddressDetailnew + this.data.id).then(function (res) {
        //     console.log(res);
        //     that.setData({
        //         shipAddress: res,
        //     });
        // });

    },

    onHide: function () {
        this.setData({
            autoplay: false
        })
    },
    //获取用户购物车商品总数
    getCartCount: function () {
        let that = this;
        util.request(api.CartGoodsCount,{
            openId:wx.getStorageSync('openId')
        }).then(function (res) {
            // console.log(res);
            if (res.errno === 0) {
                if (res.cartGoodsCount == null) {
                    that.setData({
                        cartGoodsCount: 0
                    });
                }else{
                    that.setData({
                        cartGoodsCount: res.cartGoodsCount
                    });
                }
            }
        });
    },
    onPullDownRefresh: function () {
        wx.showNavigationBarLoading()
        this.getGoodsInfo();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },
    openCartPage: function () {
        wx.switchTab({
            url: '/pages/cart/cart',
        });
    },
    goIndexPage: function () {
        wx.switchTab({
            url: '/pages/index/index',
        });
    },
    OpenAttrPop: function () {
        if (this.data.openAttr == false) {
            this.setData({
                openAttr: !this.data.openAttr
            });
        }
    },
    switchAttrPop: function () {
        // console.log(util.WXlogin());
        // util.WXlogin();
        var that = this;
        let userInfo = wx.getStorageSync('userInfo');
        let openId = wx.getStorageSync('openId');
        console.log("userInfo", userInfo);
        console.log("openId" + openId);
        // let productLength = this.data.productList.length;
        if (userInfo == '') {
            wx.showToast({
                image: '/images/icon/error.png',
                title: '请先登录',
            });
            return false;
        }

        if (this.data.openAttr == false) {
            //打开规格选择窗口
            this.setData({
                openAttr: !that.data.openAttr
            });
            this.setData({
                alone_text: '加入购物车'
            })
        } else {
            //判断是否选中规格按钮，false即为无选中
            if (this.data.priceChecked == false) {
                wx.showToast({
                    image: '/images/icon/error.png',
                    title: '请选择规格',
                });
                return false;
            } else {
                console.log("this.data.id:" + this.data.id);
                console.log("this.data.good_index:" + this.data.good_index);
                console.log("this.data.good_name:" + this.data.good_name);
                console.log("this.data.good_price:" + this.data.good_price);
                console.log("this.data.number:" + this.data.number);

                wx.request({
                    // api.AuthLoginByWeixin
                    url: api.CartAdd,
                    data: {
                        // addType: 0,
                        good_id: this.data.id,
                        good_index: this.data.good_index,
                        number: this.data.number,
                        openId: wx.getStorageSync('openId')
                    },
                    success: function (res) {
                        console.log("========================添加购物车传输数据成功=========================");
                        console.log(res);

                        wx.setStorageSync('cartGoodsCount', res.data.cartGoodsCount); //设置返回来该用户购物车中商品总数
                        console.log("cartGoodsCount=" + res.data.cartGoodsCount);
                        console.log('number=' + res.data.number);
                        let cartGoodsCount = res.data.cartGoodsCount;
                        if (cartGoodsCount == null) {
                            cartGoodsCount=0;
                        }

                        //修改的部分  
                        that.setData({
                            good_index: 0,
                            openAttr: false,
                            priceChecked: false,
                            good_name: '请选择规格和数量',
                            good_price: {},
                            good_number: '有货',
                            Attribute_id: 0,
                            cartGoodsCount: cartGoodsCount//用户购物车中商品总数
                        });

                        wx.showToast({
                            title: '加入购物车成功',
                        });
                    },

                });

            }
        }

    },

    closeAttr: function () {
        this.setData({
            openAttr: false,
            alone_text: '单独购买'
        });
    },

    goMarketing: function (e) {
        let that = this;
        that.setData({
            showDialog: !this.data.showDialog
        });
    },

    //立即购买
    fastToCart: function () {
        // 判断是否登录，如果没有登录，则登录
        util.loginNow();
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo == '') {
            wx.showToast({
                image: '/images/icon/error.png',
                title: '请先登录',
            });
            return false;
        }
        var that = this;
        if (this.data.openAttr === false) {
            //打开规格选择窗口
            this.setData({
                openAttr: !this.data.openAttr
            });
            that.setData({
                alone_text: '加入购物车'
            })
        } else {
            //提示选择完整规格
            if (this.data.priceChecked == false) {
                wx.showToast({
                    image: '/images/icon/error.png',
                    title: '请选择规格',
                });
                return false;
            } else {
                wx.navigateTo({
                    url: '/pages/pay/settlement/settlement?addtype=1&commodity_id=' + this.data.id + '&attribute_id=' + this.data.Attribute_id + '&sonAttribute_id=' + this.data.good_index + '&number=' + this.data.number,
                });
            }
        }
    },
    cutNumber: function () {
        this.setData({
            number: (this.data.number - 1 > 1) ? this.data.number - 1 : 1
        });
        this.setData({
            disabled: ''
        });
    },
    addNumber: function () {
        var check_number = this.data.number + 1;
        let good_number = this.data.good_number;
        if (good_number >= check_number) {
            this.setData({
                number: Number(this.data.number) + 1
            });
        } else {
            this.setData({
                disabled: true
            });
        }
        // let checkedProductArray = this.getCheckedProductItem(this.getCheckedSpecKey());
        // let checkedProduct = checkedProductArray;   
    }
})