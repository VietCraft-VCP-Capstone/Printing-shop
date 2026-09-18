const express = require('express');
const OrderController = require('../controllers/order.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

const apiKeyAuth = (req, res, next) => {
  const expectedKey = process.env.PRINTING_SHOP_API_KEY;
  if (!expectedKey) {
    return res.status(500).json({ error: 'Server configuration error: PRINTING_SHOP_API_KEY is not configured.' });
  }

  const providedKey = req.headers['x-api-key'] || (req.headers['authorization']?.startsWith('ApiKey ') ? req.headers['authorization'].replace('ApiKey ', '') : null);
  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing X-API-Key' });
  }
  next();
};

router.post('/', apiKeyAuth, OrderController.receiveOrder);

// Protect other internal dashboard endpoints
router.get('/', authenticate, OrderController.getAllOrders);
router.put('/:id/status', authenticate, OrderController.updateStatus);

// ADMIN and LOGISTICS can perform shipping delegation
router.post('/:id/ship', authenticate, requireRole(['ADMIN', 'LOGISTICS']), OrderController.shipOrder);

module.exports = router;
