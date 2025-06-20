import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './menu.css'; // Add styles for the table
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material'; // Import Material-UI IconButton
import DeleteIcon from '@mui/icons-material/Delete'; // Import Material-UI Delete Icon
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Checkmark icon for "Yes"

const Menu = () => {
  const [canteenName, setCanteenName] = useState('');
  const [foodItems, setFoodItems] = useState([]);
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
        const response = await axios.get('http://localhost:5000/api/foods');
        const foodsData = response.data;

        // Filter food items by canteen name
        const filteredFoods = foodsData.filter((food) => food.canteen === canteenName);
        setFoodItems(filteredFoods);
      } catch (error) {
        console.error('Error fetching food items:', error);
      }
    };

    if (canteenName) {
      fetchFoodItems();
    }
  }, [canteenName]);

  // Handle delete food item
  const handleDelete = async () => {
    try {
      if (!selectedFoodId) {
        console.error("No food ID selected for deletion");
        return;
      }
      console.log("Deleting food item with ID:", selectedFoodId); // Debug log
      const response = await axios.delete(`http://localhost:5000/api/food/${selectedFoodId}`); // Ensure this matches the backend route
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