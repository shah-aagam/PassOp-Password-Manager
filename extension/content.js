/*************************************************
 * PassOP Content Script (CORRECT & STABLE)
 * Responsibilities:
 * - Sync JWT from PassOP web app
 * - Detect login vs signup via backend
 * - Autofill saved credentials
 * - Suggest strong passwords for signup
 * - Detect real credential usage (SPA-safe)
 *************************************************/

console.log("🔐 PassOP content script loaded");

/* ---------------- JWT SYNC ---------------- */
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data?.type === "PASSOP_JWT") {
    chrome.runtime.sendMessage({ type: "SAVE_TOKEN", token: event.data.token });
  }

  if (event.data?.type === "PASSOP_LOGOUT") {
    logoutInProgress = true;
    saveFlowHandledByExtension = true;
    chrome.runtime.sendMessage({ type: "CLEAR_TOKEN" });
  }
});

/* ---------------- CONFIG ---------------- */
const USERNAME_KEYWORDS = [
  "email",
  "username",
  "user",
  "login",
  "identifier",
  "account",
];

let usernameField = null;
let passwordField = null;

let credentialsRequested = false;
let savedCredential = null;

let isSignupFlow = false;
let generatedPassword = null;

let autofillUI = null;
let generatorPopup = null;

let loginSignalSent = false;

let lastUrl = location.href;

let saveFlowHandledByExtension = false;
let logoutInProgress = false;

let initialAutofillShown = false;

let autofillDismissedByUser = false;

/* ---------------- UTIL ---------------- */

function attachOutsideClickDismiss(popupRef, allowedElements = []) {
  const onClick = (e) => {
    const clickedInsideAllowed = allowedElements.some(
      (el) => el && el.contains(e.target),
    );

    const clickedInsidePopup =
      popupRef && (popupRef === e.target || popupRef.contains(e.target));

    if (!clickedInsideAllowed && !clickedInsidePopup) {
      console.log("🖱️ PassOP: Outside click → hiding popup (temporary)");
      popupRef.remove();
      autofillUI = null;

      // ⚠️ IMPORTANT: do NOT mark as user dismissed
      document.removeEventListener("mousedown", onClick);
    }
  };

  setTimeout(() => {
    document.addEventListener("mousedown", onClick);
  }, 0);
}

function destroyAutofillPopup() {
  if (autofillUI) {
    autofillUI.remove();
    autofillUI = null;
  }
}

function removePopup(popupRefName) {
  if (popupRefName && popupRefName.remove) {
    popupRefName.remove();
  }
}

function attachAutofillFocusListeners() {
  if (!savedCredential) return;
  if (saveFlowHandledByExtension) return;

  const maybeShow = () => {
    if (autofillUI) return;

    // ✅ ONLY show if field is empty
    if (usernameField?.value === "" && passwordField?.value === "") {
      showAutofillUI();
    }
  };

  // focus (keyboard / tab)
  usernameField?.addEventListener("focus", maybeShow);
  passwordField?.addEventListener("focus", maybeShow);

  //  click (mouse re-click on already focused field)
  usernameField?.addEventListener("click", maybeShow);
  passwordField?.addEventListener("click", maybeShow);
}

function isValidInput(input) {
  return (
    input &&
    input.tagName === "INPUT" &&
    input.type !== "hidden" &&
    !input.disabled &&
    !input.readOnly
  );
}

