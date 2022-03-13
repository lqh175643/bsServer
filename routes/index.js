var { str_parse, generateId,category } = require("../utils/util");
var express = require("express");
const {
  addData,
  getColData,
  getOneData,
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
  deleteUserInfoArr,
  modifyUserInfoStrNum,
  modifyUserCampusBean,
  UserInfoArrModify,
  modifyGoods,
  deleteUserInfoArrObj,
  UserInfoArrTwoModify,
  vip
} = require("../utils/mongodb.js");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/category/:name", function (req, res, next) {
  const query = req.query;
  const name = req.params.name;
  let searchLimit = query.searchLimit;
  if(category.includes(name)){
    getColData(
      "category",
      name,
      Number(query.page),
      Number(query.limit),
      searchLimit
    ).then(
      (data) => {
        res.send(data);
      },
      (err) => {
        res.send("数据查询失败", err);
      }
    );
  }else{
    getColData(
      "category",
      "allCategory",
      Number(query.page),
      Number(query.limit),
      name
    ).then(
      (data) => {
        res.send(data);
      },
      (err) => {
        res.send("数据查询失败", err);
      }
    );
  }
  
});
router.get("/detail/:category/:id", function (req, res, next) {
  const params = req.params;
  const id = params.id;
  const category = params.category;
  getOneData("category", category + "Details", id).then((data) => {
    res.send(data);
  }),
    (err) => {
      res.send("数据查询失败", err);
    };
});
router.post("/login", function (req, res, next) {
  const body = req.body;
  const pass = new Buffer.from(body.pass, "base64").toString();
  const user = body.user;
  login(user, pass).then(
    (resolve) => {
      res.send(resolve);
    },
    (err) => {
      res.send(err);
    }
  );
});
router.post("/forget", function (req, res, next) {
  const body = req.body;
  const phone = new Buffer.from(body.phone, "base64").toString();
  const user = body.user;
  forget(user, phone).then(
    (resolve) => {
      res.send(resolve);
    },
    (err) => {
      res.send(err);
    }
  );
});
router.post("/modifyUserpass", function (req, res, next) {
  const body = req.body;
  const uid = req.uid
  const { oldpass, newpass } = body
  modifyUserpass({ uid, oldpass, newpass }).then(
    (resolve) => {
      res.send(resolve);
    },
    (err) => {
      res.send(err);
    }
  );
});
router.post("/register", function (req, res, next) {
  const body = req.body;
  const username = body.user;
  const pass = body.pass;
  const phone = body.phone;
  const invitation = body.invitation;
  if (username && pass && phone) {
    register(username, pass, phone, invitation).then(
      (resolve) => {
        res.send({
          mes: "注册成功",
          code: 1,
        });
      },
      (reject) => {
        console.log(reject);
        res.send({
          mes: reject.mes,
          err: reject.err,
          code: 0,
        });
      }
    );
  } else {
    res.send({
      mes: "系统错误，请稍后再试",
      code: 0,
    });
  }
});

router.get("/userInfo", function (req, res, next) {
  const uid = req.uid;
  getUserInfo(uid).then(
    (data) => {
      res.send(data);
    },
    (err) => {
      res.send(err);
    }
  );
});
router.post("/detail/operation", function (req, res, next) {
  const uid = req.uid;
  const body = req.body;
  const { target, category, count, jid } = body
  UserInfoArrPush(uid, target, { jid, count, category }).then(
    (data) => {
      res.send(data);
    },
    (err) => {
      res.send(err);
    }
  );
});
router.post("/detail/commitZan", function (req, res, next) {
  const fromUid = req.uid;
  const body = req.body;
  const { jid, category, toUid, cid } = body
  modifyGoodZan(toUid, fromUid, jid, cid, category + 'Details').then(
    (data) => {
      res.send(data);
    },
    (err) => {
      res.send(err);
    }
  );
});
router.post("/detail/commitChd", function (req, res, next) {
  const uid = req.uid;
  const body = req.body;
  const time = Date.now()
  const { jid, cid, category, val } = body
  commitChd({ uid, jid, cid, category: category + 'Details', val, time })
    .then(
      (data) => {
        res.send(data);
      },
      (err) => {
        res.send(err);
      }
    );
});
router.get("/userInfo/shopBus", function (req, res, next) {
  const query = req.query;
  const ids = query.ids;
  getManyData("category", "allCategory", ids).then(
    (data) => {
      res.send(data);
    },
    (err) => {
      res.send(err);
    }
  );
});
router.post("/userInfo/collection", function (req, res, next) {
  const body = req.body
  const jid = body.jid
  const target = body.target
  const uid = req.uid
  UserInfoArrPush(uid, target, jid).then((data) => {
    res.send(data)
  }, err => {
    console.log(err)
  })
})
router.post("/userInfo/footprint", function (req, res, next) {
  const body = req.body
  const jid = body.jid
  const target = body.target
  const uid = req.uid
  UserInfoArrPush(uid, target, jid).then((data) => {
    res.send(data)
  }, err => {
    console.log(err)
  })
})
router.delete('/userInfo/delete', function (req, res, next) {
  const body = req.body;
  const jid = body.jid
  const target = body.target
  const uid = req.uid
  deleteUserInfo(uid, target, jid).then((data) => {
    res.send(data)
  }, err => {
    console.log(err)
  })
})
router.delete('/userInfo/deleteArr', function (req, res, next) {
  const body = req.body;
  const val = body.val
  const target = body.target
  const uid = req.uid
  deleteUserInfoArr(uid, target, val).then((data) => {
    res.send(data)
  }, err => {
    console.log(err)
  })
})

