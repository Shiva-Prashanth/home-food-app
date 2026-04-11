const { db } = require("./firebase"); // uses existing firebase.js (Admin SDK)

// ─── In-memory state store ─────────────────────────────────────────────────
const userStates = {};

// ─── Static fallback menu (used if Firebase fetch fails) ──────────────────
let LIVE_MENU = null; // injected at runtime from webhook via setLiveMenu()

const STATIC_MENU = {
  "1": { name: "Veg Meals",       price: 120 },
  "2": { name: "Chicken Biryani", price: 180 },
  "3": { name: "Paneer Curry",    price: 150 },
};

/**
 * Called by webhook.js after fetching menu from Firebase.
 * Maps Firebase docs to numbered keys { "1": { name, price }, ... }
 */
function setLiveMenu(firebaseMenuItems) {
  if (!firebaseMenuItems || firebaseMenuItems.length === 0) {
    LIVE_MENU = null;
    return;
  }
  const mapped = {};
  firebaseMenuItems.forEach((item, index) => {
    mapped[String(index + 1)] = {
      name    : item.name,
      price   : item.price,
      itemId  : item.id,
      category: item.category || "",
    };
  });
  LIVE_MENU = mapped;
}

/** Returns the active menu (live Firebase menu or static fallback) */
function getMenu() {
  return LIVE_MENU || STATIC_MENU;
}

const ALLOWED_AREAS = ["hyderabad", "secunderabad"];

// ─── Helpers ───────────────────────────────────────────────────────────────
function generateOrderId() {
  return "ORD" + Date.now().toString().slice(-6);
}

function formatMenu() {
  const menu = getMenu();
  const lines = Object.entries(menu)
    .map(([key, item]) => {
      const emoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"][parseInt(key) - 1] || `${key}.`;
      return `${emoji}  ${item.name.padEnd(20, " ")} — ₹${item.price}`;
    })
    .join("\n");

  const keys = Object.keys(menu);
  const rangeHint = keys.length === 1 ? "1" : `1–${keys.length}`;

  return (
    "📋 *Our Menu:*\n\n" +
    lines +
    `\n\n👉 Reply with item number (${rangeHint})`
  );
}

function isValidArea(location) {
  const lower = location.toLowerCase();
  return ALLOWED_AREAS.some((area) => lower.includes(area));
}

// ──────────────────────────────────────────────────────────────────────────
// CART EDIT HELPERS
// ──────────────────────────────────────────────────────────────────────────

function formatCartForEditing(cart) {
  if (cart.length === 0) {
    return (
      "🛒 *Your cart is empty.*\n\n" +
      "Commands:\n" +
      "• *next* → enter location _(checkout with empty cart is blocked)_"
    );
  }

  let total = 0;
  const lines = cart.map((entry, i) => {
    const subtotal = entry.price * entry.quantity;
    total += subtotal;
    return `  ${i + 1}. ${entry.name} x${entry.quantity} — ₹${subtotal}`;
  });

  return (
    `🛒 *Your Cart:*\n\n` +
    lines.join("\n") +
    `\n\n  💰 *Total: ₹${total}*\n\n` +
    `*Commands:*\n` +
    `  • *+N*        → increase item N  _(e.g. +1)_\n` +
    `  • *-N*        → decrease item N  _(e.g. -1)_\n` +
    `  • *remove N*  → remove item N    _(e.g. remove 2)_\n` +
    `  • *clear*     → empty the cart\n` +
    `  • *next*      → confirm cart & enter location`
  );
}

