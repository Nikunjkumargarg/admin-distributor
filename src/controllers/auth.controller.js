const express = require("express");
const { loginService } = require("../services/auth.service");
const { verifyOtp } = require("../services/auth.service");
const customerService = require("../services/customer.service");

const router = express.Router();

router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await loginService(email, password);
    console.log("result", result);
    res.json(result);
  } catch (err) {
    if (err.message === "Invalid email or password") {
      return res.status(401).json({ message: err.message });
    }
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/distributor/send-otp", customerService.sendOtp);

router.post("/distributor/verify-otp", verifyOtp);

module.exports = router;
