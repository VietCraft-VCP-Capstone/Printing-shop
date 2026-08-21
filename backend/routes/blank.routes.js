const express = require('express');
const BlankController = require('../controllers/blank.controller');

const router = express.Router();

router.get('/', BlankController.getAllBlanks);

module.exports = router;
