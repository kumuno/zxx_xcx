// const ApiRootUrl = 'http://localhost:8360/api/';
// const ApiRootUrl = 'http://192.168.0.108:8360/api/';
const ApiRootUrl = 'https://www.guxiaoling.com:8466/api/';
// const ApiCommonUrl = 'http://cd.free.idcfengye.com/';
const ApiCommonUrl = 'http://119.29.13.56:28079/';
module.exports = {
  // 登录
  WXlogin: ApiCommonUrl + 'UserController/login', //微信登录
  WXphone: ApiCommonUrl + 'UserController/WXphone', //获取手机号码
  //保存个人修改信息
  SaveSettings: ApiCommonUrl + 'UserController/reserveUser',
  //上传头像并保存
  ReserveImage: ApiCommonUrl + 'UserController/reserveLoadImage',
  // 首页
  IndexUrl: ApiCommonUrl + 'commodityController/findAllCommodityByType', //按类型查询所有商品

  // 分类
  getAllType: ApiCommonUrl + 'commodityController/findAllCommodityType', //查找所有商品类型
  findAllCommodity: ApiCommonUrl + 'commodityController/findAllCommodity', //查询所有商品

  // 购物车
  CartAdd: ApiCommonUrl + 'shopCartController/CartAdd', // 添加商品到购物车
  CartCheckedAll: ApiCommonUrl + 'shopCartController/CartCheckedAll', //将购物车商品返回
  CartUpdate: ApiCommonUrl + 'shopCartController/CartUpdate', //更新购物车
  CartDelete: ApiCommonUrl + 'shopCartController/CartDelete', //删除购物车
  CartChecked: ApiCommonUrl + 'shopCartController/CartChecked', //更改商品选中与否
  CartGoods: ApiCommonUrl + 'shopCartController/CartGoods', //获取购物车的所有信息
  CartCheckout: ApiCommonUrl + 'shopCartController/CartGoods', // 下单前信息确认
  CartGoodsCount: ApiCommonUrl + 'shopCartController/cartGoodsCount', //获取用户购物车商品总数

  // 商品
  GoodsList: ApiCommonUrl + 'commodityController/findCommodityBySearch', //获得商品列表
  GoodsDetailnew: ApiCommonUrl + 'commodityController/findAllCommodityByid/', //通过id存在商品信息
  GoodSpecs: ApiCommonUrl + 'commoditySonAttributeController/findAllCommoditySonAttributeByid/', //通过商品id获取商品规格子类属性

  // 收货地址
  // AddressDetailnew: ApiCommonUrl + 'shipAddressController/findShipAdderssByaddress_id/', //获取商品发货地址信息
  AddressDetailalone: ApiCommonUrl + 'shipAddressController/findShipAdderssByaddress_idAlone/', //获取用户地址
  AddressListnew: ApiCommonUrl + 'shipAddressController/findShipAdderssByuser_id/',
  InsertAddressnew: ApiCommonUrl + 'shipAddressController/insertshipAddress', //保存收货地址
  UpdateAddress: ApiCommonUrl + 'shipAddressController/updateshipAddressByaddress_id', //修改收货地址
  DeleteAddress: ApiCommonUrl + 'shipAddressController/deleteshipAddressByaddress_id', //删除收货地址

  //订单
  OrderGetAddress: ApiCommonUrl + 'orderInformationController/orderFindAddress', //订单获取收货地址
  OrderGetGoods: ApiCommonUrl + 'orderInformationController/orderFindCart', //订单查找已经选择购买的商品信息（购物车购买）
  OrderDirectGetGoods: ApiCommonUrl + 'orderInformationController/orderFindDirectGood', //查询直接购买商品信息（直接购买）
  OrderSubmit: ApiCommonUrl + 'orderInformationController/orderSubmit', // 提交订单
  orderUpdatePayInformation: ApiCommonUrl + 'orderInformationController/orderUpdatePayInformation', //更新微信支付的信息
  OrderList: ApiCommonUrl + 'orderInformationController/findAllOrder', //获取订单列表
  OrderCountInfo: ApiCommonUrl + 'orderInformationController/orderByTypeNumber', // 我的页面获取订单数状态
  OrderDetail: ApiCommonUrl + 'orderInformationController/selectByOrderId', //订单详情
  OrderGoods: ApiCommonUrl + 'orderInformationController/findOrderGoodsByOrderId', //总订单的商品订单所有信息
  OrderCancel: ApiCommonUrl + 'orderInformationController/orderCancel', //取消/删除订单
  orderUpdateRemark: ApiCommonUrl + 'orderInformationController/updateOrderRemark', //修改总订单的备注信息
  applyRefund: ApiCommonUrl + 'orderInformationController/updateApplyOrderRefund', //用户申请退款
  orderToArrive: ApiCommonUrl + 'orderInformationController/updateOrderStatusToArrive', //修改订单状态为已收货 
  RegionList: ApiRootUrl + 'region/list', //获取区域列表
  PayPrepayId: ApiRootUrl + 'pay/preWeixinPay', //获取微信统一下单prepay_id
  OrderDelete: ApiRootUrl + 'order/delete', //订单删除
  OrderConfirm: ApiRootUrl + 'order/confirm', //物流详情
  OrderCount: ApiRootUrl + 'order/count', // 获取订单数
  OrderExpressInfo: ApiRootUrl + 'order/express', //物流信息
  // OrderGoods: ApiRootUrl + 'order/orderGoods', // 获取checkout页面的商品列表

  // 足迹
  FootprintList: ApiRootUrl + 'footprint/list', //足迹列表
  FootprintDelete: ApiRootUrl + 'footprint/delete', //删除足迹

  // 搜索
  SearchIndex: ApiCommonUrl + 'commodityController/findByUserSearch', //搜索页面数据
  SearchHelper: ApiCommonUrl + 'commodityController/insertSearch', //搜索存储搜索记录
  SearchClearHistory: ApiCommonUrl + 'commodityController/deleteByUserSearch', //清除个人搜索记录

  ShowSettings: ApiRootUrl + 'settings/showSettings',

  SettingsDetail: ApiRootUrl + 'settings/userDetail',
  GetBase64: ApiRootUrl + 'qrcode/getBase64', //获取商品详情二维码

};