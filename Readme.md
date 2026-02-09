# 🔐 PassOP — Secure Password Manager

PassOP is a **security-first password vault** designed to mirror the internal architecture of production-grade tools like **Bitwarden**.  
Built as a developer-focused project, it prioritizes **encryption integrity, access transparency, and defense-in-depth** over simple CRUD operations.

---

## 🚀 Key Features

### 🔐 Vault Security & Encryption
- **AES Encryption**: All credentials are encrypted using AES before database persistence — plaintext passwords never touch disk.
- **Decryption on Demand**: Sensitive data remains encrypted in memory and is decrypted only upon explicit user action.
- **Vault Auto-Lock**: User-configurable inactivity timeout that clears decrypted state and forces re-authentication.
- **Clipboard Protection**: Copied passwords are automatically cleared from the clipboard after a fixed duration.

---

### 🧾 Comprehensive Audit Logging
PassOP implements a **transparency-first auditing system**:
- **Event Tracking**: Logs all password actions — view, copy, edit, and delete.
- **Security Timeline**: Each credential maintains a dedicated activity history, reflecting enterprise-grade security visibility.

---

### 🧠 Modern UX Polish
- **Adaptive UI**: Toggle between Grid and List views for high-density or focused browsing.
- **Smart Assets**: Automatic site favicon detection for saved credentials.
- **State Awareness**: Robust loading states and global toast-based error handling for smooth user experience.

---

## 🏗 System Architecture

PassOP follows a **Backend-for-Frontend (BFF)** pattern to enhance security and reduce surface exposure.

- **Frontend Proxy**: Uses a Vercel Serverless Function as a reverse proxy to mask backend URLs and prevent information leakage.
- **Axios Interceptors**: Centralized JWT attachment and automatic logout on `401 Unauthorized` responses.
- **Defense-in-Depth**: Backend hardened with layered security middleware.

---

## 🛠 Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | React, Tailwind CSS, Context API |
| Backend | Node.js, Express.js, MongoDB (Atlas) |
| Security | JWT, bcrypt, AES-256-CBC, Helmet.js |
| Infrastructure | Vercel (Frontend), Render (Backend) |

---

## 🛡 Security Middleware

The backend is protected using industry-standard security tooling:

```js
// Security hardening via Helmet and Rate Limiting
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 100,                // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later.",
});

app.use(limiter);


