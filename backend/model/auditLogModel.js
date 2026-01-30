import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    passwordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Password",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "VIEW_PASSWORD",
        "COPY_PASSWORD",
        "EDIT_PASSWORD",
        "DELETE_PASSWORD",
      ],
      required: true,
    },

    metadata: {
      type: Object, 
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
