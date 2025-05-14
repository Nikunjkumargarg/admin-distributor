const nodemailer = require("nodemailer");
console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport({
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 587, // ✅ use 587 for STARTTLS
  secure: false, // use TLS, not SSL
  auth: {
    user: process.env.EMAIL_USER || "AKIAVRS56RTVDL4SFJLF", // AWS SMTP username
    pass:
      process.env.EMAIL_PASS || "BFRzTZ7vKdXx9s0cUe0sdBIDkpggNlJxzRxxDTKDIHR2", // AWS SMTP password
  },
});

const sendWelcomeEmail = async (toEmail, name, password) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: toEmail,
    subject: "Welcome to Our Platform",
    html: `
      <p>Dear ${name},</p>
      <p>You have been added as a distributor to our platform.</p>
      <p>Your login credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${toEmail}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please log in and change your password.</p>
      <p>Best regards,<br/>Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail };
