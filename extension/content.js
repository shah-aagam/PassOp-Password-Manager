/*************************************************
 * PassOP Content Script
 * Responsibility:
 * - Detect login / signup forms
 * - Identify username & password fields
 * - Notify background when form is ready
 *************************************************/

console.log("🔐 PassOP content script loaded");

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "PASSOP_JWT") {
    chrome.runtime.sendMessage({
      type: "SAVE_TOKEN",
      token: event.data.token,
    });
  }

  if (event.data?.type === "PASSOP_LOGOUT") {
    chrome.runtime.sendMessage({ type: "CLEAR_TOKEN" });
  }
});

const USERNAME_KEYWORDS = [
  "email",
  "username",
  "user",
  "login",
  "id",
  "identifier",
  "account",
];

let usernameField = null;
let passwordField = null;
let formReported = false;

function isValidInput(input) {
  if (!input) return false;
  if (input.type === "hidden") return false;
  if (input.disabled || input.readOnly) return false;
  return true;
}

function detectLoginFields() {
  const inputs = Array.from(document.querySelectorAll("input"));

  for (const input of inputs) {
    if (!isValidInput(input)) continue;

    const type = input.type?.toLowerCase();
    const name = input.name?.toLowerCase() || "";
    const placeholder = input.placeholder?.toLowerCase() || "";
    const autocomplete = input.autocomplete?.toLowerCase() || "";

    if (!usernameField) {
      const isUsername =
        type === "email" ||
        autocomplete.includes("username") ||
        autocomplete.includes("email") ||
        USERNAME_KEYWORDS.some((k) => name.includes(k)) ||
        USERNAME_KEYWORDS.some((k) => placeholder.includes(k));

      if (isUsername) {
        usernameField = input;
        console.log("👤 PassOP: Username field detected", input);
      }
    }

    if (!passwordField && type === "password") {
      passwordField = input;
      console.log("🔑 PassOP: Password field detected", input);
    }
  }

  if (usernameField && passwordField && !formReported) {
    formReported = true;

    console.log("✅ PassOP: Login form READY");

    chrome.runtime.sendMessage(
      {
        type: "FETCH_CREDENTIALS",
        domain: window.location.hostname.replace(/^www\./, ""),
      },
      (response) => {
        if (response?.error) {
          console.log("❌ PassOP:", response.error);
          return;
        }

        if (response?.credentials?.length > 0) {
          const cred = response.credentials[0];

          const shouldFill = confirm(
            `PassOP: Autofill credentials for ${cred.site}?`,
          );

          if (shouldFill) {
            chrome.runtime.sendMessage(
              {
                type: "DECRYPT_AND_FILL",
                credentialId: cred._id,
              },
              (fillResponse) => {
                if (fillResponse?.error) {
                  console.log("❌ PassOP:", fillResponse.error);
                  return;
                }

                if (fillResponse?.username && fillResponse?.password) {
                  usernameField.value = fillResponse.username;
                  passwordField.value = fillResponse.password;

                  // trigger input events (important for React sites)
                  usernameField.dispatchEvent(
                    new Event("input", { bubbles: true }),
                  );
                  passwordField.dispatchEvent(
                    new Event("input", { bubbles: true }),
                  );

                  console.log("✅ PassOP: Autofill complete");
                }
              },
            );
          }
        } else {
          console.log(window.location.hostname.replace(/^www\./, ""));
          console.log("🆕 PassOP: No saved credentials for this site");
        }
      },
    );
  }
}

// initial scan (for simple pages)
detectLoginFields();

// observe SPA / dynamic DOM changes
const observer = new MutationObserver(() => {
  detectLoginFields();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
