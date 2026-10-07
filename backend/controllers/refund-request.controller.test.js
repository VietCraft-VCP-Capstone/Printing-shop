const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createRefundController } = require('./refund-request.controller');
const { verifyRefundPartner } = require('../middleware/refund-partner.middleware');
const { createRefundMarketplaceClient } = require('../services/refund-marketplace.service');

function memoryRepository() {
  const rows = [];
  const matches = (row, query) => Object.entries(query).every(([key, value]) => row[key] === value);
  return {
    rows,
    async findOne(query) { return rows.find(row => matches(row, query)) || null; },
    async findOneAndUpdate(query, update, options = {}) {
      let row = rows.find(doc => matches(doc, query));
      if (!row && options.upsert) { row = { _id: 'local-id', status: 'PENDING_PRINTER', ...update.$setOnInsert }; rows.push(row); }
      if (row && update.$set) Object.assign(row, update.$set);
      return row || null;
    },
    async updateOne(query, update) { const row = rows.find(doc => matches(doc, query)); if (row) Object.assign(row, update.$set); },
    find(query) { return { sort: () => ({ limit: () => ({ lean: async () => rows.filter(row => matches(row, query)) }) }) }; },
  };
}
function response() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}
const incoming = { refund_request_id: 'request-1', printer_id: 'workshop-1', order_code: 'VC-1', refund_type: 'FULL', refund_amount: 10000, description: 'Print defect', evidence: [] };
async function configured(run) {
  const previous = { key: process.env.PRINTER_REFUND_API_KEY, id: process.env.PRINTER_REFUND_PRINTER_ID };
  process.env.PRINTER_REFUND_API_KEY = 'test-shared-key'; process.env.PRINTER_REFUND_PRINTER_ID = 'workshop-1';
  try { await run(); } finally {
    if (previous.key === undefined) delete process.env.PRINTER_REFUND_API_KEY; else process.env.PRINTER_REFUND_API_KEY = previous.key;
    if (previous.id === undefined) delete process.env.PRINTER_REFUND_PRINTER_ID; else process.env.PRINTER_REFUND_PRINTER_ID = previous.id;
  }
}

test('partner receive endpoint rejects invalid credentials and stores a resend only once', async () => configured(async () => {
  const repository = memoryRepository();
  const controller = createRefundController(repository, {});
  const app = express(); app.use(express.json());
  app.post('/api/orders/refund-requests', verifyRefundPartner, controller.receive);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const send = (body, headers = {}) => fetch(`http://127.0.0.1:${server.address().port}/api/orders/refund-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const headers = { 'x-vietcraft-refund-key': 'test-shared-key', 'x-printer-id': 'workshop-1' };
  try {
    assert.equal((await send(incoming)).status, 401);
    assert.equal(repository.rows.length, 0);
    assert.equal((await send(incoming, { ...headers, 'x-printer-id': 'another' })).status, 401);
    assert.equal((await send(incoming, headers)).status, 200);
    assert.equal((await send(incoming, headers)).status, 200);
    assert.equal(repository.rows.length, 1);
    assert.equal((await send({ ...incoming, refund_amount: 20000 }, headers)).status, 409);
    assert.equal((await send({ ...incoming, printer_id: 'another' }, headers)).status, 403);
  } finally { await new Promise(resolve => server.close(resolve)); }
}));

test('callback failure preserves the decision; retry cannot reverse it or resend after success', async () => configured(async () => {
  const repository = memoryRepository();
  let fail = true, calls = 0;
  const controller = createRefundController(repository, { async respond(id, decision) { calls++; assert.equal(id, 'request-1'); assert.equal(decision, 'APPROVE'); if (fail) throw new Error('callback timeout'); return { status: 'PRINTER_APPROVED' }; } });
  await controller.receive({ body: incoming, printerActorId: 'workshop-1' }, response());
  const req = { params: { id: 'request-1' }, body: { decision: 'APPROVE', note: 'Confirmed' }, user: { _id: 'admin-1' } };
  const failed = response(); await controller.respond(req, failed);
  assert.equal(failed.statusCode, 502);
  assert.equal(repository.rows[0].status, 'CALLBACK_PENDING');
  assert.equal(repository.rows[0].decision, 'APPROVE');
  const reverse = response(); await controller.respond({ ...req, body: { decision: 'REJECT', note: 'Changed mind' } }, reverse);
  assert.equal(reverse.statusCode, 409); assert.equal(calls, 1);
  fail = false;
  const retry = response(); await controller.respond(req, retry);
  assert.equal(retry.statusCode, 200); assert.equal(repository.rows[0].status, 'RESPONDED'); assert.equal(calls, 2);
  await controller.respond(req, response()); assert.equal(calls, 2);
}));

test('V3 decisions use only requests assigned by the marketplace queue', async () => configured(async () => {
  const repository = memoryRepository(); let calls = 0;
  let printerId = 'another-workshop';
  const controller = createRefundController(repository, {
    async list() { return [{ ...incoming, _id: 'v3-1', is_v3: true, printer_id: printerId, order_id: { order_code: 'VC-1' } }]; },
    async respond() { calls++; return { status: 'AWAITING_ADMIN_REFUND' }; },
  });
  const req = { params: { id: 'v3-1' }, body: { decision: 'APPROVE' }, user: { _id: 'admin-1' } };
  const denied = response(); await controller.respond(req, denied);
  assert.equal(denied.statusCode, 404); assert.equal(repository.rows.length, 0); assert.equal(calls, 0);
  printerId = 'workshop-1';
  const accepted = response(); await controller.respond(req, accepted);
  assert.equal(accepted.statusCode, 200); assert.equal(repository.rows[0].is_v3, true); assert.equal(calls, 1);
}));

test('marketplace client sends the workshop identity and shared key without using user JWTs', async () => configured(async () => {
  const requests = [];
  const client = createRefundMarketplaceClient(async (url, options) => { requests.push({ url, options }); return { ok: true, async json() { return { data: [] }; } }; });
  await client.list(); await client.respond('id/with slash', 'REJECT', 'Defect not confirmed');
  assert.equal(requests[0].options.headers['x-vietcraft-refund-key'], 'test-shared-key');
  assert.equal(requests[0].options.headers['x-printer-id'], 'workshop-1');
  assert.equal(requests[0].options.signal.aborted, false);
  assert.ok(requests[1].url.endsWith('/id%2Fwith%20slash/respond'));
  assert.deepEqual(JSON.parse(requests[1].options.body), { decision: 'REJECT', note: 'Defect not confirmed' });
}));
