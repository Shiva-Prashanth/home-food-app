const express = require('express');
const { db }  = require('../firebase');
const { handleChatMessage, setLiveMenu } = require('../chatbotLogic');
const { sendWhatsAppMessage } = require('../services/whatsappService');

const router = express.Router();

// ─── WhatsApp send helper ────────────────────────────────────────────────
// IMPORTANT: Restart server after changing .env
async function sendReply(to, messageText) {
  return sendWhatsAppMessage(to, messageText);
}

// ─── Fetch live menu from Firebase (only available items) ────────────────
async function fetchLiveMenu() {
  try {
    const snapshot = await db
      .collection('menu')
      .where('isAvailable', '==', true)
      .get();

    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📋 Live menu fetched: ${items.length} available item(s)`);
    return items;
  } catch (err) {
    console.error("⚠️  Failed to fetch live menu from Firebase:", err.message);
    return []; // empty → chatbot falls back to STATIC_MENU
  }
}

// ─── GET /webhook — verification ─────────────────────────────────────────
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('--- Webhook Verification Request ---');
  console.log('Token from Meta    :', token);
  console.log('Token expected     :', process.env.VERIFY_TOKEN);

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      console.log('✅ WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    }
    console.log('❌ Webhook verification failed: token mismatch');
    return res.sendStatus(403);
  }

  console.log('❌ Missing mode or token');
  res.status(400).send('Missing mode or token');
});

// ─── POST /webhook — incoming messages ───────────────────────────────────
router.post('/', async (req, res) => {
  // Acknowledge immediately so Meta doesn't retry
  res.sendStatus(200);

  try {
    const body    = req.body;
    const entry   = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    // Ignore non-text messages (images, audio, etc.)
    if (!message || message.type !== 'text') return;

    const from        = message.from;           // sender's phone number
    const messageText = message.text.body;

    console.log(`\n============================`);
    console.log(`💬 New WhatsApp Message`);
    console.log(`From : ${from}`);
    console.log(`Text : ${messageText}`);
    console.log(`============================\n`);

    // 1️⃣  Fetch live menu from Firebase and inject into chatbot
    const liveMenuItems = await fetchLiveMenu();
    setLiveMenu(liveMenuItems); // chatbot will use these items for this request

    // 2️⃣  Handle message through chatbot logic
    try {
      await handleChatMessage(from, messageText, sendReply);
    } catch (chatErr) {
      console.error("❌ Chatbot error:", chatErr.message);
      await sendReply(
        from,
        "⚠️ Something went wrong on our end. Please send *Hi* to try again!"
      );
    }

  } catch (error) {
    console.error("❌ Webhook handler error:", error.message);
  }
});

module.exports = router;
