const { md5Solt } = require("./md5");
const { User, UserInformation } = require("./mongoTable");

const {
  generateId,
  generateToken,
  verifyToken,
  errMes,
  sucMes,
} = require("./util");

const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
async function getManyData(dbName, colName, ids) {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        reject(err);
        return;
      }
      let db = client.db(dbName);
      db.collection(colName)
        .find({ id: { $in: ids } })
        .toArray(
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result)
            }
          }
        );
    });
  });
}
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
      // client.close();
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
        // client.close();
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
      temp
        .count()
        .then((res) => {
          totalCount = res
          return temp
        })
        .then(res => {
          res.skip((page - 1) * limit)
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
            });
        });
    });
  });
}

async function modifyGoods(dbName, colName, uid, jid, target, val, score) {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        reject(err);
        return;
      }
      let db = client.db(dbName);
      db.collection(colName)
        .updateOne({ id: jid }, { $push: { [target]: { uid, val, children: [], time: Date.now(), zanCount: 0, score } } })
        .then((res) => {
          resolve(res);
        });
      // client.close();
    });
  });
}

function login(username, pass) {
  return new Promise((resolve, reject) => {
    User.findOne({ username })
      .then((data) => {
        if (!data) return Promise.reject(new errMes("用户名错误"));
        const { result } = md5Solt(pass, data.salt);
        if (data.password !== result)
          return Promise.reject(new errMes("密码错误"));
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
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function register(username, pass, phone) {
  let id;
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
          return User.create(newUser);
        } catch (error) {
          return Promise.reject(new errMes("", error));
        }
      })
      .then((res) => {
        return UserInformation.create({ id, phone, username });
      })
      .then((res) => {
        resolve("注册成功");
      })
      .catch((err) => {
        reject(err);
      });
  });
}
function getUserInfo(uid) {
  return new Promise((resolve, reject) => {
    UserInformation.findOne({ id: uid }, { _id: 0, __v: 0 }, (err, data) => {
      if (err) {
        reject(new errMes("查询id失败", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("没有查询到此id"));
      }
    });
  });
}

function modifyUserInfo(uid, target, jid, count) {
  count = Number(count);
  return new Promise((resolve, reject) => {
    UserInformation.findOneAndUpdate(
      { id: uid },
      {
        $inc: { [`shopBus.${jid}`]: count },
      },
      { upsert: true, new: true },
      (err, result) => {
        if (err) {
          reject(new errMes(`修改数据库失败(${target})`, err));
        }
        if (result) {
          resolve(new sucMes(200, result));
        } else {
          reject(new errMes("没有查询到此id"));
        }
      }
    );
    // UserInformation.findOne({ id: uid, "shopBus.jid": data }, (err, data) => {
    //   if (err) {
    //     reject(new errMes(`修改数据库失败(${target})`, err));
    //   }
    //   if (data) {
    //     resolve(new sucMes(200, data));
    //   } else {
    //     reject(new errMes("没有查询到此id"));
    //   }
    // });
    // UserInformation.updateOne(
    //   { id: uid },
    //   { $push: { [target]: data } },
    //   (err, data) => {
    //     console.log();
    //     if (err || data.acknowledged != true) {
    //       reject(new errMes(`修改数据库失败(${target})`, err));
    //     }
    //     if (data) {
    //       resolve(new sucMes(200, data));
    //     } else {
    //       reject(new errMes("没有查询到此id"));
    //     }
    //   }
    // );
  });
}
/*
@params target:Object；为对象时修改多个信息，字符串修改单个信息
*/
function modifyUserInfoStrNum(uid, target) {
  return new Promise((resolve, reject) => {
    UserInformation.updateOne({ id: uid }, target, (err, data) => {
      if (err) {
        reject(new errMes("保存失败", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("没有查询到此用户"));
      }
    });
  });
}
function deleteUserInfo(uid, target, jid) {
  const goal = {}
  if (Array.isArray(jid)) {
    jid.forEach(val => {
      goal[`${target}.${val}`] = ''
    })
  } else {
    goal[`${target}.${jid}`] = ''
  }
  console.log(goal)
  return new Promise((resolve, reject) => {
    UserInformation.updateOne({ id: uid }, { $unset: goal }, (err, data) => {
      if (err) {
        reject(new errMes("删除购物车失败", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("没有查询到此用户"));
      }
    });
  });
}
//添加数组
function UserInfoArrPush(uid, target, item) {
  return new Promise((resolve, reject) => {
    UserInformation.updateOne({ id: uid }, { $push: { [target]: item } }, (err, data) => {
      if (err) {
        reject(new errMes("操作失败", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("操作失败"));
      }
    });
  });
}

function UserInfoArrModify(uid, Ptarget, did, target) {
  return new Promise((resolve, reject) => {
    UserInformation.updateOne(
      { id: uid, [`${Ptarget}.did`]: did },
      { $set: { [`${Ptarget}.$.${target}`]: true } }
      , (err, data) => {
        if (err) {
          reject(new errMes("操作失败", err));
        }
        if (data) {
          resolve(new sucMes(200, data));
        } else {
          reject(new errMes("操作失败"));
        }
      });
  });
}

function UserInfoArrTwoModify(uid, Ptarget, target, did, jid) {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        reject(err);
        return;
      }
      let db = client.db('userInfo');
      db.collection('userinformations')
        .updateOne(
          { id: uid },
          { $set: { [`${Ptarget}.$[idx1].${target}.$[idx2].isComment`]: true } },
          {
            arrayFilters: [
              {
                "idx1.did": did,
              },
              {
                "idx2.jid": jid
              }
            ]
          })
        .then((res) => {
          resolve(res);
        })
        .catch(err => {
          console.log(err)
        });
    });
  });
  return new Promise((resolve, reject) => {
    UserInformation.updateMany(
      { id: uid },
      { $set: { "shopHistory.$[0].goods.$[0].isComment": 10 } },
      {
        arrayFilters: [
          {
            "i2.jid": jid
          }
        ],
        new: true
      }
      , (err, data) => {
        if (err) {
          reject(new errMes("操作失败", err));
        }
        if (data) {
          resolve(new sucMes(200, data));
        } else {
          reject(new errMes("操作失败"));
        }
      });
  });
}
function deleteUserInfoArrObj(uid, Ptarget, target, val) {
  console.log(uid, Ptarget, target, val)
  return new Promise((resolve, reject) => {
    UserInformation.updateMany(
      { id: uid },
      { $pull: { [Ptarget]: { [target]: { $in: val } } } }
      , (err, data) => {
        if (err) {
          reject(new errMes("操作失败", err));
        }
        if (data) {
          resolve(new sucMes(200, data));
        } else {
          reject(new errMes("操作失败"));
        }
      });
  });
}
function deleteUserInfoArr(uid, target, val) {
  return new Promise((resolve, reject) => {
    UserInformation.updateOne({ id: uid }, { $pull: { [target]: val } }, (err, data) => {
      if (err) {
        reject(new errMes("删除失败", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("删除失败"));
      }
    });
  });
}
module.exports = {
  addData,
  getColData,
  getOneData,
  modifyGoods,
  login,
  register,
  getUserInfo,
  modifyUserInfo,
  getManyData,
  deleteUserInfo,
  UserInfoArrPush,
  UserInfoArrModify,
  UserInfoArrTwoModify,
  modifyUserInfoStrNum,
  deleteUserInfoArr,
  deleteUserInfoArrObj
};
