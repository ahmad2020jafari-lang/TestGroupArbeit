// ** I want to keep this code in my Repo for later Time**

// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const session = require("express-session");
// const http = require("http");
// const { Server } = require("socket.io");
// const path = require("path");
// const multer = require("multer");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));

// app.use(session({
//     secret: "tictactoe_secret",
//     resave: false,
//     saveUninitialized: false
// }));

// // ---------------- MONGODB ----------------

// mongoose.connect("mongodb+srv://PlanwerkMaster:CsBeAhura@planwerkmaster.cncawku.mongodb.net/tictactoe?retryWrites=true&w=majority")
//     .then(() => console.log("MongoDB Connected"))
//     .catch(err => console.log("MongoDB Error:", err));

// const userSchema = new mongoose.Schema({
//     username: { type: String, unique: true },
//     email: { type: String, unique: true },
//     password: String,
//     profilePic: String
// });

// const User = mongoose.model("User", userSchema);

// // ---------------- FILE UPLOAD ----------------

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "public/uploads"),
//     filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
// });

// const upload = multer({ storage });

// // ---------------- SIGNUP ----------------

// app.post("/signup", upload.single("profilePic"), async (req, res) => {

//     const { username, email, password } = req.body;

//     const existing = await User.findOne({ $or: [{ username }, { email }] });

//     if (existing) return res.json({ success: false, message: "User exists" });

//     const hashed = await bcrypt.hash(password, 10);

//     const user = new User({
//         username,
//         email,
//         password: hashed,
//         profilePic: req.file ? "/uploads/" + req.file.filename : "/user-avatar.png"
//     });

//     await user.save();

//     res.json({ success: true });

// });

// // ---------------- LOGIN ----------------

// app.post("/login", async (req, res) => {

//     const { username, password } = req.body;

//     const user = await User.findOne({ username: new RegExp(`^${username}$`, "i") });

//     if (!user) return res.json({ success: false, message: "User not found" });

//     const match = await bcrypt.compare(password, user.password);

//     if (!match) return res.json({ success: false, message: "Wrong password" });

//     req.session.username = user.username;
//     req.session.profilePic = user.profilePic;

//     res.json({
//         success: true,
//         username: user.username,
//         profilePic: user.profilePic
//     });

// });

// // ---------------- PROTECT GAME PAGE ----------------

// app.get("/game.html", (req, res) => {
//     if (!req.session.username) return res.redirect("/login.html");
//     res.sendFile(path.join(__dirname, "public/game.html"));
// });

// app.get("/logout", (req, res) => {
//     req.session.destroy(() => res.redirect("/login.html"));
// });

// // ---------------- GAME VARIABLES ----------------

// let waitingPlayer = null;
// let waitingTimeout = null;

// let rooms = {};

// // ---------------- SOCKET.IO ----------------

// io.on("connection", (socket) => {

//     console.log("connected:", socket.id);

//     // receive player info
//     socket.on("playerInfo", (data) => {

//         socket.username = data.username;
//         socket.profilePic = data.profilePic;

//         console.log("Player:", socket.username);

//         // MATCHMAKING

//         if (waitingPlayer && waitingPlayer.id !== socket.id) {

//             // stop AI timer
//             if (waitingTimeout) {
//                 clearTimeout(waitingTimeout);
//                 waitingTimeout = null;
//             }

//             const room = waitingPlayer.id + "#" + socket.id;

//             socket.join(room);
//             waitingPlayer.join(room);

//             rooms[room] = {
//                 leftPlayer: waitingPlayer,
//                 rightPlayer: socket,
//                 board: Array(9).fill(null),
//                 turn: "X"
//             };

//             console.log("MATCH:", waitingPlayer.username, "vs", socket.username);

//             io.to(room).emit("startGame", {

//                 room,

//                 leftPlayer: {
//                     id: waitingPlayer.id,
//                     username: waitingPlayer.username,
//                     profilePic: waitingPlayer.profilePic,
//                     symbol: "X"
//                 },

//                 rightPlayer: {
//                     id: socket.id,
//                     username: socket.username,
//                     profilePic: socket.profilePic,
//                     symbol: "O"
//                 }

//             });

//             waitingPlayer = null;

//         } else {

//             // first player waiting

//             waitingPlayer = socket;

//             socket.emit("waiting");

//             waitingTimeout = setTimeout(() => {

//                 if (waitingPlayer === socket) {

