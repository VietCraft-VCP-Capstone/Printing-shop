const crypto = require('crypto');

const vietcraftBE = process.env.VIETCRAFT_BE_URL || 'http://localhost:8080';
const webhookSecret = process.env.PRINTING_WEBHOOK_SECRET || 'vietcraft_hmac_webhook_secret_key_2026';

// Lazy loader for node-fetch
const getFetch = async () => {
  const fetchModule = await import('node-fetch');
  return fetchModule.default;
};

function createSignature(payloadString, timestamp) {
  const dataToSign = timestamp ? `${timestamp}.${payloadString}` : payloadString;
  return crypto.createHmac('sha256', webhookSecret).update(dataToSign).digest('hex');
}

class WebhookService {
  static async sendStatusUpdate(orderCode, vietcraftOrderId, status, supplierOrderId = null) {
    try {
      const fetch = await getFetch();
      const timestamp = Date.now().toString();
      const body = {
        event: 'order.status_update',
        order_code: orderCode,
        vietcraft_order_id: vietcraftOrderId,
        supplier_order_id: supplierOrderId,
        status: status,
        updated_at: new Date().toISOString()
      };
      const bodyStr = JSON.stringify(body);
      const signature = createSignature(bodyStr, timestamp);

      const response = await fetch(`${vietcraftBE}/api/orders/webhook/provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': signature,
          'x-webhook-timestamp': timestamp
        },
        body: bodyStr
      });

      const responseText = await response.text();
      console.log(`[WEBHOOK STATUS SENT] Response from VietCraft: ${response.status} - ${responseText}`);
      return { success: response.ok, status: response.status, data: responseText };
    } catch (err) {
      console.error('[WEBHOOK STATUS FAILED] Failed to call VietCraft webhook:', err.message);
      return { success: false, error: err.message };
    }
  }

  static async sendTrackingInfo(orderCode, vietcraftOrderId, carrier, trackingNumber, supplierOrderId = null) {
    try {
      const fetch = await getFetch();
      const timestamp = Date.now().toString();
      const body = {
        event: 'order.tracking_assigned',
        order_code: orderCode,
        vietcraft_order_id: vietcraftOrderId,
        supplier_order_id: supplierOrderId,
        status: 'SHIPPED',
        carrier: carrier,
        tracking_number: trackingNumber,
        shipped_at: new Date().toISOString()
      };
      const bodyStr = JSON.stringify(body);
      const signature = createSignature(bodyStr, timestamp);

      const response = await fetch(`${vietcraftBE}/api/orders/webhook/provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': signature,
          'x-webhook-timestamp': timestamp
        },
        body: bodyStr
      });

      const responseText = await response.text();
      console.log(`[WEBHOOK TRACKING SENT] Response from VietCraft: ${response.status} - ${responseText}`);
      return { success: response.ok, status: response.status, data: responseText };
    } catch (err) {
      console.error('[WEBHOOK TRACKING FAILED] Failed to call VietCraft webhook:', err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = WebhookService;
