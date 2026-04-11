const axios = require('axios');

// IMPORTANT: Restart server after changing .env
async function sendWhatsAppMessage(to, messageText) {
  try {
    const phoneNumberId = process.env.PHONE_NUMBER_ID;
    const accessToken   = process.env.WHATSAPP_TOKEN; 

    if (!phoneNumberId || !accessToken) {
       console.warn("⚠️ WhatsApp credentials missing. Assuming dev mode. Message not sent:", messageText);
       return;
    }

    console.log("Using WhatsApp Token:", process.env.WHATSAPP_TOKEN);

    const apiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    await axios.post(
      apiUrl,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: messageText },
      },
      {
        headers: {
          Authorization  : `Bearer ${accessToken}`,
          'Content-Type' : 'application/json',
        },
      }
    );

    console.log(`✅ Status update message sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error?.response?.data || error.message);
  }
}

module.exports = {
    sendWhatsAppMessage
};
