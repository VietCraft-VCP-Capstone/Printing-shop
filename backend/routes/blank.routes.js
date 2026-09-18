const express = require('express');
const BlankController = require('../controllers/blank.controller');
const { authenticatePartnerOrStaff } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authenticatePartnerOrStaff, BlankController.getAllBlanks);

module.exports = router;
