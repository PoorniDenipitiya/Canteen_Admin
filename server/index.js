const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config/loadConfig");
const authRoutes = require("./Routes/AuthRoutes");
const categoryRoutes = require("./Routes/CategoryRoutes");
const foodRoutes = require("./Routes/FoodRoutes");
const orderRoutes = require("./Routes/OrderRoutes");
const { startOrderStatusScheduler } = require("./util/orderStatusScheduler");
require("dotenv").config();
const Category = require("./Models/CategoryModel");
const Food = require("./Models/FoodModel");
const { PORT } = process.env;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: config.frontend.urls,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use("/api", authRoutes);

app.use(bodyParser.json());
app.use("/api/category", categoryRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/admin/orders", orderRoutes);
const notificationRoutes = require("./Routes/NotificationRoutes");
const complaintRoutes = require("./Routes/ComplaintRoutes");
app.use(
  "/api/notifications",
  (req, res, next) => {
    console.log("Received request to /api/notifications");
    next();
  },
  notificationRoutes
);
app.use("/api/complaints", complaintRoutes);

app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/foods", async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    startOrderStatusScheduler();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });
