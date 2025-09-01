import React, { useEffect, useState } from "react";
import axios from "axios";
import config from '../../config/appConfig';
import "./order.css";
import { FormControl, Select, MenuItem, InputLabel, Grid } from '@mui/material';

const statusOptions = ["order placed","accepted", "processing", "order ready", "collected", "uncollected", "fined"];

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [canteenName, setCanteenName] = useState("");
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

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
          setAllOrders(res.data);
          setOrders(res.data);
        } else {
          console.error("API did not return an array:", res.data);
          setAllOrders([]); // fallback to empty array to avoid map() error
          setOrders([]);
        }
      })
      .catch((err) => console.error(err));
  }, [canteenName]);

  // Filter orders by status, payment mode, and time
  useEffect(() => {
    let filtered = allOrders;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    if (selectedPaymentMode !== 'all') {
      filtered = filtered.filter(order => order.paymentMode === selectedPaymentMode);
    }

    // Time filtering
    if (selectedTimeFilter === 'month' && selectedMonth) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderedDate);
        return orderDate.getMonth() === parseInt(selectedMonth);
      });
    }

    if (selectedTimeFilter === 'year' && selectedYear) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderedDate);
        return orderDate.getFullYear() === parseInt(selectedYear);
      });
    }

    setOrders(filtered);
  }, [selectedStatus, selectedPaymentMode, selectedTimeFilter, selectedMonth, selectedYear, allOrders]);

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
      
      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Order Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Order Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Payment Mode</InputLabel>
            <Select
              value={selectedPaymentMode}
              label="Payment Mode"
              onChange={(e) => setSelectedPaymentMode(e.target.value)}
            >
              <MenuItem value="all">All Payment Modes</MenuItem>
              <MenuItem value="online">Online</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Time Filter</InputLabel>
            <Select
              value={selectedTimeFilter}
              label="Time Filter"
              onChange={(e) => {
                setSelectedTimeFilter(e.target.value);
                setSelectedMonth('');
                setSelectedYear('');
              }}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {selectedTimeFilter === 'month' && (
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <MenuItem value="0">January</MenuItem>
                <MenuItem value="1">February</MenuItem>
                <MenuItem value="2">March</MenuItem>
                <MenuItem value="3">April</MenuItem>
                <MenuItem value="4">May</MenuItem>
                <MenuItem value="5">June</MenuItem>
                <MenuItem value="6">July</MenuItem>
                <MenuItem value="7">August</MenuItem>
                <MenuItem value="8">September</MenuItem>
                <MenuItem value="9">October</MenuItem>
                <MenuItem value="10">November</MenuItem>
                <MenuItem value="11">December</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
        {selectedTimeFilter === 'year' && (
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {(() => {
                  const currentYear = new Date().getFullYear();
                  const years = [];
                  for (let year = currentYear; year >= currentYear - 5; year--) {
                    years.push(
                      <MenuItem key={year} value={year.toString()}>
                        {year}
                      </MenuItem>
                    );
                  }
                  return years;
                })()}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>

      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date & Time</th>
            <th>Items</th>
            <th>No. of Items</th>
            <th>Price</th>
            <th>Penalty Charge</th>
            <th>Total with Penalty</th>
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
              <td>Rs. {order.originalPrice || order.price}</td>
              <td>
                {order.penaltyAmount && order.penaltyAmount > 0 ? (
                  <span style={{ color: 'red', fontWeight: 'bold' }}>
                    Rs. {Number(order.penaltyAmount).toLocaleString()}
                  </span>
                ) : '-'}
              </td>
              <td>Rs. {order.price.toLocaleString()}</td>
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
