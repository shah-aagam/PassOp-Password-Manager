// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   // Save JWT
//   if (message.type === "SAVE_TOKEN") {
//     chrome.storage.local.set({ token: message.token }, () => {
//       console.log("🔐 PassOP BG: Token saved");
//     });
//   }

//   // Clear JWT
//   if (message.type === "CLEAR_TOKEN") {
//     chrome.storage.local.remove("token", () => {
//       console.log("🔓 PassOP BG: Token cleared");
//     });
//   }

//   // Fetch credentials for domain
//   if (message.type === "FETCH_CREDENTIALS") {
//     chrome.storage.local.get("token", async ({ token }) => {
//       if (!token) {
//         sendResponse({ error: "NOT_AUTHENTICATED" });
//         return;
//       }

//       try {
//         const res = await fetch(
//           `https://passop-password-manager-8rvm.onrender.com/password/by-domain?domain=${message.domain}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           },
//         );

//         const data = await res.json();
//         sendResponse({ credentials: data });
//       } catch (err) {
//         sendResponse({ error: "FETCH_FAILED" });
//       }
//     });

//     return true; // 🔴 REQUIRED for async sendResponse
//   }

//   if (message.type === "DECRYPT_AND_FILL") {
//     chrome.storage.local.get("token", async ({ token }) => {
//       if (!token) {
//         sendResponse({ error: "NOT_AUTHENTICATED" });
//         return;
//       }

//       try {
//         const res = await fetch(
//           "https://passop-password-manager-8rvm.onrender.com/password/decrypt",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify({
//               credentialId: message.credentialId,
//             }),
//           },
//         );

//         const data = await res.json();
//         sendResponse(data);
//       } catch {
//         sendResponse({ error: "DECRYPT_FAILED" });
//       }
//     });

//     return true;
//   }
// });

// // Website loads login page
// // ↓
// // content.js detects fields
// // ↓
// // content.js → background (domain)
// // ↓
// // background → backend (JWT)
// // ↓
// // backend → credentials
// // ↓
// // background → content.js
// // ↓
// // console logs result



let pendingSavePrompt = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // ---------------- AUTH ----------------
  if (message.type === "SAVE_TOKEN") {
    chrome.storage.local.set({ token: message.token });
  }

  if (message.type === "CLEAR_TOKEN") {
    chrome.storage.local.remove("token");
  }

  // ---------------- FETCH CREDENTIALS ----------------
  if (message.type === "FETCH_CREDENTIALS") {
    chrome.storage.local.get("token", async ({ token }) => {
      if (!token) return sendResponse({ error: "NOT_AUTHENTICATED" });

      const res = await fetch(
        `https://passop-password-manager-8rvm.onrender.com/password/by-domain?domain=${message.domain}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      sendResponse({ credentials: await res.json() });
    });

    return true;
  }

  // ---------------- DECRYPT ----------------
  if (message.type === "DECRYPT_AND_FILL") {
    chrome.storage.local.get("token", async ({ token }) => {
      if (!token) return sendResponse({ error: "NOT_AUTHENTICATED" });

      const res = await fetch(
        "https://passop-password-manager-8rvm.onrender.com/password/decrypt",
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

  // ---------------- LOGIN SUBMITTED (SMART) ----------------
  if (message.type === "LOGIN_SUBMITTED") {
    chrome.storage.local.get("token", async ({ token }) => {
      if (!token) return;

      const { site, username, password } = message.payload;

      // Fetch saved credential
      const res = await fetch(
        `https://passop-password-manager-8rvm.onrender.com/password/by-domain?domain=${site}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const saved = await res.json();

      // 🚫 Nothing saved → SAVE popup
      if (!saved.length) {
        pendingSavePrompt = { site, username, password, mode: "SAVE" };
        chrome.action.openPopup();
        return;
      }

      const savedCred = saved[0];

      // Decrypt saved password
      const decryptRes = await fetch(
        "https://passop-password-manager-8rvm.onrender.com/password/decrypt",
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

      // ✅ EXACT SAME → DO NOTHING
      if (
        savedCred.username === username &&
        savedPassword === password
      ) {
        console.log("✅ PassOP: Credentials unchanged, no popup");
        return;
      }

      // 🔄 CHANGED → UPDATE popup
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

  // ---------------- POPUP COMM ----------------
  if (message.type === "GET_PENDING_SAVE") {
    sendResponse(pendingSavePrompt);
  }

  if (message.type === "CLEAR_PENDING_SAVE") {
    pendingSavePrompt = null;
  }
});
