let pendingSavePrompt = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === "SAVE_TOKEN") {
    chrome.storage.local.set({ token: message.token });
  }

  if (message.type === "CLEAR_TOKEN") {
    chrome.storage.local.remove("token");
  }

  if (message.type === "FETCH_CREDENTIALS") {
    chrome.storage.local.get("token", async ({ token }) => {
      if (!token) return sendResponse({ error: "NOT_AUTHENTICATED" });

      const res = await fetch(
        `http://13.232.213.231:8000/password/by-domain?domain=${message.domain}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      sendResponse({ credentials: await res.json() });
    });

    return true;
  }


  if (message.type === "DECRYPT_AND_FILL") {
    chrome.storage.local.get("token", async ({ token }) => {
      if (!token) return sendResponse({ error: "NOT_AUTHENTICATED" });

      const res = await fetch(
        "http://13.232.213.231:8000/password/decrypt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ credentialId: message.credentialId }),
        }
      );

      sendResponse(await res.json());
    });

    return true;
  }


  if (message.type === "LOGIN_SUBMITTED") {
    chrome.storage.local.get("token", async ({ token }) => {
      if (!token) return;

      const { site, username, password } = message.payload;


      const res = await fetch(
        `http://13.232.213.231:8000/password/by-domain?domain=${site}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const saved = await res.json();

      if (!saved.length) {
        pendingSavePrompt = { site, username, password, mode: "SAVE" };
        chrome.action.openPopup();
        return;
      }

      const savedCred = saved[0];

      const decryptRes = await fetch(
        "http://13.232.213.231:8000/password/decrypt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ credentialId: savedCred._id }),
        }
      );

      const { password: savedPassword } = await decryptRes.json();


      if (
        savedCred.username === username &&
        savedPassword === password
      ) {
        console.log(" PassOP: Credentials unchanged, no popup");
        return;
      }


      pendingSavePrompt = {
        site,
        username,
        password,
        mode: "UPDATE",
        existingId: savedCred._id,
      };

      chrome.action.openPopup();
    });
  }


  if (message.type === "GET_PENDING_SAVE") {
    sendResponse(pendingSavePrompt);
  }

  if (message.type === "CLEAR_PENDING_SAVE") {
    pendingSavePrompt = null;
  }
});











