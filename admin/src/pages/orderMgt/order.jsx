import React, { useEffect, useState } from "react";
import axios from "axios";
import config from '../../config/appConfig';
import "./order.css";

const statusOptions = ["order placed","accepted", "processing", "order ready", "collected"];

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [canteenName, setCanteenName] = useState("");

  // ✅ Load canteen name once
  useEffect(() => {
    const storedCanteenName = localStorage.getItem("canteenName") || "";
    setCanteenName(storedCanteenName);
  }, []);

  // ✅ Fetch orders ONLY when canteenName is ready
  useEffect(() => {
    if (!canteenName) return;

    axios
    .get(`${config.api_base_urls.user}/api/admin/orders?canteenName=${canteenName}`)
      .then((res) => {
        console.log("API response:", res.data);
        if (Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          console.error("API did not return an array:", res.data);
          setOrders([]); // fallback to empty array to avoid map() error
        }
      })
      .catch((err) => console.error(err));
  }, [canteenName]);

  /*const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, status: newStatus } : order
      )
    );
  };*/

  const handleStatusChange = async (orderId, newStatus) => {
  try {
    // Update status in backend (Admin API runs on port 5000!)
  await axios.patch(`${config.api_base_urls.admin}/api/admin/orders/${orderId}/status`, {
      status: newStatus,
    });

    // Update local UI state too
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, status: newStatus } : order
      )
    );

    console.log(`Updated order ${orderId} status to ${newStatus}`);
  } catch (err) {
    console.error("Failed to update order status", err);
  }
};

  return (
    <div className="order-container">
      <h1>Orders for {canteenName}</h1>
      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date & Time</th>
            <th>Items</th>
            <th>No. of Items</th>
            <th>Price</th>
            <th>Payment Mode</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{new Date(order.orderedDate).toLocaleString()}</td>
              <td>
                {order.items.map((item, idx) => (
                  <span key={idx}>
                    {item.name} ({item.quantity})
                    {idx < order.items.length - 1 ? ", " : ""}
                  </span>
                ))}
              </td>
              <td>
                {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </td>
              <td>Rs. {order.price}</td>
              <td>{order.paymentMode}</td>
              <td>
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order.orderId, e.target.value)
                  }
                  className={`status-dropdown status-${order.status.replace(
                    " ",
                    "-"
                  )}`}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Order;
