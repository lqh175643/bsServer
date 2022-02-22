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
  username: {
    type: String,
    unique: true,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
  phone: {
    type: String,
    unique: true,
  },
  shopBus: {
    type: Object,
    default: {}
  },
  footprint: {
    type: Array,
    default: [],
  },
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
  sex: {
    type: Number,
    default: -1, //0为女，1为男，-1未选择
  },
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
  shopHistory: {
    type: Object,
    default: {},
  },
  campusBean: {
    type: Number,
    default: 0,
  },
  receivingAddress: {
    type: Object,
    default: {}
  },
  address: {
    type: Array,
    default: []
  },
  birthday: {
    type: String,
    default: ''
  },
  occupation: {
    type: String,
    default: ''
  },
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
