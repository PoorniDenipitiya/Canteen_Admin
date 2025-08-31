const Order = require('../Models/OrderModel');
const Users = require('../Models/UsersModel');
const nodemailer = require('nodemailer');

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

// Function to update orders to "uncollected" status after 24 hours
const updateOrderStatusToUncollected = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find orders that are older than 24 hours and have status "order ready" but not "collected", "uncollected", or "fined"
    const ordersToUpdate = await Order.find({
      orderedDate: { $lt: twentyFourHoursAgo },
      status: { $in: ["order placed", "accepted", "processing", "order ready"] }
    });

    console.log(`Found ${ordersToUpdate.length} orders to update to uncollected status`);

    for (const order of ordersToUpdate) {
      // Update order status to "uncollected"
      await Order.findOneAndUpdate(
        { orderId: order.orderId },
        { status: "uncollected" }
      );

      // Find user to send notification email
      const user = await Users.findById(order.userId);
      if (user && user.email) {
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: `Order Status Updated - Uncollected`,
            text: `Dear ${user.username || user.email},\n\nYour order (ID: ${order.orderId}) from ${order.canteenName} has been automatically updated to "uncollected" status as it has been more than 24 hours since the order was placed.\n\nPlease contact the canteen if you still wish to collect your order.\n\nThank you for using Canteenz!`
          });
          console.log(`Email sent to: ${user.email} for uncollected order ${order.orderId}`);
        } catch (emailError) {
          console.error(`Error sending email for order ${order.orderId}:`, emailError);
        }
      }
    }

    console.log(`Successfully updated ${ordersToUpdate.length} orders to uncollected status`);
  } catch (error) {
    console.error('Error updating orders to uncollected status:', error);
  }
};

// Function to start the scheduler
const startOrderStatusScheduler = () => {
  // Run every hour to check for orders that need status updates
  setInterval(updateOrderStatusToUncollected, 60 * 60 * 1000);
  
  // Also run once when the server starts
  updateOrderStatusToUncollected();
  
  console.log('Order status scheduler started - checking every hour for orders older than 24 hours');
};

module.exports = {
  startOrderStatusScheduler,
  updateOrderStatusToUncollected
};
