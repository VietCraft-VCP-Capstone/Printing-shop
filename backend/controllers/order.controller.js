const PrintOrder = require('../models/order.model');
const WebhookService = require('../services/webhook.service');

class OrderController {
  static async getAllOrders(req, res) {
    try {
      const orders = await PrintOrder.find({}).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async receiveOrder(req, res) {
    try {
      const orderData = req.body;
      
      const existing = await PrintOrder.findOne({ order_code: orderData.order_code });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Order already dispatched',
          supplier_order_id: existing._id,
          order: existing
        });
      }

      const newPrintOrder = await PrintOrder.create({
        vietcraft_order_id: orderData.vietcraft_order_id,
        order_code: orderData.order_code,
        buyer_name: orderData.buyer_name,
        recipient_phone: orderData.recipient_phone || orderData.shipping_address?.phone || '',
        shipping_address: orderData.shipping_address,
        items: orderData.items,
        status: 'RECEIVED'
      });

      console.log(`[ORDER DISPATCH] Received order ${orderData.order_code} from VietCraft.`);
      res.status(201).json({
        success: true,
        supplier_order_id: newPrintOrder._id,
        order: newPrintOrder
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const orderId = req.params.id;

      const order = await PrintOrder.findByIdAndUpdate(
        orderId, 
        { status }, 
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      console.log(`[STATUS UPDATE] Order ${order.order_code} status changed to ${status}`);

      // Call webhook asynchronously with supplier_order_id
      WebhookService.sendStatusUpdate(order.order_code, order.vietcraft_order_id, status, order._id);

      res.json(order);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async shipOrder(req, res) {
    try {
      const { carrier } = req.body;
      const orderId = req.params.id;

      if (!['GHN', 'GHTK'].includes(carrier)) {
        return res.status(400).json({ error: 'Invalid shipping carrier. Must be GHN or GHTK' });
      }

      const prefix = carrier === 'GHN' ? 'GHN' : 'GHTK';
      const randDigits = Math.floor(100000000 + Math.random() * 900000000);
      const trackingNumber = `${prefix}${randDigits}`;

      const order = await PrintOrder.findByIdAndUpdate(
        orderId,
        {
          status: 'SHIPPED',
          carrier,
          tracking_number: trackingNumber,
          shipped_at: new Date()
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      console.log(`[SHIPPING DELEGATION] Order ${order.order_code} shipped via ${carrier} with tracking: ${trackingNumber}`);

      // Call webhook asynchronously with supplier_order_id
      WebhookService.sendTrackingInfo(order.order_code, order.vietcraft_order_id, carrier, trackingNumber, order._id);

      res.json(order);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = OrderController;
