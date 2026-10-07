const crypto = require('crypto');
const vietcraftBE = process.env.VIETCRAFT_BE_URL || 'http://localhost:8080';
const webhookSecret = process.env.PRINTER_WEBHOOK_SECRET || process.env.PRINTING_WEBHOOK_SECRET || process.env.VIETCRAFT_WEBHOOK_SECRET || '';
if (!webhookSecret) console.warn('[WEBHOOK] Chưa cấu hình PRINTING_WEBHOOK_SECRET; webhook gửi về VietCraft sẽ bị từ chối.');

// Lazy loader for node-fetch@2 (which is CommonJS compatible, or we can use dynamic import for ESM node-fetch)
const getFetch = async () => {
  const fetchModule = await import('node-fetch');
  return fetchModule.default;
};

class WebhookService {
  static async sendStatusUpdate(orderCode, vietcraftOrderId, status, rejectionReason) {
    try {
      const fetch = await getFetch();
      const payload = {
        order_code: orderCode,
        vietcraft_order_id: vietcraftOrderId,
        status: status
      };
      if (rejectionReason) {
        payload.rejection_reason = rejectionReason;
      }

      const bodyStr = JSON.stringify(payload);
      const signature = crypto.createHmac('sha256', webhookSecret).update(bodyStr).digest('hex');

      const response = await fetch(`${vietcraftBE}/api/orders/webhook/printer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': signature
        },
        body: bodyStr
      });

      const responseText = await response.text();
      console.log(`[WEBHOOK STATUS SENT] Response from VietCraft: ${response.status} - ${responseText}`);
      return { success: true, status: response.status };
    } catch (err) {
      console.error('[WEBHOOK STATUS FAILED] Failed to call VietCraft webhook:', err.message);
      return { success: false, error: err.message };
    }
  }

  static async sendTrackingInfo(orderCode, vietcraftOrderId, carrier, trackingNumber) {
    try {
      const fetch = await getFetch();
      const payload = {
        order_code: orderCode,
        vietcraft_order_id: vietcraftOrderId,
        carrier: carrier,
        tracking_number: trackingNumber
      };

      const bodyStr = JSON.stringify(payload);
      const signature = crypto.createHmac('sha256', webhookSecret).update(bodyStr).digest('hex');

      const response = await fetch(`${vietcraftBE}/api/orders/webhook/tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': signature
        },
        body: bodyStr
      });

      const responseText = await response.text();
      console.log(`[WEBHOOK TRACKING SENT] Response from VietCraft: ${response.status} - ${responseText}`);
      return { success: true, status: response.status };
    } catch (err) {
      console.error('[WEBHOOK TRACKING FAILED] Failed to call VietCraft webhook:', err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = WebhookService;
