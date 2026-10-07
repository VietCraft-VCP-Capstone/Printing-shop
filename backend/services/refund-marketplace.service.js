const fetch = require('node-fetch');
const { partnerConfig } = require('../middleware/refund-partner.middleware');

function createRefundMarketplaceClient(fetchRequest = fetch) {
  async function request(path, body) {
    const { key, printerId, marketplaceUrl } = partnerConfig();
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 10000);
    try {
      const response = await fetchRequest(`${marketplaceUrl}/api/printer/refund-requests${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json', 'x-vietcraft-refund-key': key, 'x-printer-id': printerId },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: abort.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `VietCraft trả lỗi ${response.status}`);
      return data.data;
    } finally { clearTimeout(timer); }
  }
  return {
    list: () => request(''),
    respond: (id, decision, note) => request(`/${encodeURIComponent(id)}/respond`, { decision, note }),
  };
}

module.exports = { createRefundMarketplaceClient };
