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

// async function justOne() {
//   return new Promise((resolve, reject) => {
//     client.connect((err) => {
//       if (err) {
//         reject(err);
//         return;
//       }
//       let db = client.db('category');
//       db.collection('snacks')
//         .updateMany({}, { $set: { saleCount: Math.floor(Math.random() * 1000 + 20) } })
//         .then((res) => {
//           resolve(res);
//         });
//     });
//   });
// }
// justOne()

async function modifyGoods(dbName, colName, uid, jid, target, val, score, cid) {
  return new Promise((resolve, reject) => {
    client.connect((err) => {
      if (err) {
        reject(err);
        return;
      }
      let db = client.db(dbName);
      db.collection(colName)
        .updateOne({ id: jid }, { $push: { [target]: { uid, val, children: [], time: Date.now(), zanCount: 0, score, cid } } })
        .then((res) => {
          resolve(res);
        });
      // client.close();
    });
  });
}

async function modifyGoodZan(toUid, fromUid, jid, cid, category) {
  let count = 1
  return new Promise((resolve, reject) => {
    client.connect(async (err) => {
      if (err) {
        reject(err);
        return;
      }
      const db = client.db('category');
      const temp = db.collection(category).find({ id: jid });
      temp.toArray(
        (err, result) => {
          if (err) {
            reject(err)
          } else {
            for (const val of result[0].comment) {
              if (val.cid == cid) {
                if (val?.zanFroms?.includes(fromUid)) count = -1
                break
              }
            }
            db.collection(category).updateOne(
              { id: jid },
              {
                $inc: { 'comment.$[idx1].zanCount': count },
                [count == -1 ? `$pull` : '$push']: { 'comment.$[idx2].zanFroms': fromUid }
              },
              {
                arrayFilters: [
                  {
                    "idx1.uid": toUid,
                    'idx1.cid': cid
                  },
                  {
                    'idx2.uid': toUid,
                    'idx2.cid': cid
                  }
                ]
              })
              .then(res => {
                resolve(res)
              }).catch(err => {
                reject(err)
              })
          }
        }
      )
    });
  });
}
async function commitChd(options) {
  const { uid, jid, cid, category, time, val } = options
  return new Promise((resolve, reject) => {
    client.connect(async (err) => {
      if (err) {
        reject(err);
        return;
      }
      const db = client.db('category');
      db.collection(category).updateOne(
        { id: jid },
        {
          $push: { 'comment.$[idx1].children': { uid, val, children: [], time, zanCount: 0, zanFrom: [], cid: 'c' + generateId() } }
        },
        {
          arrayFilters: [
            {
              "idx1.cid": cid,
            }
          ]
        }
      ).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      });
    })
  });
}