//                     console.log("AI MATCH:", socket.username);

//                     const room = socket.id;

//                     socket.join(room);

//                     rooms[room] = {
//                         leftPlayer: socket,
//                         rightPlayer: "AI",
//                         board: Array(9).fill(null),
//                         turn: "X"
//                     };

//                     socket.emit("startGame", {

//                         room,

//                         leftPlayer: {
//                             id: socket.id,
//                             username: socket.username,
//                             profilePic: socket.profilePic,
//                             symbol: "X"
//                         },

//                         rightPlayer: {
//                             id: "AI",
//                             username: "AI",
//                             profilePic: "/ai-avatar.png",
//                             symbol: "O"
//                         }

//                     });

//                     waitingPlayer = null;

//                 }

//             }, 5000);

//         }

//     });

//     // ---------------- MOVE EVENT ----------------

//     socket.on("move", ({ room, index, player }) => {

//         const roomData = rooms[room];

//         if (!roomData) return;

//         if (roomData.board[index] !== null) return;

//         if (roomData.turn !== player) return;

//         roomData.board[index] = player;

//         roomData.turn = player === "X" ? "O" : "X";

//         io.to(room).emit("move", { index, player });

//         const winner = checkWinner(roomData.board);

//         if (winner) {

//             io.to(room).emit("gameOver", { winner });

//             return;

//         }

//         // AI move

//         if (roomData.rightPlayer === "AI" && player === "X") {

//             const aiIndex = smartAI(roomData.board);

//             roomData.board[aiIndex] = "O";

//             roomData.turn = "X";

//             setTimeout(() => {

//                 io.to(room).emit("move", { index: aiIndex, player: "O" });

//                 const w2 = checkWinner(roomData.board);

//                 if (w2) io.to(room).emit("gameOver", { winner: w2 });

//             }, 700);

//         }

//     });

//     // ---------------- RESTART ----------------

//     socket.on("restart", ({ room }) => {

//         const roomData = rooms[room];

//         if (!roomData) return;

//         roomData.board = Array(9).fill(null);
//         roomData.turn = "X";

//         io.to(room).emit("restart");

//     });

//     // ---------------- DISCONNECT ----------------

//     socket.on("disconnect", () => {

//         console.log("disconnect:", socket.id);

//         if (waitingPlayer === socket) {

//             waitingPlayer = null;

//             if (waitingTimeout) {
//                 clearTimeout(waitingTimeout);
//                 waitingTimeout = null;
//             }

//         }

//     });

// });

// // ---------------- GAME LOGIC ----------------

// function checkWinner(board) {

//     const combos = [

//         [0, 1, 2],
//         [3, 4, 5],
//         [6, 7, 8],

//         [0, 3, 6],
//         [1, 4, 7],
//         [2, 5, 8],

//         [0, 4, 8],
//         [2, 4, 6]

//     ];

//     for (const [a, b, c] of combos) {

//         if (board[a] && board[a] === board[b] && board[a] === board[c]) {

//             return board[a];

//         }

//     }

//     return board.includes(null) ? null : "draw";

// }

// // AI logic

// function smartAI(board) {

//     const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);

//     // win

//     for (const i of empty) {

//         board[i] = "O";

//         if (checkWinner(board) === "O") {
//             board[i] = null;
//             return i;
//         }

//         board[i] = null;

//     }

//     // block

//     for (const i of empty) {

//         board[i] = "X";

//         if (checkWinner(board) === "X") {
//             board[i] = null;
//             return i;
//         }

//         board[i] = null;

//     }

//     // random

//     return empty[Math.floor(Math.random() * empty.length)];

// }

// // ---------------- SERVER START ----------------

// const PORT = process.env.PORT || 3000;

// server.listen(PORT, () => console.log("Server running http://localhost:" + PORT));
/////////////////////
/////////////////////
/////////////////////
// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const session = require("express-session");
// const http = require("http");
// const { Server } = require("socket.io");
// const path = require("path");
// const multer = require("multer");
// const nodemailer = require("nodemailer");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));

// app.use(session({
//     secret: "tictactoe_secret",
//     resave: false,
//     saveUninitialized: false
// }));

// // ---------------- MONGODB ----------------

// mongoose.connect("mongodb+srv://PlanwerkMaster:CsBeAhura@planwerkmaster.cncawku.mongodb.net/tictactoe?retryWrites=true&w=majority")
//     .then(() => console.log("MongoDB Connected"))
//     .catch(err => console.log(err));

