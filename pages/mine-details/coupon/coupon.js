const app = getApp()
Page({
  data: {
    height: app.globalData.height,
    currentData: 0,
    coupon:[
      { price: 2022,describe: '满600元可用', name: '湛小鲜优惠券', date: '2022.12.31-2023.01.17', apply:'适用范围：所有产品可用'},
      { price: 2022,describe: '满600元可用', name: '湛小鲜优惠券', date: '2022.12.31-2023.01.17', apply:'适用范围：所有产品可用'},
      { price: 2022,describe: '无门槛券', name: '湛小鲜优惠券', date: '2022.12.31-2023.01.17', apply:'适用范围：所有产品可用'},
    ],
    coupon_invalid: [
      {price: 2022,describe: '满600元可用', name: '湛小鲜优惠券', date: '2022.12.31-2023.01.17', apply:'适用范围：所有产品可用', invalid: 1 },
      { price: 2022,describe: '满600元可用', name: '湛小鲜优惠券', date: '2022.12.31-2023.01.17', apply:'适用范围：所有产品可用', invalid: 2 },
    ],
  },
  onLoad:function(){
    
  },
  //获取当前滑块的index
  bindchange: function (e) {
    const that = this;
    that.setData({
      currentData: e.detail.current
    })
  },
  //点击切换，滑块index赋值
  checkCurrent: function (e) {
    const that = this;

    if (that.data.currentData === e.target.dataset.current) {
      return false;
    } else {

      that.setData({
        currentData: e.target.dataset.current
      })
    }
  }
})
