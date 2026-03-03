const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

const app = express();

// ===== Upload Config =====
const storage = multer.diskStorage({
    destination: "public/uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// ===== Middleware =====
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false
}));

// ===== MongoDB =====
// Replace <USERNAME>, <PASSWORD>, <CLUSTER>, <DATABASE> with your Atlas info
mongoose.connect("mongodb+srv://PlanwerkMaster:PlanwerkCsBe@planwerkmaster.cncawku.mongodb.net/tictactoe?retryWrites=true&w=majority")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Error:", err));

// ===== User Model =====
const User = mongoose.model("User", {
    username: String,
    password: String,
    profilePic: String
});

// ===== Login Route (Auto-create user if not exists) =====
app.post("/login", upload.single("profilePic"), async (req, res) => {
    const { username, password } = req.body;

    let user = await User.findOne({ username });

    if (!user) {
        // Create new user if not exist
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({ username, password: hashedPassword });
    } else {
        // If user exists, check password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send("Wrong password");
    }

    // Save profile picture if uploaded
    if (req.file) {
        user.profilePic = "/uploads/" + req.file.filename;
        await user.save();
    }

    // Save session
    req.session.username = user.username;
    req.session.profilePic = user.profilePic;

    res.redirect("/game");
});

// ===== Game Page =====
app.get("/game", (req, res) => {
    if (!req.session.username) return res.redirect("/login.html");
    res.sendFile(path.join(__dirname, "public/game.html"));
});

// ===== Send User Data =====
app.get("/user-data", (req, res) => {
    res.json({
        username: req.session.username,
        profilePic: req.session.profilePic
    });
});

// ===== Logout =====
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login.html");
});

// ===== Default Redirect =====
app.get("/", (req, res) => {
    res.redirect("/login.html");
});

// ===== Start Server =====
app.listen(3000, () => console.log("Server running on http://localhost:3000"));