import mongoose from "mongoose";

const passwordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,             // optimized queries
    },

    site: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    passwordEncrypted: {
      type: String,
      required: true,          // AES-256 encrypted
    },

    passwordSalt: {
      type: String,
      required: true,          // random salt per entry
    },

    deleted: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Password", passwordSchema);
