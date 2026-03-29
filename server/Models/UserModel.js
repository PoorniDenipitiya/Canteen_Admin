const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    role: { type: String, required: true },
    canteenName: { type: String, required: function () { return this.role === "Canteen Owner"; } }, // Required only for Canteen Owners
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("adminusers", userSchema);
