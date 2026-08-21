const vietcraftBE = process.env.VIETCRAFT_BE_URL || 'http://localhost:8080';

// Lazy loader for node-fetch@2 (which is CommonJS compatible, or we can use dynamic import for ESM node-fetch)
const getFetch = async () => {
  const fetchModule = await import('node-fetch');
  return fetchModule.default;
};

class WebhookService {
  static async sendStatusUpdate(orderCode, vietcraftOrderId, status) {
    try {
      const fetch = await getFetch();
      const response = await fetch(`${vietcraftBE}/api/orders/webhook/printer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_code: orderCode,
          vietcraft_order_id: vietcraftOrderId,
          status: status
        })
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
      const response = await fetch(`${vietcraftBE}/api/orders/webhook/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_code: orderCode,
          vietcraft_order_id: vietcraftOrderId,
          carrier: carrier,
          tracking_number: trackingNumber
        })
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