function createShadowPopup(html) {
  const host = document.createElement("div");
  host.style.position = "absolute";
  host.style.zIndex = "2147483647";

  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      :host {
        all: initial;
      }

      * {
        box-sizing: border-box;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }

      .card {
        width: 300px;
        background: #0f0f1a;
        color: white;
        padding: 16px;
        border-radius: 16px;
        box-shadow:
          0 20px 40px rgba(0,0,0,.55),
          0 0 0 1px rgba(124,58,237,.25);
        animation: pop 0.15s ease-out;
      }

      @keyframes pop {
        from {
          transform: scale(.96);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      .brand {
        font-weight: 700;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .brand span {
        color: #a78bfa;
      }

      .subtitle {
        font-size: 13px;
        color: #c7c7ff;
        margin-bottom: 12px;
      }

      .box {
        background: #1a1a2e;
        padding: 10px;
        border-radius: 12px;
        margin-bottom: 14px;
        font-size: 13px;
      }

      .label {
        font-size: 11px;
        color: #9ca3af;
        margin-bottom: 2px;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      button {
        all: unset;
        cursor: pointer;
        padding: 8px 14px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 500;
      }

      .ghost {
        color: #9ca3af;
      }

      .primary {
        background: #7c3aed;
        color: white;
      }

      .primary:hover {
        background: #6d28d9;
      }

      .ghost:hover {
        color: white;
      }
    </style>

    ${html}
  `;

  document.body.appendChild(host);
  return host;
}

function generateStrongPassword(length = 16) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join("");
}

/* ---------------- FIELD DETECTION ---------------- */
function detectFields() {
  const inputs = document.querySelectorAll("input");

  for (const input of inputs) {
    if (!isValidInput(input)) continue;

    const type = input.type.toLowerCase();
    const name = (input.name || "").toLowerCase();
    const placeholder = (input.placeholder || "").toLowerCase();
    const autocomplete = (input.autocomplete || "").toLowerCase();

    if (!usernameField) {
      const isUsername =
        type === "email" ||
        autocomplete.includes("username") ||
        autocomplete.includes("email") ||
        USERNAME_KEYWORDS.some((k) => name.includes(k)) ||
        USERNAME_KEYWORDS.some((k) => placeholder.includes(k));

      if (isUsername) {
        usernameField = input;
        console.log("👤 PassOP: Username field detected");
      }
    }

    if (!passwordField && type === "password") {
      passwordField = input;
      console.log("🔑 PassOP: Password field detected");
      attachPasswordFocusListener();
      attachAutofillFocusListeners();
    }
  }
}

/* ---------------- BACKEND DECISION ---------------- */
function decideFlow() {
  if (credentialsRequested || !passwordField) return;
  credentialsRequested = true;

  chrome.runtime.sendMessage(
    {
      type: "FETCH_CREDENTIALS",
      domain: location.hostname.replace(/^www\./, ""),
    },
    (res) => {
      if (!res || res.error) return;

      if (res.credentials?.length) {
        savedCredential = res.credentials[0];
        console.log("🔐 PassOP: Saved credentials found", res.credentials);

        attachAutofillFocusListeners();

        // 🌟 Initial gentle suggestion (Google-style)
        if (
          !initialAutofillShown &&
          usernameField &&
          passwordField &&
          usernameField.value === "" &&
          passwordField.value === ""
        ) {
          initialAutofillShown = true;
          showAutofillUI();
        }
      } else {
        isSignupFlow = true;
        console.log("🆕 PassOP: Signup flow detected");
      }
    },
  );
}

// Hook LocalStorage for token writes
(function hookLocalStorage() {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    if (
      key.toLowerCase().includes("token") ||
      key.toLowerCase().includes("auth")
    ) {
      console.log("🔐 PassOP: Auth token stored in LocalStorage");
      detectCredentialUsage("TOKEN_STORAGE");
    }
    return originalSetItem.apply(this, arguments);
  };
})();

// Hook Cookies for auth cookies
(function hookCookies() {
  const originalCookie = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "cookie",
  );
  Object.defineProperty(document, "cookie", {
    set(value) {
      if (
        value.toLowerCase().includes("token") ||
        value.toLowerCase().includes("auth")
      ) {
        console.log("🍪 PassOP: Auth cookie set");
        detectCredentialUsage("COOKIE");
      }
      originalCookie.set.call(this, value);
    },
    get: originalCookie.get,
  });
})();

// SPA Route Change Detection
function detectPageChange() {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log("🔄 PassOP: Page changed");
    detectCredentialUsage("PAGE_CHANGE");

    // Reset detection for the new page
    usernameField = null;
    passwordField = null;
    credentialsRequested = false;
    // loginSignalSent = false;
    detectFields();
  }
}

/* ---------------- AUTOFILL UI ---------------- */
function showAutofillUI() {
  if (saveFlowHandledByExtension) return;
  if (!usernameField || autofillUI) return;

  autofillUI = createShadowPopup(`
    <div class="card">
      <div class="brand">
        <span>&lt;</span>Pass<span>OP/&gt;</span>
      </div>

      <div class="subtitle">
        Use saved credentials?
      </div>

      <div class="box">
        <div class="label">Username</div>
        <div>${savedCredential.username}</div>

        <div class="label" style="margin-top:6px">Password</div>
        <div>••••••••••</div>
      </div>

      <div class="actions">
        <button class="ghost" id="no">Dismiss</button>
        <button class="primary" id="yes">Use</button>
      </div>
    </div>
  `);

  positionUI(autofillUI, usernameField);

  attachOutsideClickDismiss(autofillUI, [usernameField, passwordField]);

  const shadow = autofillUI.shadowRoot;

  /* ---------- ACTIONS ---------- */
  shadow.getElementById("yes").onclick = () => {
    saveFlowHandledByExtension = true;

    usernameField.value = savedCredential.username;
    usernameField.dispatchEvent(new Event("input", { bubbles: true }));

    chrome.runtime.sendMessage(
      { type: "DECRYPT_AND_FILL", credentialId: savedCredential._id },
      (r) => {
        if (r?.password) {
          passwordField.value = r.password;
          passwordField.dispatchEvent(new Event("input", { bubbles: true }));
        }
      },
    );

    destroyAutofillPopup();
  };

  shadow.getElementById("no").onclick = () => {
    console.log("❌ PassOP: User explicitly dismissed autofill");
    autofillDismissedByUser = true;
    destroyAutofillPopup();
  };

  /* ---------- DISMISS ON TYPE ---------- */
  const dismissOnType = () => {
    if (
      autofillUI &&
      (usernameField.value.length > 0 || passwordField?.value.length > 0)
    ) {
      console.log("⌨️ PassOP: User typed, hiding autofill popup");
      destroyAutofillPopup();
    }
  };

  usernameField.addEventListener("input", dismissOnType);
  passwordField?.addEventListener("input", dismissOnType);
}

/* ---------------- SIGNUP PASSWORD GENERATOR ---------------- */
function attachPasswordFocusListener() {
  if (passwordField.__passopBound) return;
  passwordField.__passopBound = true;

  // Show generator on focus (only once)
  passwordField.addEventListener("focus", () => {
    if (!isSignupFlow || generatedPassword) return;
    generatedPassword = generateStrongPassword();
    showGeneratorPopup();
  });

  // 🚨 USER STARTED TYPING → REMOVE POPUP
  const dismissOnInput = () => {
    if (generatorPopup) {
      console.log("⌨️ PassOP: User typed, dismissing password generator");
      generatorPopup.remove();
      generatorPopup = null;
    }
  };

  passwordField.addEventListener("input", dismissOnInput);
  passwordField.addEventListener("keydown", dismissOnInput);
  passwordField.addEventListener("paste", dismissOnInput);
}

function showGeneratorPopup() {
  if (saveFlowHandledByExtension) return;
  generatorPopup = createShadowPopup(`
    <div class="card">
      <div class="brand">
        <span>&lt;</span>Pass<span>OP/&gt;</span>
      </div>

      <div class="subtitle">
        Use a strong generated password?
      </div>

      <div class="box" style="word-break:break-all">
        ${generatedPassword}
      </div>

      <div class="actions">
        <button class="ghost" id="no">Dismiss</button>
        <button class="primary" id="yes">Use</button>
      </div>
    </div>
  `);

  positionUI(generatorPopup, passwordField);

  attachOutsideClickDismiss(generatorPopup, [passwordField]);

  const shadow = generatorPopup.shadowRoot;

  shadow.getElementById("yes").onclick = () => {
    passwordField.value = generatedPassword;
    passwordField.dispatchEvent(new Event("input", { bubbles: true }));
    generatorPopup.remove();
  };

  shadow.getElementById("no").onclick = () => generatorPopup.remove();
}

/* ---------------- LOGIN DETECTION (FIX) ---------------- */
function detectCredentialUsage() {
  if (
    loginSignalSent ||
    saveFlowHandledByExtension ||
    logoutInProgress ||
    !usernameField ||
    !passwordField ||
    !usernameField.value ||
    !passwordField.value
  )
    return;

  loginSignalSent = true;

  chrome.runtime.sendMessage({
    type: "LOGIN_SUBMITTED",
    payload: {
      site: location.hostname.replace(/^www\./, ""),
      username: usernameField.value,
      password: passwordField.value,
    },
  });

  console.log("📨 PassOP: Credentials used (SPA-safe)");
}

window.addEventListener("beforeunload", detectCredentialUsage);
passwordField?.addEventListener("blur", detectCredentialUsage);

/* ---------------- UI POSITION ---------------- */
function positionUI(ui, field) {
  const rect = field.getBoundingClientRect();
  const popupWidth = 320;
  const gap = 12;

  let left = scrollX + rect.left - popupWidth - gap;

  // If not enough space on the left → place on right
  if (left < 8) {
    left = scrollX + rect.right + gap;
  }

  ui.style.top = `${scrollY + rect.top}px`;
  ui.style.left = `${left}px`;
}

/* ---------------- INIT ---------------- */
detectFields();
decideFlow();

new MutationObserver(() => {
  detectPageChange();
  detectFields();
  decideFlow();
}).observe(document.documentElement, { childList: true, subtree: true });

/* ---------------- RESET ON FULL PAGE LOAD ---------------- */
window.addEventListener("load", () => {
  loginSignalSent = false;
  saveFlowHandledByExtension = false;
  logoutInProgress = false;
  autofillDismissedByUser = false;
});

// Final backup: Detect on form departure
window.addEventListener("beforeunload", () =>
  detectCredentialUsage("PAGE_UNLOAD"),
);
