import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import AuditLog from "../model/auditLogModel.js";

const router = express.Router();


router.get("/", authMiddleware, async (req, res) => {
  const logs = await AuditLog.find({
    userId: req.user.userId,
  })
    .populate("passwordId", "site")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(logs);
});



router.get("/:passwordId", authMiddleware, async (req, res) => {
  const logs = await AuditLog.find({
    userId: req.user.userId,
    passwordId: req.params.passwordId,
  }).sort({ createdAt: -1 });

  res.json(logs);
});

export default router;