// const userSchema = new mongoose.Schema({
//     username: { type: String, unique: true },
//     email: { type: String, unique: true },
//     password: String,
//     profilePic: String
// });

// const User = mongoose.model("User", userSchema);

// // ---------------- EMAIL SYSTEM ----------------

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });
// transporter.verify(function (error, success) {
//     if (error) {
//         console.log(error);
//     } else {
//         console.log("Email server is ready");
//     }
// });
// function generateCode() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// }

// // ---------------- FILE UPLOAD ----------------

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "public/uploads"),
//     filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
// });

// const upload = multer({ storage });

// // ---------------- SIGNUP ----------------

// app.post("/signup", upload.single("profilePic"), async (req, res) => {

//     const { username, email } = req.body;

//     const existing = await User.findOne({
//         $or: [{ username }, { email }]
//     });

//     if (existing) {
//         return res.json({ success: false, message: "User exists" });
//     }

//     const code = generateCode();
//     const hashed = await bcrypt.hash(code, 10);

//     const user = new User({
//         username,
//         email,
//         password: hashed,
//         profilePic: req.file ? "/uploads/" + req.file.filename : "/user-avatar.png"
//     });

//     await user.save();

//     await transporter.sendMail({
//         from: process.env.EMAIL_USER,
//         to: email,
//         subject: "TicTacToe Login Code",
//         text: `Your TicTacToe password is: ${code}

// Use this 6 digit code together with your username to login.`
//     });

//     res.json({ success: true });
// });

// // ---------------- LOGIN ----------------

// app.post("/login", async (req, res) => {

//     const { username, password } = req.body;

//     const user = await User.findOne({
//         username: new RegExp(`^${username}$`, "i")
//     });

//     if (!user) {
//         return res.json({ success: false, message: "User not found" });
//     }

//     const match = await bcrypt.compare(password, user.password);

//     if (!match) {
//         return res.json({ success: false, message: "Wrong password" });
//     }

//     req.session.username = user.username;
//     req.session.profilePic = user.profilePic;

//     res.json({
//         success: true,
//         username: user.username,
//         profilePic: user.profilePic
//     });
// });
// // Login rout
// app.get("/", (req, res) => {
//     res.redirect("/login.html");
// });
// // ---------------- PROTECT GAME PAGE ----------------

// app.get("/game.html", (req, res) => {
//     if (!req.session.username) return res.redirect("/login.html");
//     res.sendFile(path.join(__dirname, "public/game.html"));
// });

// app.get("/logout", (req, res) => {
//     req.session.destroy(() => res.redirect("/login.html"));
// });

// // ---------------- GAME VARIABLES ----------------

// let waitingPlayer = null;
// let waitingTimeout = null;
// let rooms = {};

// // ---------------- SOCKET ----------------

// io.on("connection", (socket) => {

//     socket.on("playerInfo", (data) => {

//         socket.username = data.username;
//         socket.profilePic = data.profilePic;

//         if (waitingPlayer && waitingPlayer.id !== socket.id) {

//             if (waitingTimeout) {
//                 clearTimeout(waitingTimeout);
//                 waitingTimeout = null;
//             }

//             const room = waitingPlayer.id + "#" + socket.id;

//             socket.join(room);
//             waitingPlayer.join(room);

//             rooms[room] = {
//                 leftPlayer: waitingPlayer,
//                 rightPlayer: socket,
//                 board: Array(9).fill(null),
//                 turn: "X"
//             };

//             io.to(room).emit("startGame", {

//                 room,

//                 leftPlayer: {
//                     id: waitingPlayer.id,
//                     username: waitingPlayer.username,
//                     profilePic: waitingPlayer.profilePic,
//                     symbol: "X"
//                 },

//                 rightPlayer: {
//                     id: socket.id,
//                     username: socket.username,
//                     profilePic: socket.profilePic,
//                     symbol: "O"
//                 }

//             });

//             waitingPlayer = null;

//         } else {

//             waitingPlayer = socket;
//             socket.emit("waiting");

//             waitingTimeout = setTimeout(() => {

//                 if (waitingPlayer === socket) {

//                     const room = socket.id;

//                     socket.join(room);

//                     rooms[room] = {
//                         leftPlayer: socket,
//                         rightPlayer: "AI",
//                         board: Array(9).fill(null),
//                         turn: "X"
//                     };

