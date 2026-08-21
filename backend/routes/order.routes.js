const express = require('express');
const OrderController = require('../controllers/order.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Order dispatch from partner (VietCraft BE) remains public
router.post('/', OrderController.receiveOrder);

// Protect other endpoints
router.get('/', authenticate, OrderController.getAllOrders);
router.put('/:id/status', authenticate, OrderController.updateStatus);

// Only ADMIN can perform shipping delegation
router.post('/:id/ship', authenticate, requireRole(['ADMIN']), OrderController.shipOrder);

module.exports = router;
