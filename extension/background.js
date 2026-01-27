chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Save JWT
  if (message.type === "SAVE_TOKEN") {
    chrome.storage.local.set({ token: message.token }, () => {
      console.log("🔐 PassOP BG: Token saved");
    });
  }

  // Clear JWT
  if (message.type === "CLEAR_TOKEN") {
    chrome.storage.local.remove("token", () => {
      console.log("🔓 PassOP BG: Token cleared");
    });
  }

  // Fetch credentials for domain
  if (message.type === "FETCH_CREDENTIALS") {
    chrome.storage.local.get("token", async ({ token }) => {
      if (!token) {
        sendResponse({ error: "NOT_AUTHENTICATED" });
        return;
      }

      try {
        const res = await fetch(
          `https://passop-password-manager-8rvm.onrender.com/password/by-domain?domain=${message.domain}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();
        sendResponse({ credentials: data });
      } catch (err) {
        sendResponse({ error: "FETCH_FAILED" });
      }
    });

    return true; // 🔴 REQUIRED for async sendResponse
  }

  if (message.type === "DECRYPT_AND_FILL") {
    chrome.storage.local.get("token", async ({ token }) => {
      if (!token) {
        sendResponse({ error: "NOT_AUTHENTICATED" });
        return;
      }

      try {
        const res = await fetch(
          "https://passop-password-manager-8rvm.onrender.com/password/decrypt",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              credentialId: message.credentialId,
            }),
          },
        );

        const data = await res.json();
        sendResponse(data);
      } catch {
        sendResponse({ error: "DECRYPT_FAILED" });
      }
    });

    return true;
  }
});

// Website loads login page
// ↓
// content.js detects fields
// ↓
// content.js → background (domain)
// ↓
// background → backend (JWT)
// ↓
// backend → credentials
// ↓
// background → content.js
// ↓
// console logs result
