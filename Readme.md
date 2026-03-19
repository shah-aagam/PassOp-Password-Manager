# PassOp — Password Manager

A full-stack password manager built with a focus on client-side encryption. Passwords are encrypted in the browser before reaching the server, meaning even a compromised database exposes nothing useful to an attacker.

---

## How It Works

The core idea is simple: the server never sees your actual passwords.

When you save a password, it is encrypted on your device using an AES-256 key derived from your master password. The server stores only the encrypted ciphertext. When you want to view or copy a password, the ciphertext is fetched and decrypted locally in your browser.

The master password never leaves your device.

---

## Encryption Model

Key derivation uses PBKDF2 with SHA-256 and 310,000 iterations — the OWASP recommended minimum. This makes brute-force attacks against a stolen database computationally expensive.

```
masterPassword + randomSalt
  → PBKDF2 (310,000 iterations)
  → AES-256-GCM encryption key
  → used to encrypt / decrypt vault entries
```

To verify the master password at unlock without storing it server-side, a small test value is encrypted at registration and stored as a verifier. On unlock, decryption is attempted — success confirms the correct master password, failure rejects it. AES-GCM handles this natively by throwing on a wrong key.

---

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Framer Motion
- Web Crypto API (native browser encryption)

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- bcrypt, JSON Web Tokens

---

## Features

- Client-side AES-256-GCM encryption — server stores only ciphertext
- Master password never transmitted or stored
- Vault auto-locks after configurable inactivity period
- Password strength indicator
- Strong password generator
- Copy to clipboard with auto-clear after 20 seconds
- Audit log per entry — tracks view, copy, edit, delete actions
- Grid and list view for vault entries

---

## Security Notes

| What                   | Where it lives                              |
|------------------------|---------------------------------------------|
| JWT token              | localStorage                                |
| encryptionSalt         | sessionStorage (cleared on tab close)       |
| vaultVerifier          | sessionStorage (cleared on tab close)       |
| encryptionKey          | React context memory (wiped on refresh)     |
| masterPassword         | Never stored anywhere                       |
| Actual passwords       | Never sent to server                        |

Refreshing the page wipes the encryption key from memory. The vault locks automatically and requires the master password to re-derive the key. This is intentional.

---

## Getting Started

**Prerequisites:** Node.js, MongoDB

```bash
# Clone the repo
git clone https://github.com/your-username/PassOp-Password-Manager.git

# Backend
cd backend
npm install
cp .env.example .env   # add your JWT_SECRET and MONGODB_URI
node server.js

# Frontend
cd frontend
npm install
pnpm run dev
```

---

## Environment Variables

```
# backend/.env
MONGODB_URI=
JWT_SECRET=

# frontend/.env
VITE_API_URL=
```

---

