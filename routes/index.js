var express = require("express");
const {
  getColData,
  getOneData,
  login,
  register,
  getUserInfo,
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
        console.log(reject)
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
  const token = req.get("token");
  getUserInfo(token).then(
    (data) => {
      res.send(data)
    },
    (err) => {
      res.send(err)
    }
  );
});
module.exports = router;
