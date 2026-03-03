const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    profilePic: String
});

module.exports = mongoose.model("User", userSchema);