function login(username, pass) {
  return new Promise((resolve, reject) => {
    User.findOne({ username })
      .then((data) => {
        if (!data) return Promise.reject(new errMes("???????????????"));
        const { result } = md5Solt(pass, data.salt);
        if (data.password !== result)
          return Promise.reject(new errMes("????????????"));
        const token = generateToken(data.id);
        if (token) {
          resolve({
            mes: "????????????",
            code: 1,
            token,
          });
        } else {
          reject({
            mes: "??????token??????",
            err: "",
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function forget(username, phone) {
  return new Promise((resolve, reject) => {
    User.findOne({ username, phone })
      .then((data) => {
        try {
          const { result, salt } = md5Solt(123456);
          return User.updateOne({ username, phone }, { $set: { password: result, salt } })
        } catch (error) {
          return Promise.reject(new errMes("", error));
        }
      })
      .then(res => {
        resolve({
          mes: "????????????",
          code: 1,
          token,
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function register(username, pass, phone, invitation) {
  let id;
  return new Promise((resolve, reject) => {
    User.findOne({ username })
      .then((res) => {
        if (res) return Promise.reject(new errMes("?????????????????????"));
        return User.findOne({ phone });
      })
      .then((res) => {
        if (res) return Promise.reject(new errMes("??????????????????"));
        if (invitation && (invitation != 'woshiguanliyuan')) return Promise.reject(new errMes("???????????????"));
        try {
          const { result, salt } = md5Solt(pass);
          id = generateId();
          const newUser = { username, password: result, id, salt, phone, isAdministrator: !!invitation };
          return User.create(newUser);
        } catch (error) {
          return Promise.reject(new errMes("", error));
        }
      })
      .then((res) => {
        return UserInformation.create({ id, phone, username, isAdministrator: !!invitation });
      })
      .then((res) => {
        resolve("????????????");
      })
      .catch((err) => {
        reject(err);
      });
  });
}
function modifyUserpass(options) {
  const { uid, oldpass, newpass } = options
  return new Promise((resolve, reject) => {
    User.findOne({ id: uid })
      .then((data) => {
        if (!data) return Promise.reject(new errMes("???????????????"));
        const { result } = md5Solt(oldpass, data.salt);
        if (data.password !== result)
          return Promise.reject(new errMes("????????????"));
        try {
          const { result, salt } = md5Solt(newpass);
          return User.updateOne({ id: uid }, { $set: { password: result, salt } })
        } catch (error) {
          return Promise.reject(new errMes("", error));
        }
      })
      .then(res => {
        resolve({
          mes: '????????????',
          code: 1
        });
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
        reject(new errMes("??????id??????", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("??????????????????id"));
      }
    });
  });
}
function modifyUserCampusBean(uid, val) {
  return new Promise((resolve, reject) => {
    UserInformation.updateOne({ id: uid }, { $inc: { campusBean: val } }, (err, data) => {
      if (err) {
        reject(new errMes("????????????", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("????????????????????????"));
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
          reject(new errMes(`?????????????????????(${target})`, err));
        }
        if (result) {
          resolve(new sucMes(200, result));
        } else {
          reject(new errMes("??????????????????id"));
        }
      }
    );
    // UserInformation.findOne({ id: uid, "shopBus.jid": data }, (err, data) => {
    //   if (err) {
    //     reject(new errMes(`?????????????????????(${target})`, err));
    //   }
    //   if (data) {
    //     resolve(new sucMes(200, data));
    //   } else {
    //     reject(new errMes("??????????????????id"));
    //   }
    // });
    // UserInformation.updateOne(
    //   { id: uid },
    //   { $push: { [target]: data } },
    //   (err, data) => {
    //     console.log();
    //     if (err || data.acknowledged != true) {
    //       reject(new errMes(`?????????????????????(${target})`, err));
    //     }
    //     if (data) {
    //       resolve(new sucMes(200, data));
    //     } else {
    //       reject(new errMes("??????????????????id"));
    //     }
    //   }
    // );
  });
}
/*
@params target:Object???????????????????????????????????????????????????????????????
*/
function modifyUserInfoStrNum(uid, target) {
  return new Promise((resolve, reject) => {
    UserInformation.updateOne({ id: uid }, target, (err, data) => {
      if (err) {
        reject(new errMes("????????????", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("????????????????????????"));
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
  return new Promise((resolve, reject) => {
    UserInformation.updateOne({ id: uid }, { $unset: goal }, (err, data) => {
      if (err) {
        reject(new errMes("?????????????????????", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("????????????????????????"));
      }
    });
  });
}
//????????????
function UserInfoArrPush(uid, target, item) {
  return new Promise((resolve, reject) => {
    UserInformation.updateOne({ id: uid }, { $push: { [target]: item } }, (err, data) => {
      if (err) {
        reject(new errMes("????????????", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("????????????"));
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
          reject(new errMes("????????????", err));
        }
        if (data) {
          resolve(new sucMes(200, data));
        } else {
          reject(new errMes("????????????"));
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
}
function deleteUserInfoArrObj(uid, Ptarget, target, val) {
  return new Promise((resolve, reject) => {
    UserInformation.updateMany(
      { id: uid },
      { $pull: { [Ptarget]: { [target]: { $in: val } } } }
      , (err, data) => {
        if (err) {
          reject(new errMes("????????????", err));
        }
        if (data) {
          resolve(new sucMes(200, data));
        } else {
          reject(new errMes("????????????"));
        }
      });
  });
}
function deleteUserInfoArr(uid, target, val) {
  return new Promise((resolve, reject) => {
    UserInformation.updateOne({ id: uid }, { $pull: { [target]: val } }, (err, data) => {
      if (err) {
        reject(new errMes("????????????", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("????????????"));
      }
    });
  });
}
function addGood(options) {
  return new Promise((resolve, reject) => {
    UserInformation.updateOne({ id: uid }, { $pull: { [target]: val } }, (err, data) => {
      if (err) {
        reject(new errMes("????????????", err));
      }
      if (data) {
        resolve(new sucMes(200, data));
      } else {
        reject(new errMes("????????????"));
      }
    });
  });
}
function vip(options) {
  const { time, uid } = options
  const dateNow = Date.now()
  let temp = 0
  return new Promise((resolve, reject) => {
    UserInformation.findOne({ id: uid }).then(data => {
      if (!data) return Promise.reject(new errMes("????????????"))
      if (data.vip > dateNow) {
        temp = time + data.vip
      } else {
        temp = dateNow + time
      }
      return Promise.resolve(temp)
    }).then(temp => {
      UserInformation.updateOne({ id: uid }, { $set: { vip: temp } }, (err, data) => {
        if (err) {
          reject(new errMes("????????????", err));
        }
        if (data) {
          resolve(new sucMes(200, data));
        } else {
          reject(new errMes("????????????"));
        }
      });
    }).catch(err=>{
      console.log(err)
    })

  });
}
module.exports = {
  addData,
  getColData,
  getOneData,
  modifyGoods,
  modifyGoodZan,
  commitChd,
  login,
  forget,
  register,
  modifyUserpass,
  getUserInfo,
  modifyUserInfo,
  getManyData,
  deleteUserInfo,
  UserInfoArrPush,
  UserInfoArrModify,
  UserInfoArrTwoModify,
  modifyUserInfoStrNum,
  modifyUserCampusBean,
  deleteUserInfoArr,
  deleteUserInfoArrObj,
  addGood,
  vip
};