//                     socket.emit("startGame", {

//                         room,

//                         leftPlayer: {
//                             id: socket.id,
//                             username: socket.username,
//                             profilePic: socket.profilePic,
//                             symbol: "X"
//                         },

//                         rightPlayer: {
//                             id: "AI",
//                             username: "AI",
//                             profilePic: "/ai-avatar.png",
//                             symbol: "O"
//                         }

//                     });

//                     waitingPlayer = null;

//                 }

//             }, 5000);

//         }

//     });

//     // MOVE

//     socket.on("move", ({ room, index, player }) => {

//         const roomData = rooms[room];
//         if (!roomData) return;

//         if (roomData.board[index] !== null) return;
//         if (roomData.turn !== player) return;

//         roomData.board[index] = player;
//         roomData.turn = player === "X" ? "O" : "X";

//         io.to(room).emit("move", { index, player });

//         const winner = checkWinner(roomData.board);

//         if (winner) {
//             io.to(room).emit("gameOver", { winner });
//             return;
//         }

//         if (roomData.rightPlayer === "AI" && player === "X") {

//             const aiIndex = smartAI(roomData.board);

//             roomData.board[aiIndex] = "O";
//             roomData.turn = "X";

//             setTimeout(() => {

//                 io.to(room).emit("move", { index: aiIndex, player: "O" });

//                 const w2 = checkWinner(roomData.board);

//                 if (w2) io.to(room).emit("gameOver", { winner: w2 });

//             }, 700);

//         }

//     });

//     // RESTART

//     socket.on("restart", ({ room }) => {

//         const roomData = rooms[room];
//         if (!roomData) return;

//         roomData.board = Array(9).fill(null);
//         roomData.turn = "X";

//         io.to(room).emit("restart");

//     });

// });

// // ---------------- GAME LOGIC ----------------

// function checkWinner(board) {

//     const combos = [
//         [0, 1, 2], [3, 4, 5], [6, 7, 8],
//         [0, 3, 6], [1, 4, 7], [2, 5, 8],
//         [0, 4, 8], [2, 4, 6]
//     ];

//     for (const [a, b, c] of combos) {
//         if (board[a] && board[a] === board[b] && board[a] === board[c]) {
//             return board[a];
//         }
//     }

//     return board.includes(null) ? null : "draw";
// }

// function smartAI(board) {

//     const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);

//     for (const i of empty) {
//         board[i] = "O";
//         if (checkWinner(board) === "O") { board[i] = null; return i; }
//         board[i] = null;
//     }

//     for (const i of empty) {
//         board[i] = "X";
//         if (checkWinner(board) === "X") { board[i] = null; return i; }
//         board[i] = null;
//     }

//     return empty[Math.floor(Math.random() * empty.length)];
// }

// const PORT = process.env.PORT || 3000;

// server.listen(PORT, () => console.log("Server running http://localhost:" + PORT));
/////////////////////////
/////////////////////////
/////////////////////////
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// FIX 1: Correct Cloudinary configuration with debugging
console.log("🔍 Checking Cloudinary environment variables:");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Found" : "❌ Missing");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Found" : "❌ Missing");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Found" : "❌ Missing");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder (your structure stays the same!)
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "tictactoe_secret",
    resave: false,
    saveUninitialized: false
}));

// ---------------- MONGODB ----------------

mongoose.connect("mongodb+srv://PlanwerkMaster:CsBeAhura@planwerkmaster.cncawku.mongodb.net/tictactoe?retryWrites=true&w=majority")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Error:", err));

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: String,
    profilePic: String
});

const User = mongoose.model("User", userSchema);

// ---------------- EMAIL SYSTEM ----------------

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ Email server error:", error);
    } else {
        console.log("✅ Email server is ready");
    }
});

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------- FILE UPLOAD (CLOUDINARY) ----------------

// FIX 2: Proper Cloudinary storage configuration with upload preset
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'tictactoe-profile-pics',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 200, height: 200, crop: 'limit' }],
            upload_preset: 'ml_default',  // CRITICAL: Add your upload preset
            public_id: Date.now() + '-' + Math.round(Math.random() * 1E9) // Unique filename
        };
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ---------------- DEBUG ROUTES (Remove after fixing) ----------------

