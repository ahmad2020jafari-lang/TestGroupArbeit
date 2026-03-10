// <!-- I want to have this code for later on my Repo -->
// const socket = io();

// let room = null;
// let playerSymbol = "X";
// let opponentSymbol = "O";
// let isMyTurn = false;
// let board = Array(9).fill("");
// let gameActive = false;

// let username = localStorage.getItem("username");
// let profilePic = localStorage.getItem("profilePic");

// socket.emit("playerInfo", { username, profilePic });

// const cells = document.querySelectorAll(".cell");
// const statusText = document.getElementById("statusText");
// const p1Name = document.getElementById("player1Name");
// const p2Name = document.getElementById("player2Name");
// const p1Pic = document.getElementById("player1Pic");
// const p2Pic = document.getElementById("player2Pic");
// const p1ScoreEl = document.getElementById("player1Score");
// const p2ScoreEl = document.getElementById("player2Score");
// const restartBtn = document.getElementById("restartBtn");
// const historyList = document.getElementById("historyList");

// let playerMap = {};
// let playerScore = { X: 0, O: 0 };

// const winCombos = [
//     [0, 1, 2],
//     [3, 4, 5],
//     [6, 7, 8],
//     [0, 3, 6],
//     [1, 4, 7],
//     [2, 5, 8],
//     [0, 4, 8],
//     [2, 4, 6]
// ];

// // Socket listeners
// socket.on("waiting", () => {
//     statusText.textContent = "Waiting for opponent...";
// });

// socket.on("startGame", (data) => {
//     room = data.room;
//     board = Array(9).fill("");
//     gameActive = true;

//     // LEFT PLAYER
//     p1Name.textContent = data.leftPlayer.username;
//     p1Pic.src = data.leftPlayer.profilePic;

//     // RIGHT PLAYER
//     p2Name.textContent = data.rightPlayer.username;
//     p2Pic.src = data.rightPlayer.profilePic;

//     playerMap = { X: data.leftPlayer.username, O: data.rightPlayer.username };

//     if (socket.id === data.leftPlayer.id) {
//         playerSymbol = "X";
//         opponentSymbol = "O";
//     } else {
//         playerSymbol = "O";
//         opponentSymbol = "X";
//     }

//     isMyTurn = playerSymbol === "X";

//     cells.forEach(c => {
//         c.classList.remove("x", "o", "winner");
//     });

//     updateScores();
//     updateStatus();
// });

// socket.on("move", ({ index, player }) => {
//     board[index] = player;
//     cells[index].classList.add(player === "X" ? "x" : "o");

//     const winner = checkWinner();
//     if (winner) {
//         endGame(winner);
//         return;
//     }

//     isMyTurn = player !== playerSymbol;
//     updateStatus();
// });

// // socket.on("gameOver", ({ winner }) => {
// //     endGame(winner);
// // });

// socket.on("restart", () => {
//     board = Array(9).fill("");
//     cells.forEach(c => c.classList.remove("x", "o", "winner"));
//     gameActive = true;
//     isMyTurn = playerSymbol === "X";
//     updateStatus();
// });

// // Event listeners
// cells.forEach((cell, index) => {
//     cell.addEventListener("click", () => {
//         if (!gameActive || !isMyTurn || board[index] !== "") return;

//         socket.emit("move", { room, index, player: playerSymbol });
//     });
// });

// restartBtn.addEventListener("click", () => {
//     socket.emit("restart", { room });
// });

// // Functions
// function checkWinner() {
//     for (const [a, b, c] of winCombos) {
//         if (board[a] && board[a] === board[b] && board[a] === board[c]) {
//             cells[a].classList.add("winner");
//             cells[b].classList.add("winner");
//             cells[c].classList.add("winner");
//             return board[a];
//         }
//     }
//     return board.includes("") ? null : "draw";
// }

// function endGame(winner) {
//     gameActive = false;

//     if (winner === "draw") {
//         statusText.textContent = "Draw";
//         addHistory("Draw");
//         return;
//     }

//     playerScore[winner]++;
//     const winnerName = playerMap[winner] ||
//         (winner === "X" ? p1Name.textContent : p2Name.textContent) ||
//         "Unknown";

//     statusText.textContent = winnerName + " wins";
//     updateScores();
//     addHistory(winnerName + " won");
// }

// function updateStatus() {
//     if (!gameActive) return;
//     statusText.textContent = isMyTurn ? "Your turn" : "Opponent turn";
// }

// function updateScores() {
//     p1ScoreEl.textContent = playerScore["X"];
//     p2ScoreEl.textContent = playerScore["O"];
// }

