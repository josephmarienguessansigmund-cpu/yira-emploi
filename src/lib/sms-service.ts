const AT_API_URL = 'https://api.africastalking.com/version1/messaging';
const AT_SANDBOX_URL = 'https://api.sandbox.africastalking.com/version1/messaging';

function getConfig() {
  const apiKey = process.env.AT_API_KEY || '';
  const username = process.env.AT_USERNAME || '';
  const sandbox = process.env.AT_SANDBOX === 'true';
  return { apiKey, username, sandbox };
}

export const smsService = {
  send: async (to: string, message: string): Promise<{ success: boolean; error?: string }> => {
    const { apiKey, username, sandbox } = getConfig();

    // Fallback to console.log if no credentials configured
    if (!apiKey || !username) {
      console.log(`[SMS][NO-CREDS] SMS à ${to}: ${message}`);
      return { success: true };
    }

    const url = sandbox ? AT_SANDBOX_URL : AT_API_URL;

    // Normalize phone for CI (+225)
    let phone = to.replace(/\s/g, '');
    if (!phone.startsWith('+')) {
      phone = phone.startsWith('225') ? `+${phone}` : `+225${phone}`;
    }

    const body = new URLSearchParams({
      username,
      to: phone,
      message,
    });

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': apiKey,
        },
        body: body.toString(),
      });

      const data = await res.json();
      const recipients = data?.SMSMessageData?.Recipients;

      if (recipients && recipients.length > 0 && recipients[0].status === 'Success') {
        return { success: true };
      }

      const statusMsg = recipients?.[0]?.status || data?.SMSMessageData?.Message || 'Envoi échoué';
      console.error(`[SMS] Échec envoi à ${phone}: ${statusMsg}`);
      return { success: false, error: statusMsg };
    } catch (err) {
      console.error('[SMS] Erreur réseau:', err);
      return { success: false, error: 'Erreur réseau SMS' };
    }
  },
};
