const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");
//const jwt = require('jsonwebtoken');

module.exports.Signup = async (req, res, next) => {
  try {
    const { firstname, lastname, role, canteenName, email, username, password, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Validate canteenName for Canteen Owners
    if (role === "Canteen Owner" && !canteenName) {
      return res.status(400).json({ message: "Canteen Name is required for Canteen Owners" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({ firstname, lastname, role, email, username, password: hashedPassword, canteenName: role === "Canteen Owner" ? canteenName : undefined, // Only include canteenName for Canteen Owners 
    createdAt });

    // Generate a token
    const token = createSecretToken(user._id);

    // Set the token as a cookie
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    // Respond with success
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required', success: false });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password', success: false });
    }

    // Verify the username
    if (user.username !== username) {
      return res.status(401).json({ message: 'Incorrect username', success: false });
    }

    // Verify the password
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(401).json({ message: 'Incorrect email or password', success: false });
    }

    // Generate a token
    const token = createSecretToken(user._id);

    // Set the token as a cookie
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    // Respond with success and user role
    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      role: user.role, // Include the user's role
      username: user.username, // Include the user's username
      canteenName: user.role === 'Canteen Owner' ? user.canteenName : '', // Include canteenName if role is "Canteen Owner"
    });

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
};