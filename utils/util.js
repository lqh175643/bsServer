const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

function generateId() {
  const random = Math.random().toString().slice(2, 7);
  const date = Date.now();
  return random + date;
}

function generateToken(data) {
  let token;
  let created = Math.floor(Date.now() / 1000);
  let cert = fs.readFileSync(path.join(__dirname, "../pri.key"));
  try {
    token = jwt.sign(
      {
        data,
        exp: created + 60 * 30,
      },
      cert,
      { algorithm: "RS256" }
    );
  } catch (error) {}
  return token;
}

function verifyToken(token) {
  let cert = fs.readFileSync(path.join(__dirname, "../pub.key"));
  let res;
  jwt.verify(token, cert, (err, decoded) => {
    if (err) {
      throw err;
    }
    let { exp = 0 } = decoded;
    let current = Math.floor(Date.now() / 1000);
    if(current<=exp){
      res = decoded.data || {};
    }
  });
  return res;
}

class errMes{
  constructor(mes,err){
    this.mes = mes || ''
    this.err = err || '未知错误'
  }
}

class sucMes{
  constructor(code,data,mes){
    this.code = code || 200
    this.data = data || {}
    this.mes = mes || '请求成功'
  }
}

module.exports = {
  generateId,
  generateToken,
  verifyToken,
  errMes,
  sucMes
};
