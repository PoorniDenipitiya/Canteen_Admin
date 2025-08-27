import React, { useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import axios from 'axios';
import config from '../../config/appConfig';
import './index.css'; // Add styles for the modern tabular format


const OrderManagement = () => {
  const navigate = useNavigate();
  const [categoriesWithFoodCount, setCategoriesWithFoodCount] = useState([]);
  const [canteenName, setCanteenName] = useState('');
  const statusOptions = ["order placed", "accepted", "processing", "order ready", "collected"];
  const [orderStatusCounts, setOrderStatusCounts] = useState({});

  // Fetch canteen name from localStorage
  useEffect(() => {
    const storedCanteenName = localStorage.getItem('canteenName') || '';
    setCanteenName(storedCanteenName);
  }, []);

  // Fetch categories and food items
  useEffect(() => {
    const fetchCategoriesAndFoods = async () => {
      try {
        // Fetch categories
  const categoryResponse = await axios.get(`${config.api_base_urls.admin}/api/categories`);
        const categoriesData = categoryResponse.data;
  
        // Fetch food items
  const foodResponse = await axios.get(`${config.api_base_urls.admin}/api/foods`);
        const foodsData = foodResponse.data;
  
        // Filter food items by canteen name
        const filteredFoods = foodsData.filter((food) => food.canteen === canteenName);
  
        // Create a map to store unique categories with food counts
        const categoryMap = {};
  
        // Calculate food count for each category
        filteredFoods.forEach((food) => {
          if (!categoryMap[food.category]) {
            categoryMap[food.category] = {
              id: categoriesData.find((category) => category.category === food.category)?._id || '',
              name: food.category,
              foodCount: 0,
            };
          }
          categoryMap[food.category].foodCount += 1;
        });
  
        // Convert the map to an array
        const aggregatedData = Object.values(categoryMap);
  
        setCategoriesWithFoodCount(aggregatedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    if (canteenName) {
      fetchCategoriesAndFoods();
    }
  }, [canteenName]);

  // Fetch orders and count by status for today
  useEffect(() => {
    const fetchOrderStatusCounts = async () => {
      try {
        if (!canteenName) return;
  const response = await axios.get(`${config.api_base_urls.user}/api/admin/orders?canteenName=${canteenName}`);
        const orders = Array.isArray(response.data) ? response.data : [];
        // Filter orders for today
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.orderedDate);
          return orderDate.toISOString().slice(0, 10) === todayStr;
        });
        // Count orders by status
        const counts = {};
        statusOptions.forEach(status => { counts[status] = 0; });
        todayOrders.forEach(order => {
          if (counts.hasOwnProperty(order.status)) {
            counts[order.status]++;
          }
        });
        setOrderStatusCounts(counts);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Set all to 0 if error
        const counts = {};
        statusOptions.forEach(status => { counts[status] = 0; });
        setOrderStatusCounts(counts);
      }
    };
    fetchOrderStatusCounts();
    const interval = setInterval(fetchOrderStatusCounts, 2000);
    return () => clearInterval(interval);
  }, [canteenName]);

  return (
    <div className="order-management">
      {/* Menu Box */}
      <div className="box">
        <h2>Menu</h2>
        <div className="category-list">
          {categoriesWithFoodCount.length > 0 ? (
            <div className="modern-table">
              <div className="table-header">
                <span>Category Name</span>
                <span># Items</span>
              </div>
              {categoriesWithFoodCount.map((category) => (
                <div key={category.id} className="table-row">
                  <span>{category.name}</span>
                  <span>{category.foodCount}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>No categories available</p>
          )}
        </div>
        <button
          className="more-button"
          onClick={() => navigate('/menu')}
        >
          More <span className="arrow">↗</span>
        </button>
      </div>

      {/* Orders Box */}
      <div className="box">
        <h2>Orders</h2>
        <div className="category-list">
          <div className="modern-table">
            <div className="table-header">
              <span>Order Status</span>
              <span># Items</span>
            </div>
            {statusOptions.map(status => (
              <div key={status} className="table-row">
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <span>{orderStatusCounts[status] || 0}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          className="more-button"
          onClick={() => navigate('/order')}
        >
          More <span className="arrow">↗</span>
        </button>
      </div>
    </div>
  );
};

export default OrderManagement;