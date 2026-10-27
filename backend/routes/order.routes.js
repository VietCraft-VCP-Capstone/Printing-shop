const express = require('express');
const crypto = require('crypto');
const OrderController = require('../controllers/order.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const upload = require('../middleware/upload.middleware');

const router = express.Router();

function verifyVietCraftRefundKey(req, res, next) {
  const expected = process.env.VIETCRAFT_REFUND_API_KEY || '';
  const supplied = String(req.headers['x-vietcraft-refund-key'] || '');
  const a = Buffer.from(expected); const b = Buffer.from(supplied);
  if (!expected || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Unauthorized VietCraft refund dispatch.' });
  }
  next();
}

// Order dispatch from partner (VietCraft BE) remains public
router.post('/', OrderController.receiveOrder);
router.post('/refund-requests', verifyVietCraftRefundKey, OrderController.receiveRefundRequest);

// Printer decisions for VietCraft POD refund requests use the existing Printing portal.
router.get('/refund-requests', authenticate, requireRole(['ADMIN', 'OPERATOR', 'PRINTER']), OrderController.getRefundRequests);
router.post('/refund-requests/upload-evidence', authenticate, requireRole(['ADMIN', 'OPERATOR', 'PRINTER']), upload.single('file'), OrderController.uploadRefundEvidence);
router.post('/refund-requests/:requestId/respond', authenticate, requireRole(['ADMIN', 'OPERATOR', 'PRINTER']), OrderController.respondToRefundRequest);

// Protect other endpoints
router.get('/', authenticate, OrderController.getAllOrders);
router.put('/:id/status', authenticate, requireRole(['PRINTER', 'ADMIN', 'OPERATOR']), OrderController.updateStatus);

// PRINTER and ADMIN can perform shipping delegation
router.post('/:id/ship', authenticate, requireRole(['PRINTER', 'ADMIN']), OrderController.shipOrder);

module.exports = router;
