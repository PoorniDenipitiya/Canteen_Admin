const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");

module.exports.Signup = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      role,
      canteenName,
      email,
      username,
      password,
      createdAt,
    } = req.body;

    if (!firstname || !lastname || !role || !email || !username || !password) {
      return res.status(400).json({
        message: "All required fields must be provided",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        message: "Username already taken",
        success: false,
      });
    }

    if (role === "Canteen Owner" && !canteenName) {
      return res.status(400).json({
        message: "Canteen Name is required for Canteen Owners",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      role,
      email,
      username,
      password: hashedPassword,
      canteenName: role === "Canteen Owner" ? canteenName : undefined,
      createdAt,
    });

    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user });
    next();
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password", success: false });
    }

    if (user.username !== username) {
      return res
        .status(401)
        .json({ message: "Incorrect username", success: false });
    }

    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res
        .status(401)
        .json({ message: "Incorrect email or password", success: false });
    }

    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      role: user.role,
      username: user.username,
      canteenName: user.role === "Canteen Owner" ? user.canteenName : "",
    });

    next();
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};
