const Order = require("../Models/OrderModel");

exports.getNotifications = async (req, res) => {
  try {
    const ownerId = req.user._id;
    console.log("NotificationController: ownerId", ownerId);

    const orders = await Order.find({
      canteenName: req.user.canteenName,
      status: "order placed",
    });
    console.log(
      "NotificationController: orders with status order placed",
      orders.length
    );

    const notifications = orders.map((order) => ({
      _id: order._id,
      ownerId,
      orderId: order._id,
      message: `Order received from ${order.orderId}`,
      isRead: false,
      createdAt: order.orderedDate,
    }));
    res.json(notifications);
  } catch (error) {
    console.error("NotificationController: error", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
};
