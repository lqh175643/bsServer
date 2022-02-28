var { str_parse } = require("../utils/util");
var express = require("express");
const {
  getColData,
  getOneData,
  login,
  register,
  getUserInfo,
  modifyUserInfo,
  getManyData,
  deleteUserInfo,
  UserInfoArrPush,
  deleteUserInfoArr,
  modifyUserInfoStrNum,
  UserInfoArrModify,
  modifyGoods,
  deleteUserInfoArrObj,
  UserInfoArrTwoModify
} = require("../utils/mongodb.js");

const { generateId } = require("../utils/util")

var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/category/:name", function (req, res, next) {
  const query = req.query;
  const name = req.params.name;
  let searchLimit = query.searchLimit;
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
router.post("/register", function (req, res, next) {
  const body = req.body;
  const username = body.user;
  const pass = body.pass;
  const phone = body.phone;
  if (username && pass && phone) {
    register(username, pass, phone).then(
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
  const {val,target,Ptarget} = body
  const uid = req.uid
  deleteUserInfoArrObj(uid,Ptarget, target, val).then((data) => {
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
  UserInfoArrPush(uid, 'shopHistory', body)
    .then((data) => {
      return Promise.resolve(data)
    }).then(() => {
      const jids = body.goods.map(val => val.jid)
      return deleteUserInfoArrObj(uid, 'shopBus','jid',jids)
    }).then((data) => {
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
  
  modifyGoods('category', colName, uid, jid, 'comment', comment, score).then((data) => {
    return UserInfoArrTwoModify(uid, 'shopHistory','goods', did, jid)
  }).then((data)=>{
    res.send(data)
  }).catch((err)=>{
    console.log(err)
  })
})

module.exports = router;
