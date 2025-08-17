import twilio from 'twilio';

/**
 * Crea clientes Twilio por tenant.
 */
export function makeTwilioClients(tenant = {}) {
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

  // TaskRouter v1 (SDK v5)
  const taskrouter = workspaceSid ? client.taskrouter.v1.workspaces(workspaceSid) : null;

  // Conversations/Video helpers
  const conversations = client.conversations;
  const video = client.video;

  const voiceFrom = voiceNumber;
  const waFrom = whatsappNumber;

  return { client, taskrouter, conversations, video, voiceFrom, waFrom };
}
