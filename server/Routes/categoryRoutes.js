const express = require("express");
const router = express.Router();
const { registerCategory } = require("../Controllers/CategoryController");
const multer = require("multer");
const Category = require("../Models/CategoryModel");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/register", upload.single("image"), registerCategory);

// Fetch all categories
router.get("/", async (req, res) => {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

module.exports = router;