// FIX 3: Debug route to check Cloudinary config
app.get("/debug/cloudinary", (req, res) => {
    res.json({
        cloudinaryConfigured: {
            cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
            api_key: !!process.env.CLOUDINARY_API_KEY,
            api_secret: !!process.env.CLOUDINARY_API_SECRET
        },
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'not set',
        uploadPreset: 'ml_default (configured in code)',
        folder: 'tictactoe-profile-pics'
    });
});

// FIX 4: Debug route to check user profile pics
app.get("/debug/user/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.send("User not found");
        }

        const isCloudinaryUrl = user.profilePic && user.profilePic.startsWith('http');

        res.send(`
            <h1>Debug Info for ${user.username}</h1>
            <p><strong>ProfilePic in Database:</strong> ${user.profilePic}</p>
            <p><strong>Type:</strong> ${isCloudinaryUrl ? '✅ Cloudinary URL' : '❌ Local Path'}</p>
            ${!isCloudinaryUrl && user.profilePic !== '/user-avatar.png' ?
                `<p style="color:red">⚠️ This is a local path! Upload again with Cloudinary.</p>` :
                ''}
            <p><strong>Test Image:</strong></p>
            <img src="${user.profilePic}" style="max-width:200px; border:1px solid #ccc;" 
                 onerror="this.onerror=null; this.src=''; this.alt='Image failed to load'">
            <p><a href="${user.profilePic}" target="_blank">Direct link to image</a></p>
            <hr>
            <p><a href="/debug/fix-user/${user.username}">Fix this user (set to default avatar)</a></p>
        `);
    } catch (error) {
        res.send("Error: " + error.message);
    }
});

// FIX 5: Debug route to fix a specific user
app.get("/debug/fix-user/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.send("User not found");
        }

        user.profilePic = "/user-avatar.png";
        await user.save();

        res.send(`✅ User ${user.username} fixed - now using default avatar`);
    } catch (error) {
        res.send("Error: " + error.message);
    }
});

// FIX 6: Debug route to fix all users with local paths
app.get("/debug/fix-all-users", async (req, res) => {
    try {
        const users = await User.find({
            profilePic: { $regex: '^/uploads/' }
        });

        let fixed = 0;
        for (const user of users) {
            user.profilePic = "/user-avatar.png";
            await user.save();
            fixed++;
        }

        res.send(`✅ Fixed ${fixed} users - set them to default avatar`);
    } catch (error) {
        res.send("Error: " + error.message);
    }
});

// ---------------- SIGNUP ----------------

// FIX 7: Complete signup route with Cloudinary
app.post("/signup", upload.single("profilePic"), async (req, res) => {
    try {
        console.log("========== SIGNUP DEBUG ==========");
        console.log("1. Signup request received for:", req.body.username);
        console.log("2. File received?", req.file ? "YES" : "NO");

        if (req.file) {
            console.log("3. File details:", {
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype
            });
        }

        const { username, email } = req.body;

        // Check if user exists
        const existing = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existing) {
            console.log("4. User already exists");
            return res.json({ success: false, message: "User exists" });
        }

        const code = generateCode();
        const hashed = await bcrypt.hash(code, 10);

        // FIX 8: Get Cloudinary URL or use default
        let profilePicUrl = "/user-avatar.png"; // Default from your public folder

        if (req.file) {
            // This is a Cloudinary URL
            profilePicUrl = req.file.path;
            console.log("5. ✅ Cloudinary upload successful!");
            console.log("   URL:", profilePicUrl);
            console.log("   This should start with: https://res.cloudinary.com/...");
        } else {
            console.log("5. ℹ️ No profile picture uploaded, using default avatar");
        }

        const user = new User({
            username,
            email,
            password: hashed,
            profilePic: profilePicUrl
        });

        await user.save();
        console.log("6. ✅ User saved to database with profilePic:", profilePicUrl);

        // Send email with password
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "TicTacToe Login Code",
            text: `Your TicTacToe password is: ${code}\n\nUse this 6 digit code together with your username to login.`
        });

        console.log("7. ✅ Email sent to:", email);
        console.log("========== SIGNUP COMPLETE ==========");

        res.json({
            success: true,
            message: "User created successfully"
        });
    } catch (error) {
        console.error("❌ SIGNUP ERROR:", error);
        console.error("Error details:", error.message);
        res.json({ success: false, message: "Server error: " + error.message });
    }
});

