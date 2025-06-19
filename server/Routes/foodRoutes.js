const express = require("express");
const router = express.Router();
const { registerFood } = require("../Controllers/FoodController");
const multer = require("multer");
const Food = require("../Models/FoodModel");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/register", upload.single("image"), registerFood);


// Fetch all food items
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();
    res.status(200).json(foods);
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a food item by ID
router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Delete request received for ID:", id); // Debug log
      const deletedFood = await Food.findByIdAndDelete(id);
      if (!deletedFood) {
        return res.status(404).json({ error: "Food item not found" });
      }
      res.status(200).json({ message: "Food item deleted successfully" });
    } catch (error) {
      console.error("Error deleting food item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

module.exports = router;