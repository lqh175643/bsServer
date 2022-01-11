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
    type:Object,
    default:{}
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
    default: -1, //0为女，1为女，-1未选择
  },
  consumerCoupon: {
    type: Array,
    default: [],
  },
  shopHistory: {
    type: Array,
    default: [],
  },
  campusBean: {
    type: Number,
    default: 0,
  },
});

module.exports = {
  User: dbUser.model("user", userSchema),
  UserInformation: dbUserInformation.model(
    "userInformation",
    userInformationSchema
  ),
};
