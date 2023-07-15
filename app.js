const express = require("express");
const ejs = require("ejs");
const app = express();
const logic = require(__dirname + "/logic.js");

app.set("view engine", "ejs");
app.use(express.static("images"));
app.use(express.static("public"));

let deck = logic.createDeck();

// Draw two cards for the player
let playerCards = [];
playerCards.push(logic.randomDrawOne(deck));
playerCards.push(logic.randomDrawOne(deck));
let playerPoints = 0;

// Draw two cards for the banker
let bankerCards = [];
bankerCards.push(logic.randomDrawOne(deck));
bankerCards.push(logic.randomDrawOne(deck));
let bankerPoints = 0;
let showBankerCards = false;

// Starts when player goes to page
app.get("/", function (req, res) {
  // Count player's points. Remove 'Hit' button if player is 21 points.
  playerPoints = logic.countPoints(playerCards);

  // Reveal banker's cards when player clicks on 'Stand'
  if (showBankerCards === true) {
    bankerPoints = logic.countPoints(bankerCards);
  }

  // Show two cards on screen.
  res.render("game", {
    playerCards: playerCards,
    playerPoints: playerPoints,
    bankerCards: bankerCards,
    bankerPoints: bankerPoints,
  });
});

app.post("/hit", function (req, res) {
  console.log("Player Hits!");
  playerPoints = logic.countPoints(playerCards);
  if (playerPoints < 21) {
    playerCards.push(logic.randomDrawOne(deck));
  }
  res.redirect("/");
});

app.post("/stand", function (req, res) {
  console.log("Player Stands!");
  showBankerCards = true;
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server is running on Port 3000.");
});
