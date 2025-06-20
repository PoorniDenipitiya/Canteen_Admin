import React, { useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import axios from 'axios';
import './index.css'; // Add styles for the modern tabular format


const OrderManagement = () => {
  const navigate = useNavigate();
  const [categoriesWithFoodCount, setCategoriesWithFoodCount] = useState([]);
  const [canteenName, setCanteenName] = useState('');

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
        const categoryResponse = await axios.get('http://localhost:5000/api/categories');
        const categoriesData = categoryResponse.data;
  
        // Fetch food items
        const foodResponse = await axios.get('http://localhost:5000/api/foods');
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