
// Get notifications for owner
const Order = require('../Models/OrderModel');
exports.getNotifications = async (req, res) => {
  try {
    const ownerId = req.user._id;
    console.log('NotificationController: ownerId', ownerId);

    // Get all orders for this owner with status 'order placed'
    const orders = await Order.find({ canteenName: req.user.canteenName, status: 'order placed' });
    console.log('NotificationController: orders with status order placed', orders.length);
    // For each order, if no notification exists, add a virtual notification
    // Create virtual notifications for all 'order placed' orders
    const notifications = orders.map(order => ({
      _id: order._id,
      ownerId,
      orderId: order._id,
      message: `Order received from ${order.orderId}`,
      isRead: false,
      createdAt: order.orderedDate
    }));
    res.json(notifications);
  } catch (error) {
    console.error('NotificationController: error', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
};
