const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./src/controllers/auth.controller");
const adminRoutes = require("./src/controllers/admin.controller");
const cors = require("cors");
require("dotenv").config();
const {
  authenticateJWT,
  authorizeRoles,
} = require("./src/middlewares/auth.middlewares");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/auth", authRoutes);
app.use("/admin", authenticateJWT, authorizeRoles("distributor"), adminRoutes);

// Sample route
app.get("/", (req, res) => {
  res.send("Hello, world! Express is running.");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
