const RefundRequest = require('../models/refund-request.model');
const { createRefundMarketplaceClient } = require('../services/refund-marketplace.service');
const { partnerConfig } = require('../middleware/refund-partner.middleware');

function normalizeIncoming(body, printerId) {
  if (typeof body.refund_request_id !== 'string' || !body.refund_request_id.trim() || typeof body.order_code !== 'string' || !body.order_code.trim()) {
    throw Object.assign(new Error('Thiếu mã yêu cầu hoặc mã đơn hàng.'), { statusCode: 400 });
  }
  if (body.printer_id && body.printer_id !== printerId) throw Object.assign(new Error('Yêu cầu không thuộc xưởng in này.'), { statusCode: 403 });
  const amount = Number(body.refund_amount);
  if (!['FULL', 'PARTIAL', 'EXCHANGE'].includes(body.refund_type) || !Number.isFinite(amount) || amount < 0) {
    throw Object.assign(new Error('Loại yêu cầu hoặc số tiền không hợp lệ.'), { statusCode: 400 });
  }
  if (body.evidence !== undefined && (!Array.isArray(body.evidence) || body.evidence.some(url => typeof url !== 'string'))) {
    throw Object.assign(new Error('Minh chứng không hợp lệ.'), { statusCode: 400 });
  }
  return {
    refund_request_id: body.refund_request_id.trim(), printer_id: printerId, order_code: body.order_code.trim(),
    is_v3: body.is_v3 === true, reason_category: body.reason_category, description: body.description,
    evidence: body.evidence || [], refund_type: body.refund_type, refund_amount: amount,
    ...(body.sla_deadline ? { sla_deadline: body.sla_deadline } : {}),
  };
}

function createRefundController(repository = RefundRequest, marketplace = createRefundMarketplaceClient()) {
  const failure = (res, error) => res.status(error.statusCode || 502).json({ error: error.message });
  return {
    async receive(req, res) {
      try {
        const input = normalizeIncoming(req.body || {}, req.printerActorId);
        // The unique business key makes resend after a timeout safe.
        let doc;
        try {
          doc = await repository.findOneAndUpdate({ refund_request_id: input.refund_request_id }, { $setOnInsert: input }, { upsert: true, new: true, runValidators: true });
        } catch (error) {
          if (error.code !== 11000) throw error;
          doc = await repository.findOne({ refund_request_id: input.refund_request_id });
        }
        if (doc.printer_id !== input.printer_id || doc.order_code !== input.order_code || doc.refund_type !== input.refund_type || doc.refund_amount !== input.refund_amount) {
          return res.status(409).json({ error: 'Mã yêu cầu đã tồn tại với nội dung khác.' });
        }
        return res.status(200).json({ success: true, data: doc });
      } catch (error) { return failure(res, error); }
    },
    async list(_req, res) {
      try {
        const { printerId } = partnerConfig();
        const local = await repository.find({ printer_id: printerId }).sort({ createdAt: -1 }).limit(100).lean();
        let remote = [], warning;
        try { remote = await marketplace.list(); } catch (error) { warning = `Không tải được yêu cầu từ VietCraft: ${error.message}`; }
        const rows = new Map(local.map(doc => [doc.refund_request_id, { ...doc, _id: doc.refund_request_id }]));
        for (const doc of remote) {
          const id = String(doc.id || doc._id);
          const pending = rows.get(id);
          rows.set(id, { ...pending, ...doc, _id: id, refund_request_id: id,
            ...(pending?.status === 'CALLBACK_PENDING' ? { status: 'CALLBACK_PENDING' } : {}) });
        }
        return res.json({ success: true, data: [...rows.values()], ...(warning ? { warning } : {}) });
      } catch (error) { return failure(res, error); }
    },
    async respond(req, res) {
      try {
        const { printerId } = partnerConfig();
        const id = String(req.params.id), decision = String(req.body?.decision || '').toUpperCase();
        const note = String(req.body?.note || '').trim();
        if (!['APPROVE', 'REJECT'].includes(decision) || note.length > 1000 || (decision === 'REJECT' && note.length < 3)) {
          return res.status(400).json({ error: 'Chọn chấp thuận hoặc từ chối; khi từ chối cần lý do ít nhất 3 ký tự.' });
        }
        let doc = await repository.findOne({ refund_request_id: id, printer_id: printerId });
        if (!doc) {
          // V3 requests are discovered from the assigned workshop queue, never from client payload.
          const remote = (await marketplace.list()).find(row => String(row.id || row._id) === id);
          if (!remote || remote.printer_id !== printerId) return res.status(404).json({ error: 'Không tìm thấy yêu cầu của xưởng in.' });
          const input = normalizeIncoming({ ...remote, refund_request_id: id, order_code: remote.order_id?.order_code, sla_deadline: remote.sla_deadlines?.printer_deadline }, printerId);
          doc = await repository.findOneAndUpdate({ refund_request_id: id }, { $setOnInsert: input }, { upsert: true, new: true, runValidators: true });
        }
        if (doc.decision && doc.decision !== decision) return res.status(409).json({ error: 'Yêu cầu đã được quyết định trước đó.' });
        if (doc.status === 'RESPONDED') return res.json({ success: true, data: doc });
        if (!doc.decision) {
          doc = await repository.findOneAndUpdate({ refund_request_id: id, printer_id: printerId, status: 'PENDING_PRINTER' }, {
            $set: { status: 'CALLBACK_PENDING', decision, note, decided_by: req.user._id },
          }, { new: true, runValidators: true });
          if (!doc) return res.status(409).json({ error: 'Yêu cầu vừa được xử lý; hãy tải lại.' });
        }
        try {
          const data = await marketplace.respond(id, doc.decision, doc.note);
          await repository.updateOne({ refund_request_id: id, printer_id: printerId }, { $set: { status: 'RESPONDED', responded_at: new Date(), callback_error: '' } });
          return res.json({ success: true, data });
        } catch (error) {
          await repository.updateOne({ refund_request_id: id, printer_id: printerId }, { $set: { callback_error: error.message } });
          return res.status(502).json({ error: `Đã lưu quyết định nhưng chưa gửi được về VietCraft: ${error.message}. Hãy gửi lại.` });
        }
      } catch (error) { return failure(res, error); }
    },
  };
}

module.exports = { createRefundController, normalizeIncoming };
