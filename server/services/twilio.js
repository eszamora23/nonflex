import twilio from 'twilio';

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

  // SDK v5: TaskRouter v1
  const taskrouter = workspaceSid ? client.taskrouter.v1.workspaces(workspaceSid) : null;

  // Conversations/Video helpers (usaremos .v1 en rutas)
  const conversations = client.conversations;
  const video = client.video;

  const voiceFrom = voiceNumber;
  const waFrom = whatsappNumber;

  return { client, taskrouter, conversations, video, voiceFrom, waFrom };
}

export { makeTwilioClients };
