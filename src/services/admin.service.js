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
        let mobile = row.mobile_number?.trim();
        const quantity = row.quantity_alloted?.trim();

        if (mobile && quantity) {
          if (/^\d{10}$/.test(mobile)) {
            mobile = `+91${mobile}`;
          }

          distributors.push({
            mobile_number: mobile,
            quantity_alloted: parseInt(quantity, 10),
          });
        }
      })
      .on("end", async () => {
        try {
          const inserted = [];

          for (const distributor of distributors) {
            // Check if email already exists
            const existing = await pool.query(
              "SELECT id FROM distributer WHERE mobile_number = $1",
              [distributor.mobile_number]
            );

            if (existing.rows.length > 0) {
              continue; // Skip if email already exists
            }

            // Insert into DB
            await pool.query(
              "INSERT INTO distributer (mobile_number, quantity_alloted) VALUES ($1, $2)",
              [distributor.mobile_number, distributor.quantity_alloted]
            );
            console.log(distributor.mobile_number);
            console.log(distributor.quantity_alloted);
            console.log("hello inserted");
            //send mail to distributor
            //await sendWelcomeEmail(distributor.mobile_number);

            inserted.push({
              mobile_number: distributor.mobile_number,
              quantity: distributor.quantity_alloted,
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
