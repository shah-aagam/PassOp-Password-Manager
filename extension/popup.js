const root = document.getElementById("root");

/* ---------------- SHADOW UI ---------------- */
function renderShadow(html) {
  root.innerHTML = "";

  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
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
      }

      .brand {
        font-weight: 700;
        font-size: 15px;
        margin-bottom: 6px;
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

  root.appendChild(host);
  return shadow;
}

/* ---------------- AUTH CHECK ---------------- */
chrome.storage.local.get(["token"], (res) => {
  if (!res.token) {
    renderLoggedOut();
    return;
  }

  chrome.runtime.sendMessage({ type: "GET_PENDING_SAVE" }, (data) => {
    if (data) {
      renderSaveUI(data);
    } else {
      renderLoggedInHome();
    }
  });
});

/* ---------------- LOGGED OUT ---------------- */
function renderLoggedOut() {
  const shadow = renderShadow(`
    <div class="card">
      <div class="brand">
        <span>&lt;</span>Pass<span>OP/&gt;</span>
      </div>

      <div class="subtitle">
        You are not logged in
      </div>

      <div class="actions">
        <button class="primary" id="login">Login</button>
      </div>
    </div>
  `);

  shadow.getElementById("login").onclick = () => {
    chrome.tabs.create({
      url: "https://pass-op-password-manager-aagam.vercel.app/login",
    });
  };
}

/* ---------------- LOGGED IN HOME ---------------- */
function renderLoggedInHome() {
  const shadow = renderShadow(`
    <div class="card">
      <div class="brand">
        <span>&lt;</span>Pass<span>OP/&gt;</span>
      </div>

      <div class="subtitle">
        You’re logged in
      </div>

      <div class="actions">
        <button class="primary" id="logout">Logout</button>
      </div>
    </div>
  `);

  shadow.getElementById("logout").onclick = () => {
    chrome.storage.local.remove("token", () => {
      renderLoggedOut();
    });
  };
}

/* ---------------- SAVE / UPDATE ---------------- */
function renderSaveUI({ site, username, password, mode, existingId }) {
  const shadow = renderShadow(`
    <div class="card">
      <div class="brand">
        <span>&lt;</span>Pass<span>OP/&gt;</span>
      </div>

      <div class="subtitle">
        ${mode === "UPDATE" ? "Update saved password?" : "Save password?"}
      </div>

      <div class="box">
        <div class="label">${site}</div>
        <div>${username}</div>
      </div>

      <div class="actions">
        <button class="ghost" id="dismiss">Dismiss</button>
        <button class="primary" id="save">
          ${mode === "UPDATE" ? "Update" : "Save"}
        </button>
      </div>
    </div>
  `);

  shadow.getElementById("save").onclick = async () => {
    const { token } = await chrome.storage.local.get("token");

    const url =
      mode === "UPDATE"
        ? `https://passop-password-manager-8rvm.onrender.com/password/update/${existingId}`
        : `https://passop-password-manager-8rvm.onrender.com/password/create`;

    await fetch(url, {
      method: mode === "UPDATE" ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ site, username, password }),
    });

    chrome.runtime.sendMessage({ type: "CLEAR_PENDING_SAVE" });
    window.close();
  };

  shadow.getElementById("dismiss").onclick = () => {
    window.close();
  };
}
