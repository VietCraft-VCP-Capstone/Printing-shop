const express = require('express');
const blankRoutes = require('./blank.routes');
const orderRoutes = require('./order.routes');
const authRoutes = require('./auth.routes');
const partnershipRoutes = require('./partnership.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/blanks', blankRoutes);
router.use('/orders', orderRoutes);
router.use('/partnerships', partnershipRoutes);

module.exports = router;
