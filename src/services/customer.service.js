const db = require("../config/db");
const axios = require("axios");
const { sendWelcomeEmail } = require("../config/email");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtp = async (req, res) => {
  try {
    const { mobile_number } = req.body;
    const cleanMobileNumber = mobile_number.replace(/[^\d+]/g, "");
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      `INSERT INTO otp_verification (mobile_number, otp, expires_at, verified)
       VALUES ($1, $2, $3, false)
       ON CONFLICT (mobile_number) DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at, verified = false`,
      [cleanMobileNumber, otp, expiresAt]
    );

    await axios.post(
      "https://bmfvr1xpt7.execute-api.ap-south-1.amazonaws.com/v1/smsapi",
      { num: cleanMobileNumber, otp },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error in sendOtp:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { mobile_number, otp } = req.body;
    const result = await db.query(
      `SELECT * FROM otp_verification WHERE mobile_number = $1`,
      [mobile_number]
    );
    const record = result.rows[0];

    if (
      !record ||
      record.verified ||
      new Date(record.expires_at) < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    await db.query(
      `UPDATE otp_verification SET verified = true WHERE mobile_number = $1`,
      [mobile_number]
    );

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error in verifyOtp:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const { name, mobile_number } = req.body;
    const distributorEmail = req.user.email;

    const otpCheck = await db.query(
      `SELECT * FROM otp_verification WHERE mobile_number = $1 AND verified = true`,
      [mobile_number]
    );
    if (!otpCheck.rowCount) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    const existingCustomer = await db.query(
      `SELECT * FROM customer WHERE mobile_number = $1`,
      [mobile_number]
    );
    if (existingCustomer.rowCount > 0) {
      return res.status(400).json({ message: "Customer already exists" });
    }

    const distributor = await db.query(
      `SELECT id FROM distributer WHERE email = $1`,
      [distributorEmail]
    );
    const distributorId = distributor.rows[0]?.id;

    if (!distributorId) {
      return res.status(400).json({ message: "Distributor not found" });
    }

    const customer = await db.query(
      `INSERT INTO customer (name, mobile_number) VALUES ($1, $2) RETURNING id`,
      [name, mobile_number]
    );
    const customerId = customer.rows[0].id;

    await db.query(
      `INSERT INTO sale (distributor_id, customer_id) VALUES ($1, $2)`,
      [distributorId, customerId]
    );

    res.json({ message: "Customer created and sale recorded successfully" });
  } catch (err) {
    console.error("Error in createCustomer:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.customerslist = async (req, res) => {
  try {
    const query = `
      SELECT 
  c.mobile_number AS customer_mobile,
  d.mobile_number AS distributor_mobile
FROM customer c
JOIN sale s ON c.id = s.customer_id
JOIN distributer d ON s.distributor_id = d.id;
    `;

    const result = await await db.query(query); // 'pool.query()' executes the SQL query
    res.json(result.rows); // Send the result as a JSON response
  } catch (error) {
    console.error("Error fetching customers with distributors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
