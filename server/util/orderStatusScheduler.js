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

const updateOrderStatusToUncollected = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const ordersToUpdate = await Order.find({
      orderedDate: { $lt: twentyFourHoursAgo },
      status: {
        $in: ["order placed", "accepted", "processing", "order ready"],
      },
    });

    console.log(
      `Found ${ordersToUpdate.length} orders to update to uncollected status`
    );

    for (const order of ordersToUpdate) {
      await Order.findOneAndUpdate(
        { orderId: order.orderId },
        { status: "uncollected" }
      );

      const user = await Users.findById(order.userId);
      if (user && user.email) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Order Status Updated - Uncollected`,
            text: `Dear ${user.username || user.email},\n\nYour order (ID: ${
              order.orderId
            }) from ${
              order.canteenName
            } has been automatically updated to "uncollected" status as it has been more than 24 hours since the order was placed.\n\nPlease contact the canteen if you still wish to collect your order.\n\nThank you for using Canteenz!`,
          });
          console.log(
            `Email sent to: ${user.email} for uncollected order ${order.orderId}`
          );
        } catch (emailError) {
          console.error(
            `Error sending email for order ${order.orderId}:`,
            emailError
          );
        }
      }
    }

    console.log(
      `Successfully updated ${ordersToUpdate.length} orders to uncollected status`
    );
  } catch (error) {
    console.error("Error updating orders to uncollected status:", error);
  }
};

const startOrderStatusScheduler = () => {
  setInterval(updateOrderStatusToUncollected, 60 * 60 * 1000);

  updateOrderStatusToUncollected();

  console.log(
    "Order status scheduler started - checking every hour for orders older than 24 hours"
  );
};

module.exports = {
  startOrderStatusScheduler,
  updateOrderStatusToUncollected,
};
