const express = require("express");
const multer = require("multer");
const { handleDistributorCSVBuffer } = require("../services/admin.service");

const router = express.Router();

// Use multer memory storage (file kept in memory, not saved to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload-distributors",
  upload.single("file"), // Expect field name as 'file'
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "CSV file is required" });
      }

      const result = await handleDistributorCSVBuffer(req.file.buffer);
      res.json({
        message: "Distributors uploaded successfully",
        inserted: result,
      });
    } catch (err) {
      console.error("CSV Upload Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

module.exports = router;
