import express from "express";
import Password from "../model/passwordModel.js";
import { encrypt, decrypt } from "../utils/encrypt.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();


// CREATE PASSWORD
router.post("/create", authMiddleware, async (req, res) => {
    try {
        const { site, username, password } = req.body;

        const encrypted = encrypt(password);  // AES encrypt

        const entry = await Password.create({
            userId: req.user.userId,
            site,
            username,
            passwordEncrypted: encrypted,
            passwordSalt: encrypted.split(":")[0],
        });

        res.json({ message: "Password saved", entry });

    } catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});


// GET ALL PASSWORDS
router.get("/all", authMiddleware, async (req, res) => {
    try {
        const passwords = await Password.find({
            userId: req.user.userId,
            deleted: false
        }).sort({ createdAt: -1 });

        // Mask passwords (same as front-end)
        const processed = passwords.map(p => ({
            ...p._doc,
            password: "*".repeat(8)
        }));

        res.json(processed);
    } catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});


// GET DECRYPTED PASSWORD (SHOW PASSWORD)
router.get("/view/:id", authMiddleware, async (req, res) => {
    try {
        const entry = await Password.findOne({
            _id: req.params.id,
            userId: req.user.userId
        });

        if (!entry) return res.status(404).json({ message: "Not found" });

        const decryptedPassword = decrypt(entry.passwordEncrypted);

        res.json({ password: decryptedPassword });

    } catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});


// UPDATE PASSWORD
router.put("/update/:id", authMiddleware, async (req, res) => {
    try {
        const { site, username, password } = req.body;

        const encrypted = encrypt(password);

        const updated = await Password.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            {
                site,
                username,
                passwordEncrypted: encrypted,
                passwordSalt: encrypted.split(":")[0],
            },
            { new: true }
        );

        res.json({ message: "Updated", updated });

    } catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});


// SOFT DELETE
router.delete("/delete/:id", authMiddleware, async (req, res) => {
    try {
        await Password.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { deleted: true }
        );

        res.json({ message: "Entry deleted" });

    } catch (err) {
        res.status(500).json({ message: "Server error", err });
    }
});

export default router;
