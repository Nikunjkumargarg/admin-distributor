const express = require("express");
const multer = require("multer");
const {
  handleDistributorCSVBuffer,
  createDistributor,
  downloadDistributors,
  downloadRecipients,
  getAllDistributorsSummary,
} = require("../services/admin.service");
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middlewares/auth.middlewares");

const router = express.Router();

// Use multer memory storage (file kept in memory, not saved to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload-distributors",
  authenticateJWT,
  authorizeRoles("admin"),
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

router.post(
  "/create-distributor",
  authenticateJWT,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await createDistributor(req.body);
      res.json(result);
    } catch (err) {
      console.error("Create Distributor Error:", err);
      const status = err.status || 500;
      res
        .status(status)
        .json({ message: err.message || "Internal server error" });
    }
  }
);

router.get(
  "/distributors-summary",
  //authenticateJWT,
  //authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await getAllDistributorsSummary();
      res.json(result);
    } catch (err) {
      console.log("Error: ", err);
      const status = err.status || 500;
      res
        .status(status)
        .json({ message: err.message || "Internal server error" });
    }
  }
);

router.get(
  "/download-distributors",
  //authenticateJWT,
  //authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await downloadDistributors(req.body);
      res.header("Content-Type", "text/csv");
      res.attachment("distributors.csv");
      res.send(result);
    } catch (err) {
      console.error("Fetching CSV error:", err);
      const status = err.status || 500;
      res
        .status(status)
        .json({ message: err.message || "Internal server error" });
    }
  }
);

router.get(
  "/download-recipients",
  //authenticateJWT,
  //authorizeRoles("admin"),
  async (req, res) => {
    try {
      const result = await downloadRecipients(req.body);
      res.header("Content-Type", "text/csv");
      res.attachment("Recipients.csv");
      res.send(result);
    } catch (err) {
      console.error("Fetching CSV error:", err);
      const status = err.status || 500;
      res
        .status(status)
        .json({ message: err.message || "Internal server error" });
    }
  }
);

module.exports = router;
