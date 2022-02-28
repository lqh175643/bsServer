const { dbUser, dbUserInformation } = require("./mongoConnect");

let mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  id: {
    type: Number,
    unique: true,
  },
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  phoneNumber: Number,
  createAt: {
    type: Date,
    default: Date.now(),
  },
  salt: {
    type: String,
  },
  phone: {
    type: String,
    unique: true,
  },
});

const userInformationSchema = new Schema({
  id: {
    type: Number,
    unique: true,
  },
  //用户名
  username: {
    type: String,
    unique: true,
  },
  //用户创建时间
  createAt: {
    type: Date,
    default: Date.now(),
  },
  //手机号
  phone: {
    type: String,
    unique: true,
  },
  //购物车
  shopBus: {
    type: Object,
    default: {}
  },
  //足迹
  footprint: {
    type: Array,
    default: [],
  },
  //收藏
  collect: {
    type: Array,
    default: [],
  },

  vip: {
    type: Object,
    default: {
      isVip: false,
      expirationTime: 0,
    },
  },
  //性别
  sex: {
    type: Number,
    default: -1, //0为女，1为男，-1未选择
  },
  //优惠券
  consumerCoupon: {
    type: Array,
    default: [{
      price: 99,
      reduce: 10,
      limit: ['百草味', '良品铺子', '三只松鼠']
    }, {
      price: 10,
      reduce: 2,
      limit: ['所有商品']
    }],
  },
  //购买历史
  shopHistory: {
    type: [Object],
    default: []
  },
  //校园豆
  campusBean: {
    type: Number,
    default: 0,
  },
  //收货地址
  receivingAddress: {
    type: Array,
    default: []
  },
  //用户自我介绍的地址，非收货地址
  address: {
    type: Array,
    default: []
  },
  //生日
  birthday: {
    type: String,
    default: ''
  },
  //用户工作
  occupation: {
    type: String,
    default: ''
  },
  //用户自我介绍
  introduction: {
    type: String,
    default: ''
  }
});

module.exports = {
  User: dbUser.model("user", userSchema),
  UserInformation: dbUserInformation.model(
    "userInformation",
    userInformationSchema
  ),
};
