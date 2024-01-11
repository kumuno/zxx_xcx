var util = require('../../../utils/utils');
var api = require('../../../config/api.js');
var app = getApp();
Page({
    data: {
        //地址基本信息
        shipaddress: {
            address_id: '',
            user_id: '',
            regionAddress: '',
            detailAddress: '',
            address_contact: '',
            address_phone: '',
            address_default: 0,
        },
        //验证手机号码格式
        mobileTrue: 'flase',
        //地址：省-城-区
        region: [],
        //进行修改的地址id
        addressId: 0,
        //修改标志
        revise: 0,


        address: {
            id: 0,
            province_id: 0,
            city_id: 0,
            district_id: 0,
            address: '',
            full_region: '',
            name: '',
            mobile: '',
            is_default: 0
        },

        openSelectRegion: false,
        selectRegionList: [{
                id: 0,
                name: '省份',
                parent_id: 1,
                type: 1
            },
            {
                id: 0,
                name: '城市',
                parent_id: 1,
                type: 2
            },
            {
                id: 0,
                name: '区县',
                parent_id: 1,
                type: 3
            }
        ],
        regionType: 1,
        regionList: [],
        selectRegionDone: false

    },
    getUserProvince: function (e) {
        let shipaddress = this.data.shipaddress;
        //将地址装换成省-市-区
        let a = e.detail.value;
        let string = '';
        for (var i = 0; i < a.length; i++) {
            string += a[i];
            if (i != (a.length - 1)) {
                string += '-';
            }
        }
        shipaddress.regionAddress = string;
        let that = this;
        this.setData({
            shipaddress: shipaddress //将用户选择的省市区赋值给region
        })
        console.log(that.data.shipaddress.regionAddress)
    },
    mobilechange(e) {
        let mobile = e.detail.value;
        let shipaddress = this.data.shipaddress;
        shipaddress.address_phone = mobile;
        this.setData({
            shipaddress: shipaddress
        });
        if (util.testMobile(mobile)) {
            this.setData({
                mobileTrue: 'true'
            });
        }else{
            this.setData({
                mobileTrue: 'flase'
            });
        }
    },
    bindinputName(e) {
        let shipaddress = this.data.shipaddress;
        let contact = e.detail.value;
        shipaddress.address_contact = contact;
        this.setData({
            shipaddress: shipaddress
        });
    },
    bindinputAddress(e) {
        let shipaddress = this.data.shipaddress;
        let detailAddress = e.detail.value;
        shipaddress.detailAddress = detailAddress;
        this.setData({
            shipaddress: shipaddress
        });
    },
    switchChange(e) {
        let shipaddress = this.data.shipaddress;
        let status = e.detail.value;
        let is_default = 0;
        if (status == true) {
            is_default = 1;
        }
        shipaddress.address_default = is_default;
        this.setData({
            shipaddress: shipaddress
        });
    },
    getAddressDetail() {
        let that = this;
        let id = that.data.addressId;
        if (id != 0) {
            util.request(api.AddressDetailalone + id).then(function (res) {
                console.log(res);
                that.setData({
                    shipaddress: res
                });
                
                //加载页面的时候就验证一次手机号码是否合法
                if (util.testMobile(res.address_phone)) {
                    that.setData({
                        mobileTrue: 'true'
                    });
                }else{
                    that.setData({
                        mobileTrue: 'flase'
                    });
                }

            });

        }
    },
    deleteAddress: function () {
        let id = this.data.addressId;
        wx.showModal({
            title: '提示',
            content: '您确定要删除么？',
            success: function (res) {
                if (res.confirm) {
                    util.request(api.DeleteAddress, {
                        id: id
                    }).then(function (res) {
                        if (res > 0) {
                            wx.removeStorageSync('addressId');
                            util.showSuccessToast('删除成功');
                            wx.navigateBack();
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        })
    },
    setRegionDoneStatus() {
        let that = this;
        let doneStatus = that.data.selectRegionList.every(item => {
            return item.id != 0;
        });

        that.setData({
            selectRegionDone: doneStatus
        })

    },


    onLoad: function (options) {
        if (options.id) {
            this.setData({
                addressId: options.id,
                revise: options.revise
            });
            this.getAddressDetail();
        }

    },
    onReady: function () {

    },
    selectRegionType(event) {
        let that = this;
        let regionTypeIndex = event.target.dataset.regionTypeIndex;
        let selectRegionList = that.data.selectRegionList;

        //判断此处是否可点击
        if (regionTypeIndex + 1 == this.data.regionType || (regionTypeIndex - 1 >= 0 && selectRegionList[regionTypeIndex - 1].id <= 0)) {
            return false;
        }

        this.setData({
            regionType: regionTypeIndex + 1
        })

        let selectRegionItem = selectRegionList[regionTypeIndex];

        this.getRegionList(selectRegionItem.parent_id);

        this.setRegionDoneStatus();

    },
    selectRegion(event) {
        let that = this;
        let regionIndex = event.target.dataset.regionIndex;
        let regionItem = this.data.regionList[regionIndex];
        let regionType = regionItem.type;
        let selectRegionList = this.data.selectRegionList;
        selectRegionList[regionType - 1] = regionItem;


        if (regionType != 3) {
            this.setData({
                selectRegionList: selectRegionList,
                regionType: regionType + 1
            })
            this.getRegionList(regionItem.id);
        } else {
            this.setData({
                selectRegionList: selectRegionList
            })
        }

        //重置其下级区域为空
        selectRegionList.map((item, index) => {
            if (index > regionType - 1) {
                item.id = 0;
                item.name = index == 1 ? '城市' : '区县';
                item.parent_id = 0;
            }
            return item;
        });

        this.setData({
            selectRegionList: selectRegionList
        })


        that.setData({
            regionList: that.data.regionList.map(item => {

                //标记已选择的
                if (that.data.regionType == item.type && that.data.selectRegionList[that.data.regionType - 1].id == item.id) {
                    item.selected = true;
                } else {
                    item.selected = false;
                }

                return item;
            })
        });

        this.setRegionDoneStatus();

    },
    doneSelectRegion() {
        if (this.data.selectRegionDone === false) {
            return false;
        }

        let address = this.data.address;
        let selectRegionList = this.data.selectRegionList;
        address.province_id = selectRegionList[0].id;
        address.city_id = selectRegionList[1].id;
        address.district_id = selectRegionList[2].id;
        address.province_name = selectRegionList[0].name;
        address.city_name = selectRegionList[1].name;
        address.district_name = selectRegionList[2].name;
        address.full_region = selectRegionList.map(item => {
            return item.name;
        }).join('');

        this.setData({
            address: address,
            openSelectRegion: false
        });

    },
    cancelSelectRegion() {
        this.setData({
            openSelectRegion: false,
            regionType: this.data.regionDoneStatus ? 3 : 1
        });
    },

    //生成唯一不重复ID
    generateUuid: function (length = 5) {
        return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
    },

    saveAddress() {
        let shipaddress = this.data.shipaddress;
        let mobileTrue = this.data.mobileTrue;
        if (shipaddress.address_contact == '' || shipaddress.address_contact == undefined) {
            util.showErrorToast('请输入您的姓名');
            return false;
        }
        if (shipaddress.address_phone == '' || shipaddress.address_phone == undefined) {
            util.showErrorToast('请输入手机号码');
            return false;
        }
        if (shipaddress.regionAddress == '' || shipaddress.regionAddress == undefined) {
            util.showErrorToast('请输入省市区');
            return false;
        }
        if (shipaddress.detailAddress == '' || shipaddress.detailAddress == undefined) {
            util.showErrorToast('请输入详细地址');
            return false;
        }

        if (mobileTrue == 'flase') {
            util.showErrorToast('请检查手机号码是否有误');
            return false;
        }

        let that = this;
        let revise = that.data.revise;
        console.log(revise);
        if (revise == 0) {
            that.data.region = that.data.shipaddress.regionAddress;
            let a = that.data.region;
            let string = '';
            for (var i = 0; i < a.length; i++) {
                string += a[i];
                if (i != (a.length - 1)) {
                    string += '-';
                }
            }
            console.log(string);
            util.request(api.InsertAddressnew, {
                address_id: that.generateUuid(),
                user_id: wx.getStorageSync('openId'),
                regionAddress: a,
                detailAddress: that.data.shipaddress.detailAddress,
                address_contact: that.data.shipaddress.address_contact,
                address_phone: that.data.shipaddress.address_phone,
                address_default: that.data.shipaddress.address_default,
            }).then(function (res) {
                console.log(res);
                if (res > 0) {
                    wx.navigateBack();
                    util.showSuccessToast('新增成功');
                }
            });
        } else {
            util.request(api.UpdateAddress, {
                user_id: wx.getStorageSync('openId'),
                address_id: that.data.shipaddress.address_id,
                regionAddress: that.data.shipaddress.regionAddress,
                detailAddress: that.data.shipaddress.detailAddress,
                address_contact: that.data.shipaddress.address_contact,
                address_phone: that.data.shipaddress.address_phone,
                address_default: that.data.shipaddress.address_default,
            }).then(function (res) {
                console.log(res);
                if (res > 0) {
                    wx.navigateBack();
                    util.showSuccessToast('修改成功');
                }
            });
        }

    },
    onShow: function () {
        let id = this.data.addressId;
        if (id > 0) {
            wx.setNavigationBarTitle({
                title: '编辑地址',
            })
        } else {
            wx.setNavigationBarTitle({
                title: '新增地址',
            })
        }
    },
    onHide: function () {
        // 页面隐藏

    },
    onUnload: function () {
        // 页面关闭

    }
})