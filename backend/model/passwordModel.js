import mongoose from "mongoose";

const passwordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,             
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

    // passwordEncrypted: {
    //   type: String,
    //   required: true,          // AES-256 encrypted
    // },
    ciphertext: {
      type: String,
      required: true,    
    },
    iv: {
      type: String,
      required: true,     
    },

    // passwordSalt: {
    //   type: String,
    //   required: true,     
    // },

    deleted: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Password", passwordSchema);
