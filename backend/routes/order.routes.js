const express = require('express');
const OrderController = require('../controllers/order.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { verifyRefundPartner } = require('../middleware/refund-partner.middleware');
const { createRefundController } = require('../controllers/refund-request.controller');

const router = express.Router();
const refunds = createRefundController();

router.post('/refund-requests', verifyRefundPartner, refunds.receive);
router.get('/refund-requests', authenticate, requireRole(['PRINTER', 'ADMIN', 'OPERATOR']), refunds.list);
router.post('/refund-requests/:id/respond', authenticate, requireRole(['PRINTER', 'ADMIN', 'OPERATOR']), refunds.respond);

// Order dispatch from partner (VietCraft BE) remains public
router.post('/', OrderController.receiveOrder);

// Protect other endpoints
router.get('/', authenticate, OrderController.getAllOrders);
router.put('/:id/status', authenticate, requireRole(['PRINTER', 'ADMIN', 'OPERATOR']), OrderController.updateStatus);

// PRINTER and ADMIN can perform shipping delegation
router.post('/:id/ship', authenticate, requireRole(['PRINTER', 'ADMIN']), OrderController.shipOrder);

module.exports = router;
