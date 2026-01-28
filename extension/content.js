/*************************************************
 * PassOP Content Script (CORRECT & STABLE)
 * Responsibilities:
 * - Sync JWT from PassOP web app
 * - Detect login vs signup via backend
 * - Autofill saved credentials
 * - Suggest strong passwords for signup
 * - Detect real credential usage (SPA-safe)
 *************************************************/

console.log(" PassOP content script loaded");


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
      console.log(" PassOP: Outside click → hiding popup (temporary)");
      popupRef.remove();
      autofillUI = null;


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

    if (usernameField?.value === "" && passwordField?.value === "") {
      showAutofillUI();
    }
  };

  usernameField?.addEventListener("focus", maybeShow);
  passwordField?.addEventListener("focus", maybeShow);

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
      :host { all: initial; }
      * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }

      .subtitle {
        font-size: 12px;
        color: #c7c7ff;
        margin-bottom: 8px;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 12px;
      }

      button {
        all: unset;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        transition: background 0.2s;
      }

      .ghost { color: #9ca3af; }
      .ghost:hover { color: white; background: rgba(255,255,255,0.05); }

      .primary { background: #7c3aed; color: white; }
      .primary:hover { background: #6d28d9; }

      .bubble-root {
        position: relative;
        filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
      }

      .card {
        width: 280px;
        background: #0f0f1a; /* Your dark theme */
        color: white;
        border-radius: 12px;
        overflow: hidden; /* Clips the footer hover effect */
        border: 1px solid rgba(124,58,237,.25);
        animation: pop 0.1s ease-out;
      }

      @keyframes pop {
        from { transform: scale(.98); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      .content { padding: 16px; }

      /* Footer Section (Google Style) */
      .footer {
        background: #161625;
        padding: 10px 16px;
        border-top: 1px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 13px;
        color: #a78bfa;
        transition: background 0.2s;
      }

      .footer:hover { background: #1e1e30; }

      /* The Arrow (Caret) */
      .caret {
        position: absolute;
        width: 12px;
        height: 12px;
        background: #0f0f1a;
        transform: rotate(45deg);
        border: 1px solid rgba(124,58,237,.25);
        z-index: -1;
      }

      /* Position caret based on which side the popup is on */
      .bubble-root.left .caret {
        right: -6px;
        top: 20px;
        border-left: none; border-bottom: none;
      }

      .bubble-root.right .caret {
        left: -6px;
        top: 20px;
        border-right: none; border-top: none;
      }

      /* Your internal box styling */
      .box { background: #1a1a2e; padding: 10px; border-radius: 8px; margin: 12px 0; font-size: 13px; }
      .label { font-size: 11px; color: #9ca3af; }
      .brand { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
      .brand span { color: #7c3aed; }
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
        console.log(" PassOP: Username field detected");

        usernameField.addEventListener("input", () => {
          loginSignalSent = false;
        });
      }
    }

    if (!passwordField && type === "password") {
      passwordField = input;
      console.log(" PassOP: Password field detected");
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
        console.log(" PassOP: Saved credentials found", res.credentials);

        attachAutofillFocusListeners();

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
        console.log(" PassOP: Signup flow detected");
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
      console.log(" PassOP: Auth token stored in LocalStorage");
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
        console.log(" PassOP: Auth cookie set");
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
    console.log(" PassOP: Page changed");
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
    <div class="bubble-root">
      <div class="card">
        <div class="content">
          <div class="brand"><span>&lt;</span>Pass<span>OP/&gt;</span></div>
          <div style="font-size: 12px; color: #c7c7ff;">Use saved credentials?</div>
          
          <div class="box">
            <div class="label">Username</div>
            <div style="margin-bottom: 8px;">${savedCredential.username}</div>
            <div class="label">Password</div>
            <div>••••••••••</div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button id="no" style="color:#9ca3af; font-size:12px; cursor:pointer; background:none; border:none;">Dismiss</button>
            <button id="yes" style="background:#7c3aed; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">Use</button>
          </div>
        </div>

        <div class="footer" id="manage-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          Manage Passwords
        </div>
      </div>
      <div class="caret"></div>
    </div>
  `);

  const shadow = autofillUI.shadowRoot;

  const side = positionUI(autofillUI, usernameField);

  autofillUI.shadowRoot.querySelector(".bubble-root").classList.add(side);

  autofillUI.shadowRoot.getElementById("manage-btn").onclick = () => {
    window.open("https://pass-op-password-manager-aagam.vercel.app", "_blank");
  };

  attachOutsideClickDismiss(autofillUI, [usernameField, passwordField]);

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
    console.log(" PassOP: User explicitly dismissed autofill");
    autofillDismissedByUser = true;
    destroyAutofillPopup();
  };

  const dismissOnType = () => {
    if (
      autofillUI &&
      (usernameField.value.length > 0 || passwordField?.value.length > 0)
    ) {
      console.log(" PassOP: User typed, hiding autofill popup");
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

  passwordField.addEventListener("focus", () => {
    loginSignalSent = false; 
    if (!isSignupFlow) return;
    if (passwordField.value.length > 0) return;

    generatedPassword = generateStrongPassword();
    showGeneratorPopup();
  });

  const dismissOnInput = () => {
    if (generatorPopup) {
      console.log(" PassOP: User typed, dismissing password generator");
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
    <div class="bubble-root">
      <div class="card">
        <div class="content">
          <div class="brand"><span>&lt;</span>Pass<span>OP/&gt;</span></div>
          <div class="subtitle">Use a strong generated password?</div>

          <div class="box" style="word-break: break-all; font-family: monospace; color: #a78bfa; border: 1px dashed rgba(167, 139, 250, 0.3);">
            ${generatedPassword}
          </div>

          <div class="actions">
            <button class="ghost" id="no">Dismiss</button>
            <button class="primary" id="yes">Use Password</button>
          </div>
        </div>
      </div>
      <div class="caret"></div>
    </div>  
  `);

  const shadow = generatorPopup.shadowRoot;


  const side = positionUI(generatorPopup, passwordField);
  shadow.querySelector(".bubble-root").classList.add(side);

  attachOutsideClickDismiss(generatorPopup, [passwordField]);

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

  console.log(" PassOP: Credentials used (SPA-safe)");
}

window.addEventListener("beforeunload", detectCredentialUsage);
passwordField?.addEventListener("blur", detectCredentialUsage);


function positionUI(ui, field) {
  const rect = field.getBoundingClientRect();
  const popupWidth = 280;
  const gap = 16;
  let side = "left";

  let left = window.scrollX + rect.left - popupWidth - gap;

  if (left < 10) {
    left = window.scrollX + rect.right + gap;
    side = "right";
  }

  ui.style.top = `${window.scrollY + rect.top - 10}px`; 
  ui.style.left = `${left}px`;

  return side; 
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
