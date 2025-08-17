const twilio = require('twilio');

/**
 * Create Twilio REST clients for a tenant.
 * @param {Object} tenant - Tenant configuration containing Twilio credentials.
 * @returns {Object} Object containing the Twilio client instance.
 */
function makeTwilioClients(tenant = {}) {
  const accountSid = tenant.twilioAccountSid || tenant.accountSid;
  const authToken = tenant.twilioAuthToken || tenant.authToken;

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are not configured for tenant');
  }

  const client = twilio(accountSid, authToken);
  return { client };
}

module.exports = { makeTwilioClients };
