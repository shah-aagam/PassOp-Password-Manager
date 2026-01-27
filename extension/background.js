chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SAVE_TOKEN") {
    chrome.storage.local.set({ token: message.token });
    console.log("Extension received token");
  }
  
  if (message.type === "CLEAR_TOKEN") {
    chrome.storage.local.remove("token");
    console.log("token removed");
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
          `https://YOUR_BACKEND_URL/password/by-domain?domain=${message.domain}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        sendResponse({ credentials: data });
      } catch (err) {
        sendResponse({ error: "FETCH_FAILED" });
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
