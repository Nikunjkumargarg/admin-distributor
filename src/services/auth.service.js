const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function loginService(email, password) {
  let user = null;
  let role = null;

  // Check admins table
  const adminResult = await pool.query("SELECT * FROM admin WHERE email = $1", [
    email,
  ]);

  if (adminResult.rows.length > 0) {
    user = adminResult.rows[0];
    role = "admin";
  } else {
    // Check distributors table
    const distResult = await pool.query(
      "SELECT * FROM distributer WHERE email = $1",
      [email]
    );

    if (distResult.rows.length > 0) {
      user = distResult.rows[0];
      role = "distributor";
    }
  }

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token, role };
}

module.exports = {
  loginService,
};
