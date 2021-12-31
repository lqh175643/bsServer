var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/category/snacks', function(req, res, next) {
  console.log('1234');
});
module.exports = router;
