const PrintOrder = require('../models/order.model');
const WebhookService = require('../services/webhook.service');

class OrderController {
  static async getAllOrders(req, res) {
    try {
      let filter = {};

      if (req.user) {
        const role = req.user.role;
        if (role === 'SELLER') {
          // Seller chi thay don do shop cua minh dat in
          const sId = req.user._id.toString();
          filter.$or = [
            { seller_id: sId },
            { seller_id: req.user.email }
          ];
        } else {
          // PRINTER: Chi thay don duoc chi dinh cho dung xuong cua minh
          const pId = req.user._id.toString();
          filter.$or = [
            { printer_id: pId },
            ...(req.user.email === 'printer@vietcraft.print' || req.user.email === 'admin@vietcraft.print'
              ? [{ printer_id: { $exists: false } }, { printer_id: null }]
              : [])
          ];
        }
      }

      const orders = await PrintOrder.find(filter).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async receiveOrder(req, res) {
    try {
      const orderData = req.body;
      const apiKey = req.headers['x-api-key'] || req.body.api_key;
      
      const existing = await PrintOrder.findOne({ order_code: orderData.order_code });
      if (existing) {
        return res.status(200).json({ message: 'Order already dispatched', order: existing });
      }

      let printer_id = orderData.printer_id || null;
      let printer_name = orderData.printer_name || null;

      if (apiKey) {
        const Partnership = require('../models/partnership.model');
        const partnership = await Partnership.findOne({ api_key: String(apiKey).trim(), status: 'ACCEPTED' })
          .populate('printer_id', 'name workshop_name');
        if (partnership) {
          printer_id = partnership.printer_id?._id?.toString() || partnership.printer_id?.toString();
          printer_name = partnership.printer_name || partnership.printer_id?.workshop_name || partnership.printer_id?.name;
        }
      }

      if (!printer_id) {
        const User = require('../models/user.model');
        const defaultPrinter = await User.findOne({ role: { $in: ['PRINTER', 'ADMIN'] } }).select('_id name workshop_name').lean();
        if (defaultPrinter) {
          printer_id = defaultPrinter._id.toString();
          printer_name = defaultPrinter.workshop_name || defaultPrinter.name;
        }
      }

      const newPrintOrder = await PrintOrder.create({
        vietcraft_order_id: orderData.vietcraft_order_id,
        order_code: orderData.order_code,
        printer_id,
        printer_name,
        shop_name: orderData.shop_name || 'VietCraft Shop',
        seller_id: orderData.seller_id,
        buyer_name: orderData.buyer_name,
        recipient_phone: orderData.recipient_phone || orderData.shipping_address?.phone || '',
        shipping_address: orderData.shipping_address,
        items: orderData.items,
        status: 'RECEIVED'
      });

      console.log(`[ORDER DISPATCH] Received order ${orderData.order_code} from VietCraft (${orderData.shop_name || 'VietCraft Shop'}) for printer ${printer_name} (${printer_id}).`);
      res.status(201).json(newPrintOrder);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { status, rejection_reason } = req.body;
      const orderId = req.params.id;

      const existingOrder = await PrintOrder.findById(orderId);
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Kiem tra quyen so huu cua xuong in
      if (req.user && req.user.role === 'PRINTER') {
        const pId = req.user._id.toString();
        if (existingOrder.printer_id && existingOrder.printer_id !== pId && req.user.email !== 'printer@vietcraft.print') {
          return res.status(403).json({ error: 'Bạn không có quyền thao tác trên đơn hàng của xưởng khác.' });
        }
      }

      const updateData = { status };
      if (status === 'REJECTED' && rejection_reason) {
        updateData.rejection_reason = rejection_reason;
      }

      const order = await PrintOrder.findByIdAndUpdate(
        orderId, 
        updateData, 
        { new: true }
      );

      console.log(`[STATUS UPDATE] Order ${order.order_code} status changed to ${status}`);

      // Call webhook asynchronously
      WebhookService.sendStatusUpdate(order.order_code, order.vietcraft_order_id, status, order.rejection_reason);

      res.json(order);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  static async shipOrder(req, res) {
    try {
      const { carrier } = req.body;
      const orderId = req.params.id;

      const existingOrder = await PrintOrder.findById(orderId);
      if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Kiem tra quyen so huu cua xuong in
      if (req.user && req.user.role === 'PRINTER') {
        const pId = req.user._id.toString();
        if (existingOrder.printer_id && existingOrder.printer_id !== pId && req.user.email !== 'printer@vietcraft.print') {
          return res.status(403).json({ error: 'Bạn không có quyền giao đơn hàng của xưởng khác.' });
        }
      }

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

      console.log(`[SHIPPING DELEGATION] Order ${order.order_code} shipped via ${carrier} with tracking: ${trackingNumber}`);

      // Call webhook asynchronously
      WebhookService.sendTrackingInfo(order.order_code, order.vietcraft_order_id, carrier, trackingNumber);

      res.json(order);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = OrderController;
