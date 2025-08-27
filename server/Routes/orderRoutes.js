
const express = require("express");
const router = express.Router();
const Order = require("../Models/OrderModel");
const Users = require("../Models/UsersModel");
const nodemailer = require("nodemailer");

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// PATCH status update route
router.patch("/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const updated = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Find user email from users collection
    const user = await Users.findById(updated.userId);
    if (user && user.email) {
      console.log(`Attempting to send email to userId: ${updated.userId}, email: ${user.email}`);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Order Status Updated by ${updated.canteenName}`,
        text: `Dear ${user.username || user.email},\n\nYour order (ID: ${orderId}) from ${updated.canteenName} has been updated.\n\nNew Status: ${status}\n\nThank you for using Canteenz!`
      })
      .then(() => {
        console.log(`Email sent to: ${user.email}`);
      })
      .catch((err) => {
        console.error("Error sending email:", err);
      });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

module.exports = router;
