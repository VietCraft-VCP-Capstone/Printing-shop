const vietcraftBE = process.env.VIETCRAFT_BE_URL || 'http://localhost:8080';
const getFetch = async () => (await import('node-fetch')).default;

class RefundProxyService {
  static async list() {
    const fetch = await getFetch();
    const response = await fetch(`${vietcraftBE}/api/printer/refund-requests`, {
      headers: { 'x-refund-printer-secret': process.env.VIETCRAFT_REFUND_PRINTER_SECRET || '' }
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || `VietCraft API returned ${response.status}`);
    return body;
  }

  static async respond(requestId, decision, note) {
    const fetch = await getFetch();
    const response = await fetch(`${vietcraftBE}/api/printer/refund-requests/${encodeURIComponent(requestId)}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-refund-printer-secret': process.env.VIETCRAFT_REFUND_PRINTER_SECRET || '' },
      body: JSON.stringify({ decision, note })
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || `VietCraft API returned ${response.status}`);
    return body;
  }
}

module.exports = RefundProxyService;