// function addHistory(text) {
//     const li = document.createElement("li");
//     li.textContent = text;
//     historyList.prepend(li);
// }

//////////////////////////////////÷÷÷÷÷÷
//////////////////////////////////÷÷÷÷÷÷
//////////////////////////////////÷÷÷÷÷÷
// ---------------- LOGIN PAGE ----------------

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async e => {

        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        const res = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (data.success) {

            localStorage.setItem("username", data.username);
            localStorage.setItem("profilePic", data.profilePic);

            window.location.href = "/game.html";

        } else {

            alert(data.message);

        }

    });

}

// ---------------- GAME ----------------

const socket = typeof io !== "undefined" ? io() : null;

if (socket) {

    let room = null;
    let playerSymbol = "X";
    let opponentSymbol = "O";
    let isMyTurn = false;
    let board = Array(9).fill("");
    let gameActive = false;

    let username = localStorage.getItem("username");
    let profilePic = localStorage.getItem("profilePic");

    socket.emit("playerInfo", { username, profilePic });

    const cells = document.querySelectorAll(".cell");
    const statusText = document.getElementById("statusText");
    const p1Name = document.getElementById("player1Name");
    const p2Name = document.getElementById("player2Name");
    const p1Pic = document.getElementById("player1Pic");
    const p2Pic = document.getElementById("player2Pic");
    const p1ScoreEl = document.getElementById("player1Score");
    const p2ScoreEl = document.getElementById("player2Score");
    const restartBtn = document.getElementById("restartBtn");
    const historyList = document.getElementById("historyList");

    let playerMap = {};
    let playerScore = { X: 0, O: 0 };

    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    socket.on("waiting", () => {
        statusText.textContent = "Waiting for opponent...";
    });

    socket.on("startGame", (data) => {

        room = data.room;
        board = Array(9).fill("");
        gameActive = true;

        p1Name.textContent = data.leftPlayer.username;
        p1Pic.src = data.leftPlayer.profilePic;

        p2Name.textContent = data.rightPlayer.username;
        p2Pic.src = data.rightPlayer.profilePic;

        playerMap = { X: data.leftPlayer.username, O: data.rightPlayer.username };

        if (socket.id === data.leftPlayer.id) {
            playerSymbol = "X";
            opponentSymbol = "O";
        } else {
            playerSymbol = "O";
            opponentSymbol = "X";
        }

        isMyTurn = playerSymbol === "X";

        cells.forEach(c => c.classList.remove("x", "o", "winner"));

        updateScores();
        updateStatus();

    });

    socket.on("move", ({ index, player }) => {

        board[index] = player;

        cells[index].classList.add(player === "X" ? "x" : "o");

        const winner = checkWinner();

        if (winner) {
            endGame(winner);
            return;
        }

        isMyTurn = player !== playerSymbol;

        updateStatus();

    });

    socket.on("restart", () => {

        board = Array(9).fill("");

        cells.forEach(c => c.classList.remove("x", "o", "winner"));

        gameActive = true;

        isMyTurn = playerSymbol === "X";

        updateStatus();

    });

    cells.forEach((cell, index) => {

        cell.addEventListener("click", () => {

            if (!gameActive || !isMyTurn || board[index] !== "") return;

            socket.emit("move", { room, index, player: playerSymbol });

        });

    });

    restartBtn.addEventListener("click", () => {

        socket.emit("restart", { room });

    });

    function checkWinner() {

        for (const [a, b, c] of winCombos) {

            if (board[a] && board[a] === board[b] && board[a] === board[c]) {

                cells[a].classList.add("winner");
                cells[b].classList.add("winner");
                cells[c].classList.add("winner");

                return board[a];

            }

        }

        return board.includes("") ? null : "draw";

    }

    function endGame(winner) {

        gameActive = false;

        if (winner === "draw") {

            statusText.textContent = "Draw";

            addHistory("Draw");

            return;

        }

        playerScore[winner]++;

        const winnerName = playerMap[winner];

        statusText.textContent = winnerName + " wins";

        updateScores();

        addHistory(winnerName + " won");

    }

    function updateStatus() {

        if (!gameActive) return;

        statusText.textContent = isMyTurn ? "Your turn" : "Opponent turn";

    }

    function updateScores() {

        p1ScoreEl.textContent = playerScore["X"];
        p2ScoreEl.textContent = playerScore["O"];

    }

    function addHistory(text) {

        const li = document.createElement("li");

        li.textContent = text;

        historyList.prepend(li);

    }

}