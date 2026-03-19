import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  encryptionSalt: { type: String, required: true },
  vaultVerifier: { type: String, required: true }, // ← encrypted "verify"
}, { timestamps: true });

export default mongoose.model("User", userSchema);