function applyCartCommand(cmd, cart) {
  // ── +N (increase) ────────────────────────────────────────────────────────
  const increaseMatch = cmd.match(/^\+(\d+)$/);
  if (increaseMatch) {
    const idx = parseInt(increaseMatch[1], 10) - 1;
    if (idx < 0 || idx >= cart.length) {
      return { ok: false, reply: `⚠️ Item ${idx + 1} doesn't exist. Use the number shown in your cart.` };
    }
    cart[idx].quantity += 1;
    return {
      ok: true,
      reply: `✅ *${cart[idx].name}* quantity increased to ${cart[idx].quantity}.\n\n` +
             formatCartForEditing(cart),
    };
  }

  // ── -N (decrease) ────────────────────────────────────────────────────────
  const decreaseMatch = cmd.match(/^-(\d+)$/);
  if (decreaseMatch) {
    const idx = parseInt(decreaseMatch[1], 10) - 1;
    if (idx < 0 || idx >= cart.length) {
      return { ok: false, reply: `⚠️ Item ${idx + 1} doesn't exist. Use the number shown in your cart.` };
    }
    cart[idx].quantity -= 1;
    if (cart[idx].quantity <= 0) {
      const removed = cart.splice(idx, 1)[0];
      return {
        ok: true,
        reply: `🗑️ *${removed.name}* removed (quantity reached 0).\n\n` +
               formatCartForEditing(cart),
      };
    }
    return {
      ok: true,
      reply: `✅ *${cart[idx].name}* quantity decreased to ${cart[idx].quantity}.\n\n` +
             formatCartForEditing(cart),
    };
  }

  // ── remove N ─────────────────────────────────────────────────────────────
  const removeMatch = cmd.match(/^remove\s+(\d+)$/);
  if (removeMatch) {
    const idx = parseInt(removeMatch[1], 10) - 1;
    if (idx < 0 || idx >= cart.length) {
      return { ok: false, reply: `⚠️ Item ${idx + 1} doesn't exist. Use the number shown in your cart.` };
    }
    const removed = cart.splice(idx, 1)[0];
    return {
      ok: true,
      reply: `🗑️ *${removed.name}* removed from your cart.\n\n` + formatCartForEditing(cart),
    };
  }

  // ── clear ─────────────────────────────────────────────────────────────────
  if (cmd === "clear") {
    cart.splice(0, cart.length);
    return {
      ok: true,
      reply: `🗑️ Cart cleared!\n\n` + formatCartForEditing(cart),
    };
  }

  // ── unknown ───────────────────────────────────────────────────────────────
  return {
    ok: false,
    reply: "⚠️ Invalid option. Use *+1*, *-1*, *remove 1*, *clear*, or *next*.",
  };
}

