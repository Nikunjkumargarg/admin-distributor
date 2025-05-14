const { Readable } = require("stream");
const csv = require("csv-parser");
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { sendWelcomeEmail } = require("../config/email");

async function handleDistributorCSVBuffer(buffer) {
  const distributors = [];

  return new Promise((resolve, reject) => {
    const stream = Readable.from(buffer);

    stream
      .pipe(csv())
      .on("data", (row) => {
        if (row.name && row.email) {
          distributors.push({
            name: row.name.trim(),
            email: row.email.trim(),
          });
        }
      })
      .on("end", async () => {
        try {
          const inserted = [];

          for (const distributor of distributors) {
            // Check if email already exists
            const existing = await pool.query(
              "SELECT id FROM distributer WHERE email = $1",
              [distributor.email]
            );

            if (existing.rows.length > 0) {
              continue; // Skip if email already exists
            }

            // Generate password
            const plainPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            // Insert into DB
            await pool.query(
              "INSERT INTO distributer (name, email, password) VALUES ($1, $2, $3)",
              [distributor.name, distributor.email, hashedPassword]
            );
            console.log(distributor.email);
            console.log(distributor.name);
            console.log("plain password", plainPassword);
            console.log("hello inserted");
            //send mail to distributor
            await sendWelcomeEmail(
              distributor.email,
              distributor.name,
              plainPassword
            );

            inserted.push({
              name: distributor.name,
              email: distributor.email,
              password: plainPassword,
            });
          }

          resolve(inserted);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", reject);
  });
}

module.exports = {
  handleDistributorCSVBuffer,
};
