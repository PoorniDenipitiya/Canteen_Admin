/*const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoute = require("./Routes/AuthRoute");
const { MONGO_URL, PORT } = process.env;

mongoose.set('strictQuery', true);

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB is  connected successfully"))
  .catch((err) => console.error(err));



app.use(
  cors({
    origin: ["http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());

app.use("/", authRoute);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
*/



const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const cors = require('cors');
const authRoutes = require('./Routes/authRoutes');
const categoryRoutes = require("./Routes/categoryRoutes");
const foodRoutes = require("./Routes/foodRoutes");
require('dotenv').config();
const Category = require('./Models/CategoryModel');
const Food = require('./Models/FoodModel');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
}));

app.use('/api', authRoutes);

app.use(bodyParser.json());
app.use("/api/category", categoryRoutes);
app.use("/api/food", foodRoutes);

// Your existing routes and middleware
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/api/foods', async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  //useNewUrlParser: true,
  //useUnifiedTopology: true
}).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Database connection error:', error);
});