// ──────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ──────────────────────────────────────────────────────────────────────────
async function handleChatMessage(from, messageText, sendReply) {
  const text = messageText.trim().toLowerCase();
  const raw  = messageText.trim();

  if (!userStates[from]) {
    userStates[from] = { step: "START", cart: [] };
  }

  const state = userStates[from];

  // ── STEP 1 · Greeting ─────────────────────────────────────────────────────
  if (state.step === "START") {
    let statusText = "";
    try {
      const { getStatusInternal } = require('./controllers/kitchenController');
      const kitchenData = await getStatusInternal();
      let statusStr = "";
      if (kitchenData.status === "high") statusStr = "🔴 High Busy";
      else if (kitchenData.status === "medium") statusStr = "🟡 Medium Busy";
      else statusStr = "🟢 Low Busy";
      
      const estimatedTime = kitchenData.estimatedTime || "20-30 mins";
      state.estimatedTime = estimatedTime;
      
      statusText = `🍽 Kitchen Status: ${statusStr}\n⏱ Estimated delivery: ${estimatedTime}\n\nYou can start ordering now.`;
    } catch (err) {
      console.error("Chatbot failed to fetch kitchen status:", err);
      statusText = "Kitchen status currently unavailable. Please continue ordering.";
    }

    await sendReply(
      from,
      `👋 *Welcome to Home Food Service!* 🍱\n\n` +
      `We bring fresh, homemade food right to your door.\n\n` +
      `${statusText}\n\n` +
      `Choose your language:\n` +
      `1️⃣  English\n` +
      `2️⃣  Telugu`
    );
    state.step = "LANGUAGE_SELECTED";
    return;
  }

  // ── STEP 2 · Language ─────────────────────────────────────────────────────
  if (state.step === "LANGUAGE_SELECTED") {
    if (text === "1" || text === "english") {
      state.language = "English";
    } else if (text === "2" || text === "telugu") {
      state.language = "Telugu";
    } else {
      await sendReply(from, "⚠️ Please reply with *1* for English or *2* for Telugu.");
      return;
    }
    await sendReply(from, formatMenu());
    state.step = "ORDERING";
    return;
  }

  // ── STEP 3 · Item selection ───────────────────────────────────────────────
  if (state.step === "ORDERING") {
    const menu = getMenu();
    const chosen = menu[text];
    if (!chosen) {
      const maxKey = Object.keys(menu).length;
      await sendReply(from, `⚠️ Invalid choice. Please reply with a number between 1 and ${maxKey}.`);
      return;
    }
    state.pendingItem = chosen;
    await sendReply(
      from,
      `🍽️ You selected *${chosen.name}*.\n\nHow many plates would you like? 🔢\n_(Reply with a number, e.g. 2)_`
    );
    state.step = "QUANTITY";
    return;
  }

  // ── STEP 4 · Quantity ─────────────────────────────────────────────────────
  if (state.step === "QUANTITY") {
    const qty = parseInt(text, 10);
    if (isNaN(qty) || qty < 1) {
      await sendReply(from, "⚠️ Please enter a valid number (e.g. *1*, *2*, *3*).");
      return;
    }

    const existing = state.cart.find((e) => e.name === state.pendingItem.name);
    if (existing) {
      existing.quantity += qty;
    } else {
      state.cart.push({
        itemId  : state.pendingItem.itemId || null,
        name    : state.pendingItem.name,
        price   : state.pendingItem.price,
        quantity: qty,
      });
    }
    state.pendingItem = null;

    const total = state.cart.reduce((sum, e) => sum + e.price * e.quantity, 0);
    await sendReply(
      from,
      `✅ Added to cart!\n\n` +
      state.cart.map((e, i) => `  ${i + 1}. ${e.name} x${e.quantity} — ₹${e.price * e.quantity}`).join("\n") +
      `\n\n  💰 *Total: ₹${total}*\n\n` +
      "Would you like to add more items?\n*yes* — add another item\n*no*  — review & edit cart"
    );
    state.step = "ADD_MORE";
    return;
  }

  // ── STEP 5 · Add more? ────────────────────────────────────────────────────
  if (state.step === "ADD_MORE") {
    if (text === "yes" || text === "y") {
      await sendReply(from, formatMenu());
      state.step = "ORDERING";
    } else if (text === "no" || text === "n") {
      await sendReply(from, formatCartForEditing(state.cart));
      state.step = "EDIT_CART";
    } else {
      await sendReply(from, "⚠️ Please reply with *yes* to add more or *no* to review cart.");
    }
    return;
  }

  // ── STEP 5b · EDIT_CART ───────────────────────────────────────────────────
  if (state.step === "EDIT_CART") {
    if (text === "next") {
      if (state.cart.length === 0) {
        await sendReply(
          from,
          "🛒 Your cart is empty! Please add at least one item before proceeding.\n\n" +
          formatCartForEditing(state.cart)
        );
        return;
      }
      await sendReply(
        from,
        "📍 Please enter your *delivery location*.\n\n" +
        "_We currently deliver in *Hyderabad* and *Secunderabad* only._"
      );
      state.step = "LOCATION_ENTERED";
      return;
    }

    const result = applyCartCommand(text, state.cart);
    await sendReply(from, result.reply);
    return;
  }

  // ── STEP 6 · Location + service-area validation ───────────────────────────
  if (state.step === "LOCATION_ENTERED") {
    if (!isValidArea(raw)) {
      await sendReply(
        from,
        "😔 Sorry, we currently deliver *only in Hyderabad and Secunderabad*.\n\n" +
        "Please enter a location within our service area."
      );
      return;
    }
    state.location = raw;

    const summary =
      `🧾 *Order Summary*\n\n` +
      state.cart.map((e, i) =>
        `  ${i + 1}. ${e.name} x${e.quantity} — ₹${e.price * e.quantity}`
      ).join("\n") +
      `\n\n  💰 *Total: ₹${state.cart.reduce((s, e) => s + e.price * e.quantity, 0)}*\n\n` +
      `📍 Deliver to: ${state.location}\n` +
      `⏱️ Estimated delivery: *${state.estimatedTime || "30–40 minutes"}*\n\n` +
      `Confirm your order? Reply *yes* or *no*`;

    await sendReply(from, summary);
    state.step = "ORDER_CONFIRMED";
    return;
  }

  // ── STEP 7 · Confirm & save ───────────────────────────────────────────────
  if (state.step === "ORDER_CONFIRMED") {
    if (text === "yes") {
      const orderId = generateOrderId();
      const total   = state.cart.reduce((sum, e) => sum + e.price * e.quantity, 0);

      await db.collection("orders").doc(orderId).set({
        phoneNumber : from,
        language    : state.language || "English",
        location    : state.location,
        items       : state.cart,       // uses "items" field (consistent with REST API)
        totalAmount : total,
        status      : "pending",
        source      : "whatsapp",
        createdAt   : new Date().toISOString(),
      });

      await sendReply(
        from,
        `🎉 *Order Confirmed!* ✅\n\n` +
        `🆔 Order ID   : *${orderId}*\n` +
        `📍 Location  : ${state.location}\n` +
        `💰 Total       : ₹${total}\n` +
        `⏱️ Estimated delivery: ${state.estimatedTime || "30–40 minutes"}\n\n` +
        `Thank you for ordering with us! 🙏\n` +
        `Send *Hi* anytime to place a new order.`
      );
      delete userStates[from];

    } else if (text === "no") {
      await sendReply(from, "❌ Order cancelled.\n\nSend *Hi* to start a fresh order anytime! 😊");
      delete userStates[from];

    } else {
      await sendReply(from, "⚠️ Please reply with *yes* to confirm or *no* to cancel.");
    }
    return;
  }

  // ── Fallback for unrecognised state (safety net) ──────────────────────────
  await sendReply(from, "👋 Send *Hi* to start a fresh order!");
  delete userStates[from];
}

module.exports = { handleChatMessage, setLiveMenu };
