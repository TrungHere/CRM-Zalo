var express = require('express');
var router = express.Router();

const data = require('../controllers/data')
const router = express.Router();
const functions = require('../services/functions');
var login =  require('./crm/Marketing/ZaloLogin');


router.use('/login',login)


module.exports = router;