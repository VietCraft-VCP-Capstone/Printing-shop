const vietcraftBE = process.env.VIETCRAFT_BE_URL || 'http://localhost:8080';
const getFetch = async () => (await import('node-fetch')).default;

function getAuthHeaders() {
  const apiKey = process.env.VIETCRAFT_REFUND_API_KEY || '57776a7b504eb0b013ba66fca353166e29c1890dca8a6a4ad3df999a1ed83400';
  const printerId = process.env.PRINTER_REFUND_PRINTER_ID || 'PRINTER_SHOP';
  const secret = process.env.VIETCRAFT_REFUND_PRINTER_SECRET || apiKey;
  return {
    'x-vietcraft-refund-key': apiKey,
    'x-printer-id': printerId,
    'x-refund-printer-secret': secret,
  };
}

class RefundProxyService {
  static async list() {
    const fetch = await getFetch();
    const response = await fetch(`${vietcraftBE}/api/printer/refund-requests`, {
      headers: getAuthHeaders()
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || `VietCraft API returned ${response.status}`);
    return body;
  }

  static async respond(requestId, decision, note) {
    const fetch = await getFetch();
    const response = await fetch(`${vietcraftBE}/api/printer/refund-requests/${encodeURIComponent(requestId)}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ decision, note })
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || `VietCraft API returned ${response.status}`);
    return body;
  }
}

module.exports = RefundProxyService;
