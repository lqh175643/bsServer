const crypto = require("crypto");
function md5Solt(content, salt) {
  if (!salt) {
    salt = Math.random().toString().slice(2, 7);
  }
  try {
    let result = crypto
      .createHash("md5")
      .update(content + salt)
      .digest("hex");
    return { result, salt };
  } catch (error) {
    return false;
  }
}
module.exports = {
  md5Solt,
};