// ---------------- LOGIN ----------------

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({
            username: new RegExp(`^${username}$`, "i")
        });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.json({ success: false, message: "Wrong password" });
        }

        req.session.username = user.username;
        req.session.profilePic = user.profilePic;

        console.log(`✅ User ${username} logged in with profilePic:`, user.profilePic);

        res.json({
            success: true,
            username: user.username,
            profilePic: user.profilePic
        });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.json({ success: false, message: "Server error" });
    }
});

// ---------------- ROUTES ----------------

app.get("/", (req, res) => {
    res.redirect("/login.html");
});

app.get("/game.html", (req, res) => {
    if (!req.session.username) return res.redirect("/login.html");
    res.sendFile(path.join(__dirname, "public/game.html"));
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/login.html"));
});

// ---------------- GAME VARIABLES ----------------

let waitingPlayer = null;
let waitingTimeout = null;
let rooms = {};

// ---------------- SOCKET ----------------

io.on("connection", (socket) => {

    socket.on("playerInfo", (data) => {

        socket.username = data.username;
        socket.profilePic = data.profilePic;

        if (waitingPlayer && waitingPlayer.id !== socket.id) {

            if (waitingTimeout) {
                clearTimeout(waitingTimeout);
                waitingTimeout = null;
            }

            const room = waitingPlayer.id + "#" + socket.id;

            socket.join(room);
            waitingPlayer.join(room);

            rooms[room] = {
                leftPlayer: waitingPlayer,
                rightPlayer: socket,
                board: Array(9).fill(null),
                turn: "X"
            };

            io.to(room).emit("startGame", {
                room,
                leftPlayer: {
                    id: waitingPlayer.id,
                    username: waitingPlayer.username,
                    profilePic: waitingPlayer.profilePic,
                    symbol: "X"
                },
                rightPlayer: {
                    id: socket.id,
                    username: socket.username,
                    profilePic: socket.profilePic,
                    symbol: "O"
                }
            });

            waitingPlayer = null;

        } else {

            waitingPlayer = socket;
            socket.emit("waiting");

            waitingTimeout = setTimeout(() => {

                if (waitingPlayer === socket) {

                    const room = socket.id;

                    socket.join(room);

                    rooms[room] = {
                        leftPlayer: socket,
                        rightPlayer: "AI",
                        board: Array(9).fill(null),
                        turn: "X"
                    };

                    socket.emit("startGame", {
                        room,
                        leftPlayer: {
                            id: socket.id,
                            username: socket.username,
                            profilePic: socket.profilePic,
                            symbol: "X"
                        },
                        rightPlayer: {
                            id: "AI",
                            username: "AI",
                            profilePic: "/ai-avatar.png",
                            symbol: "O"
                        }
                    });

                    waitingPlayer = null;
                }
            }, 5000);
        }
    });

    socket.on("move", ({ room, index, player }) => {
        const roomData = rooms[room];
        if (!roomData) return;

        if (roomData.board[index] !== null) return;
        if (roomData.turn !== player) return;

        roomData.board[index] = player;
        roomData.turn = player === "X" ? "O" : "X";

        io.to(room).emit("move", { index, player });

        const winner = checkWinner(roomData.board);

        if (winner) {
            io.to(room).emit("gameOver", { winner });
            return;
        }

        if (roomData.rightPlayer === "AI" && player === "X") {
            const aiIndex = smartAI(roomData.board);

            roomData.board[aiIndex] = "O";
            roomData.turn = "X";

            setTimeout(() => {
                io.to(room).emit("move", { index: aiIndex, player: "O" });
                const w2 = checkWinner(roomData.board);
                if (w2) io.to(room).emit("gameOver", { winner: w2 });
            }, 700);
        }
    });

    socket.on("restart", ({ room }) => {
        const roomData = rooms[room];
        if (!roomData) return;

        roomData.board = Array(9).fill(null);
        roomData.turn = "X";

        io.to(room).emit("restart");
    });
});

// ---------------- GAME LOGIC ----------------

function checkWinner(board) {
    const combos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of combos) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return board.includes(null) ? null : "draw";
}

function smartAI(board) {
    const empty = board.map((v, i) => v === null ? i : null).filter(v => v !== null);

    for (const i of empty) {
        board[i] = "O";
        if (checkWinner(board) === "O") { board[i] = null; return i; }
        board[i] = null;
    }

    for (const i of empty) {
        board[i] = "X";
        if (checkWinner(board) === "X") { board[i] = null; return i; }
        board[i] = null;
    }

    return empty[Math.floor(Math.random() * empty.length)];
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("✅ Server running on port " + PORT));