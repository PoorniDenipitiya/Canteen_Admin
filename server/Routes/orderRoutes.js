const express = require("express");
const router = express.Router();
const Order = require("../Models/OrderModel"); // ✅ your Mongoose Order model

// ✅ PATCH status update route
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
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

module.exports = router;
