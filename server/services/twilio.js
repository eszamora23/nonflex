const twilio = require('twilio');

/**
 * Create Twilio REST clients for a tenant.
 * @param {Object} tenant - Tenant configuration containing Twilio credentials.
 * @returns {Object} Object containing the Twilio client instance and helpers.
 */
function makeTwilioClients(tenant = {}) {
  const {
    accountSid,
    authToken,
    workspaceSid,
    voiceNumber,
    whatsappNumber,
  } = tenant.twilio || {};

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are not configured for tenant');
  }

  const client = twilio(accountSid, authToken);
  const taskrouter = workspaceSid
    ? client.taskrouter.workspaces(workspaceSid)
    : null;
  const conversations = client.conversations;
  const video = client.video;

  const voiceFrom = voiceNumber;
  const waFrom = whatsappNumber;

  return { client, taskrouter, conversations, video, voiceFrom, waFrom };
}

module.exports = { makeTwilioClients };
