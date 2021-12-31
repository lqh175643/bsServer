const { md5Solt } = require("./md5");
const { User, UserInformation } = require("./mongoTable");

const { generateId, generateToken, verifyToken, errMes } = require("./util");

const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
async function getOneData(dbName, colName, id) {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        reject(err);
        return;
      }
      let db = client.db(dbName);
      db.collection(colName)
        .findOne({ id })
        .then((res) => {
          resolve(res);
        });
      client.close();
    });
  });
}
async function addData(Data, dbName, colName) {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        console.log(err);
        return;
      }
      let db = client.db(dbName);
      db.collection(colName).insertMany(Data, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
        client.close();
      });
    });
  });
}
async function getColData(dbName, colName, page, limit, searchLimit) {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        console.log(err);
        return;
      }
      let db = client.db(dbName);
      let reg = new RegExp(searchLimit);
      let temp = db.collection(colName).find({ detail: reg });
      let totalCount;
      temp.count().then((res) => (totalCount = res));
      temp
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray((err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              totalCount,
              data,
            });
          }
          client.close();
        });
    });
  });
}

function login(username, pass) {
  return new Promise((resolve, reject) => {
    User.findOne({ username }, (err, data) => {
      if (err) reject(err);
      if (data) {
        const { result } = md5Solt(pass, data.salt);
        if (data.password === result) {
          const token = generateToken(data.id);
          if (token) {
            resolve({
              mes: "登录成功",
              code: 1,
              token,
            });
          } else {
            reject({
              mes: "生成token失败",
              err: "",
            });
          }
        } else {
          reject({
            mes: "密码错误",
            code: -1,
          });
        }
      } else {
        reject({
          mes: "用户名错误",
          err: "",
        });
      }
    });
  });
}

function register(username, pass, phone) {
  let id
  return new Promise((resolve, reject) => {
    User.findOne({ username })
      .then((res) => {
        if (res) return Promise.reject(new errMes("用户名已经注册"));
        return User.findOne({ phone });
      })
      .then((res) => {
        if (res) return Promise.reject(new errMes("手机号已绑定"));
        try {
          const { result, salt } = md5Solt(pass);
          id = generateId();
          const newUser = { username, password: result, id, salt, phone };
          return User.create(newUser)
        } catch (error) {
          return Promise.reject(new errMes('',error));
        }
      })
      .then((res)=>{
        return UserInformation.create({ id, phone, username });
      })
      .then(res=>{
        resolve("注册成功");
      })
      .catch(err=>{
        reject(err)
      });
  });
}
function getUserInfo(token) {
  return new Promise((resolve, reject) => {
    let { id = "" } = verifyToken(token);
    UserInformation.findOne({ id }, (err, data) => {
      if (err) {
        reject(new errMes("查询id失败", err));
      }
      if (data) {
        resolve(data);
      } else {
        reject(new errMes("没有查询到此id"));
      }
    });
  });
}

module.exports = {
  addData,
  getColData,
  getOneData,
  login,
  register,
  getUserInfo,
};
