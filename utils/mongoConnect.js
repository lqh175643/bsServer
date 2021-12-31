const mongoose = require("mongoose");

const baseUrl = "mongodb://127.0.0.1:27017"

mongoose.connect("mongodb://127.0.0.1:27017/userInfo");

const dbUser = mongoose.createConnection(baseUrl+'/userInfo');
const dbUserInformation = mongoose.createConnection(baseUrl+'/userInfo');
// const dbCategory = mongoose.createConnection(baseUrl+'/category');

dbUser.on("open", function () {
  console.log("dbUser Connection Successed");
});
dbUser.on("error", function () {
  console.log("dbUser Connection Error");
});

dbUserInformation.on("open", function () {
  console.log("dbUserInformation Connection Successed");
});
dbUserInformation.on("error", function () {
  console.log("dbUserInformation Connection Error");
});

// 连接成功
// dbCategory.on("open", function () {
//   console.log("dbCategory Connection Successed");
// });
// 连接失败
// dbCategory.on("error", function () {
//   console.log("dbCategory Connection Error");
// });

module.exports = {
  dbUser,
  dbUserInformation,
  // dbCategory
}
