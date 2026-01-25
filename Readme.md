# 🔐 PassOP — Secure Password Manager

PassOP is a security-focused password manager designed to demonstrate how real-world password vaults work internally.  
It emphasizes **encryption, access auditing, vault locking, and clean UX**, rather than being a simple CRUD application.

---

## 🚀 Features

### 🔑 Authentication & Session Handling
- JWT-based authentication
- Protected routes with global auth state
- Persistent login across reloads
- Automatic logout on token expiry using Axios interceptors

### 🔐 Vault Security
- Auto-lock vault after inactivity (configurable)
- Manual vault lock option
- Re-authentication required for sensitive actions
- Retry limit on incorrect password attempts

### 🗝 Password Management
- Secure storage using AES-based encryption
- Passwords are decrypted **only on demand**
- View, copy, edit, and delete passwords
- Clipboard auto-clear after copying passwords

### 🧾 Audit Logging (Key Highlight)
- Tracks password access events:
  - View
  - Copy
  - Edit
  - Delete
- User-visible audit timeline per password
- Global activity page for security transparency

### 🧠 UX & Product Polish
- Grid / List view toggle
- Search by site or username
- Site favicons inside password cards
- Loading states and disabled actions during async operations
- Clean empty states and microcopy
- Toast-based global error handling

---

## 🏗 Tech Stack

### Frontend
- React
- Tailwind CSS
- Axios
- Context API

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt
- AES Encryption

---

## 🔐 Security Design Notes

- Passwords are **never stored in plaintext**
- Encryption occurs before database storage
- Decryption happens only when explicitly requested
- Sensitive actions require re-authentication
- Vault auto-lock protects against unattended access
- Audit logs provide full transparency to users

This project focuses on **security correctness**, not just UI features.


