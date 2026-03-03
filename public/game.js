const boardEl = document.getElementById("board");
const userScoreEl = document.getElementById("userScore");
const aiScoreEl = document.getElementById("aiScore");
const resultLog = document.getElementById("resultLog");
const aiPicEl = document.getElementById("aiPic");
const aiNameEl = document.getElementById("aiName");

let board = ["", "", "", "", "", "", "", "", ""];
let userScore = 0;
let aiScore = 0;
let gameOver = false;

const human = "X";
const ai = "O";

const aiAvatars = [
    "https://i.imgur.com/6VBx3io.png",
    "https://i.imgur.com/ZF6s192.png",
    "https://i.imgur.com/8Km9tLL.png",
    "https://i.imgur.com/0rVeh4J.png",
    "https://i.imgur.com/Xz9jMsk.png",
    "https://i.imgur.com/QVjO3Qo.png",
    "https://i.imgur.com/1F0WvTl.png",
    "https://i.imgur.com/FYf3PzS.png"
];

// Pick random AI avatar
const randomIndex = Math.floor(Math.random() * aiAvatars.length);
aiPicEl.src = aiAvatars[randomIndex];

// Fetch user info
fetch("/user-data")
    .then(res => res.json())
    .then(data => {
        document.getElementById("usernameDisplay").innerText = data.username;
        if (data.profilePic) document.getElementById("userPic").src = data.profilePic;
    });

// Render Board
function renderBoard() {
    boardEl.innerHTML = "";
    board.forEach((cell, i) => {
        const div = document.createElement("div");
        div.classList.add("cell");
        div.innerText = cell;
        div.onclick = () => handleMove(i);
        boardEl.appendChild(div);
    });
}

// Handle user move
function handleMove(i) {
    if (board[i] !== "" || gameOver) return;

    board[i] = human;
    renderBoard();

    if (checkWinner(human)) {
        userScore++;
        userScoreEl.innerText = userScore;
        logResult(document.getElementById("usernameDisplay").innerText + " Wins!");
        gameOver = true;
        return;
    }

    if (isTie()) {
        logResult("Tie Game!");
        gameOver = true;
        return;
    }

    setTimeout(aiMove, 1000);
}

// AI move with simple minimax
function aiMove() {
    if (gameOver) return;

    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = ai;
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    board[move] = ai;
    renderBoard();

    if (checkWinner(ai)) {
        aiScore++;
        aiScoreEl.innerText = aiScore;
        logResult("Alpha Charlie Wins!");
        gameOver = true;
        return;
    }

    if (isTie() && !gameOver) {
        logResult("Tie Game!");
        gameOver = true;
    }
}

function minimax(boardState, depth, isMaximizing) {
    if (checkWinner(ai)) return 10 - depth;
    if (checkWinner(human)) return depth - 10;
    if (isTie()) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === "") {
                boardState[i] = ai;
                let score = minimax(boardState, depth + 1, false);
                boardState[i] = "";
                best = Math.max(score, best);
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === "") {
                boardState[i] = human;
                let score = minimax(boardState, depth + 1, true);
                boardState[i] = "";
                best = Math.min(score, best);
            }
        }
        return best;
    }
}

function checkWinner(player) {
    const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    return wins.some(p => p.every(i => board[i] === player));
}

function isTie() {
    return board.every(cell => cell !== "");
}

function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    gameOver = false;
    renderBoard();
}

function logout() {
    window.location = "/logout";
}

function logResult(msg) {
    const p = document.createElement("p");
    p.innerText = msg;
    resultLog.appendChild(p);
    resultLog.scrollTop = resultLog.scrollHeight;
}

renderBoard();