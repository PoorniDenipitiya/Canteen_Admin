import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../config/appConfig';
import './menu.css'; // Add styles for the table
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, FormControl, Select, MenuItem, InputLabel, Grid } from '@mui/material'; // Import Material-UI IconButton
import DeleteIcon from '@mui/icons-material/Delete'; // Import Material-UI Delete Icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Checkmark icon for "Yes"

const Menu = () => {
  const [canteenName, setCanteenName] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const [allFoodItems, setAllFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openDialog, setOpenDialog] = useState(false); // Add this line
  const [selectedFoodId, setSelectedFoodId] = useState(null); // Add this line

  // Fetch canteen name from localStorage
  useEffect(() => {
    const storedCanteenName = localStorage.getItem('canteenName') || '';
    setCanteenName(storedCanteenName);
  }, []);

  // Fetch food items relevant to the canteen
  useEffect(() => {
    const fetchFoodItems = async () => {
      try {
        const response = await axios.get(`${config.api_base_urls.admin}/api/foods`);
        const foodsData = response.data;

        // Filter food items by canteen name
        const filteredFoods = foodsData.filter((food) => food.canteen === canteenName);
        setAllFoodItems(filteredFoods);
        setFoodItems(filteredFoods);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(filteredFoods.map(food => food.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching food items:', error);
      }
    };

    if (canteenName) {
      fetchFoodItems();
    }
  }, [canteenName]);

  // Filter food items by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFoodItems(allFoodItems);
    } else {
      const filtered = allFoodItems.filter(food => food.category === selectedCategory);
      setFoodItems(filtered);
    }
  }, [selectedCategory, allFoodItems]);

  // Handle delete food item
  const handleDelete = async () => {
    try {
      if (!selectedFoodId) {
        console.error("No food ID selected for deletion");
        return;
      }
      console.log("Deleting food item with ID:", selectedFoodId); // Debug log
  const response = await axios.delete(`${config.api_base_urls.admin}/api/food/${selectedFoodId}`); // Ensure this matches the backend route
      if (response.status === 200) {
        setFoodItems((prevItems) => prevItems.filter((food) => food._id !== selectedFoodId));
        setOpenDialog(false);
        setSelectedFoodId(null);
      } else {
        console.error("Failed to delete food item:", response.data);
      }
    } catch (error) {
      console.error("Error deleting food item:", error);
    }
  };

  // Open confirmation dialog
  const handleOpenDialog = (foodId) => {
    setSelectedFoodId(foodId);
    setOpenDialog(true);
  };

  // Close confirmation dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFoodId(null);
  };

  return (
    <div className="menu-details">
      <h2>Food Items</h2>
      
      {/* Category Filter */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <table className="food-table">
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Food Item Name</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {foodItems.map((food) => (
            <tr key={food._id}>
              <td>{food.category}</td>
              <td>{food.food}</td>
              <td>Rs. {food.price}.00</td>
             { /*<td>
                <button className="delete-button" onClick={() => handleDelete(food._id)}>
                  Delete
                </button>
              </td> */}
              <td>
                <IconButton
                  aria-label="delete"
                  onClick={() => handleOpenDialog(food._id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

        {/* Confirmation Dialog */}
        <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Are you sure you want to delete this item?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone. Please confirm if you want to delete this food item.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="error" startIcon={<DeleteIcon />}>
            No
          </Button>
          <Button onClick={handleDelete} color="primary" startIcon={<CheckCircleIcon />} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
};

export default Menu;