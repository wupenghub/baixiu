var express = require('express');
var router = express.Router();
var DbUtils = require('../DbUtils');
var md5 = require('md5-node');
router.get('/letao/homePage', function (req, res) {
    console.log('首页接口');
});
module.exports = router;