router.delete('/userInfo/deleteArrObj', function (req, res, next) {
  const body = req.body;
  const { val, target, Ptarget } = body
  const uid = req.uid
  deleteUserInfoArrObj(uid, Ptarget, target, val).then((data) => {
    res.send(data)
  }, err => {
    console.log(err)
  })
})

router.post('/userInfo/userinfo', function (req, res, next) {
  const body = req.body
  const uid = req.uid
  modifyUserInfoStrNum(uid, body).then((data) => {
    res.send(data)
  }, err => {
    console.log(err)
  })
})

router.post('/userInfo/receivingaddress', function (req, res, next) {
  const body = req.body
  const uid = req.uid
  UserInfoArrPush(uid, 'receivingAddress', body).then((data) => {
    res.send(data)
  }, err => {
    console.log(err)
  })
})

router.post('/order/generate', function (req, res, next) {
  const body = req.body
  const uid = req.uid
  body.did = 'd' + generateId()
  let allPrice = 0
  body.goods.forEach(val => allPrice += Number(val.price * val.count))
  UserInfoArrPush(uid, 'shopHistory', body)
    .then((data) => {
      return Promise.resolve(data)
    }).then(() => {
      const jids = body.goods.map(val => val.jid)
      return deleteUserInfoArrObj(uid, 'shopBus', 'jid', jids)
    }).then(() => {
      const temp = body.is_vip?2:1
      return modifyUserCampusBean(uid, Math.floor(allPrice*temp) - body.campusBean)
    }).then(data => {
      res.send(data)
    }).catch((err) => {
      res.send(err)
    })
})

router.delete('/order/delete', function (req, res, next) {
  const body = req.body
  const uid = req.uid
  const val = body.val
  const target = body.target
  deleteUserInfoArr(uid, target, val).then((data) => {
    res.send(data)
  }, err => {
    console.log(err)
  })
})

router.post('/order/receive', function (req, res, next) {
  const body = req.body
  const did = body.did
  const uid = req.uid
  UserInfoArrModify(uid, 'shopHistory', did, 'isReceive').then((data) => {
    res.send(data)
  }, err => {
    console.log(err)
  })
})

router.post('/order/commit', function (req, res, next) {
  const uid = req.uid
  const body = req.body
  const jid = body.jid
  const colName = body.colName + 'Details'
  const comment = body.comment
  const score = body.score
  const did = body.did
  const cid = 'c' + generateId()
  modifyGoods('category', colName, uid, jid, 'comment', comment, score, cid).then((data) => {
    return UserInfoArrTwoModify(uid, 'shopHistory', 'goods', did, jid)
  }).then((data) => {
    res.send(data)
  }).catch((err) => {
    console.log(err)
  })
})
router.post('/vipChange',function(req,res,next){
  const uid = req.uid
  const body = req.body
  const time = body.time*1000*60*60*24*30
  vip({uid,time}).then((data) => {
    res.send(data)
  }, err => {
    console.log(err)
  })
})
router.post('/addGood', function (req, res, next) {
  const body = req.body
  // const uid = req.uid
  const good = {
    price: body.price,
    imgUrl: body.picture,
    detail: body.des,
    id: body.jid,
    category: body.category
  }
  const goodDetail = {
    images: body.pictures.split(','),
    comment: [],
    introductionPicture: body.introductionPictures.split(','),
    productDescription: body.des,
    price: body.price,
    id: body.jid,
    category: body.category
  }
  addData([good], 'category', body.category).then(res => {
    return addData([goodDetail], 'category', body.category + 'Details')
  }).then((data) => {
    res.send(data)
  }).catch((err) => {
    console.log(err)
  })
})

module.exports = router;
