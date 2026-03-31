const express = require("express");
const router = express.Router();
const Order = require("../Models/OrderModel");
const Users = require("../Models/UsersModel");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.get("/canteen/:canteenName", async (req, res) => {
  const { canteenName } = req.params;

  try {
    const orders = await Order.find({
      canteenName: decodeURIComponent(canteenName),
    })
      .populate("userId", "username email")
      .sort({ orderedDate: -1 });

    res.status(200).json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch orders", details: err.message });
  }
});

router.get("/dashboard/:canteenName", async (req, res) => {
  const { canteenName } = req.params;

  try {
    const orders = await Order.find({
      canteenName: decodeURIComponent(canteenName),
    });

    const totalOrders = orders.length;
    const prePaidOrders = orders.filter(
      (order) => order.paymentMode === "online"
    ).length;
    const postPaidOrders = orders.filter(
      (order) => order.paymentMode === "cash"
    ).length;
    const finedOrders = orders.filter(
      (order) => order.status === "fined"
    ).length;

    const uniqueCustomers = new Set(
      orders.map((order) => order.userId.toString())
    );
    const totalCustomers = uniqueCustomers.size;

    const totalSales = orders.reduce((sum, order) => sum + order.price, 0);

    const monthlyData = generateMonthlyData(orders);

    res.status(200).json({
      totalOrders,
      prePaidOrders,
      postPaidOrders,
      finedOrders,
      totalCustomers,
      totalSales,
      monthlyData,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch dashboard data", details: err.message });
  }
});

const generateMonthlyData = (orders) => {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  return months.map((month, index) => {
    const monthOrders = orders.filter((order) => {
      const orderDate = new Date(order.orderedDate);
      return orderDate.getMonth() === index;
    });

    const sales = monthOrders.reduce((sum, order) => sum + order.price, 0);
    const uniqueCustomers = new Set(
      monthOrders.map((order) => order.userId.toString())
    ).size;

    return {
      month,
      sales,
      customers: uniqueCustomers,
      orders: monthOrders.length,
    };
  });
};

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

    if (status === "collected" && updated.penaltyAmount > 0) {
      try {
        const result = await Order.updateMany(
          {
            userId: updated.userId,
            canteenName: updated.canteenName,
            status: "uncollected",
            paymentMode: "cash",
          },
          {
            status: "fined",
          }
        );

        console.log(
          `Updated ${result.modifiedCount} uncollected orders to fined status for user ${updated.userId} in canteen ${updated.canteenName}`
        );
      } catch (error) {
        console.error("Error updating uncollected orders to fined:", error);
      }
    }

    const user = await Users.findById(updated.userId);
    if (user && user.email) {
      console.log(
        `Attempting to send email to userId: ${updated.userId}, email: ${user.email}`
      );
      await transporter
        .sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: `Order Status Updated by ${updated.canteenName}`,
          text: `Dear ${
            user.username || user.email
          },\n\nYour order (ID: ${orderId}) from ${
            updated.canteenName
          } has been updated.\n\nNew Status: ${status}\n\nThank you for using Canteenz!`,
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
    res
      .status(500)
      .json({ error: "Failed to update status", details: err.message });
  }
});

module.exports = router;
