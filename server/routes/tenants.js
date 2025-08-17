import express from 'express';

const router = express.Router();

/**
 * Devuelve la config del tenant actual (sin secretos).
 */
router.get('/current', (req, res) => {
  if (!req.tenant) return res.status(404).json({ error: 'Tenant not found' });
  const { twilio, ai, ...rest } = req.tenant;
  res.json({
    ...rest,
    twilio: twilio ? {
      accountSid: twilio.accountSid,
      conversationsServiceSid: twilio.conversationsServiceSid,
      workspaceSid: twilio.workspaceSid,
      workflowSid: twilio.workflowSid,
      voiceNumber: twilio.voiceNumber,
      whatsappNumber: twilio.whatsappNumber
    } : null,
    ai: ai ? { provider: 'openai', model: ai.model || 'gpt-4o-mini' } : null
  });
});

export default router;
