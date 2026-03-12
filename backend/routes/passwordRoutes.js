import express from "express";
import Password from "../model/passwordModel.js";
import { encrypt, decrypt } from "../utils/encrypt.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

import { logAudit } from "../utils/auditLogger.js";

const router = express.Router();


const normalizeSite = (input) => {
    try {
        let urlString = input.trim().toLowerCase();

        if (!/^https?:\/\//i.test(urlString)) {
            urlString = 'https://' + urlString;
        }
        const url = new URL(urlString);

        return url.hostname.replace(/^www\./i, "");
    } catch (err) {

        return input.trim().toLowerCase().replace(/^www\./i, "");
    }
};


router.post("/create", authMiddleware, async (req, res) => {
    try {
        const { site, username, ciphertext, iv } = req.body;

        const entry = await Password.create({
        userId: req.user.userId,
        site,
        username,
        ciphertext,
        iv
        });

        res.json({ message: "Password saved", entry });

    } catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});


router.get("/all", authMiddleware, async (req, res) => {
    try {
        const passwords = await Password.find({
            userId: req.user.userId,
            deleted: false
        }).sort({ createdAt: -1 });

        const processed = passwords.map(p => ({
            ...p._doc,
            password: "*".repeat(8)
        }));

        res.json(processed);
    } catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});


router.get("/view/:id", authMiddleware, async (req, res) => {
    try {
        const entry = await Password.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!entry) return res.status(404).json({ message: "Not found" });


        await logAudit({
            userId: req.user.userId,
            passwordId: entry._id,
            action: "VIEW_PASSWORD",
        });

        res.json({ ciphertext: entry.ciphertext, iv: entry.iv });

    } catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});

router.post("/copy/:id", authMiddleware, async (req, res) => {
  try {
    const entry = await Password.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      deleted: false,
    });

    if (!entry) {
      return res.status(404).json({ message: "Not found" });
    }

    await logAudit({
      userId: req.user.userId,
      passwordId: entry._id,
      action: "COPY_PASSWORD",
    });

    res.json({
      ciphertext: entry.ciphertext,
      iv: entry.iv,
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const { site, username, ciphertext, iv } = req.body;

    const updated = await Password.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        site,
        username,
        ciphertext,
        iv,
      },
      { new: true }
    );

    await logAudit({
      userId: req.user.userId,
      passwordId: updated._id,
      action: "EDIT_PASSWORD",
    });

    res.json({ message: "Updated", updated });

  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
});


router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
        await Password.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { deleted: true }
        );

        await logAudit({
            userId: req.user.userId,
            passwordId: req.params.id,
            action: "DELETE_PASSWORD",
        });

        res.json({ message: "Entry deleted" });

    } catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});



router.get("/by-domain", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({ message: "Domain is required" });
    }

    const normalizedDomain = normalizeSite(domain);

    const passwords = await Password.find({
      userId: userId,        
      site: normalizedDomain, 
      deleted: false           
    }).select("username ciphertext iv site");

    res.json(passwords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch credentials" });
  }
});



export default router;
