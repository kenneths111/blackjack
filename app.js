const express = require("express");
const ejs = require("ejs");
const { checkNatural } = require("./logic");
const app = express();
const logic = require(__dirname + "/logic.js");

app.set("view engine", "ejs");
app.use(express.static("images"));
app.use(express.static("public"));

// Define key game variables;

let playerCards;
let playerPoints;
let bankerCards;
let bankerPoints;
let showBankerCards;
let deck;
let winner = "";

// Define Start Game function. I need to refactor this later to push this function to logic.js

const startGame = function () {
  // Shuffle deck
  deck = logic.createDeck();

  // Draw two cards for the player
  playerCards = [];
  playerCards.push(logic.randomDrawOne(deck));
  playerCards.push(logic.randomDrawOne(deck));
  playerPoints = logic.countPoints(playerCards);
  console.log(logic.checkNatural(playerCards));

  // Draw two cards for the banker
  bankerCards = [];
  bankerCards.push(logic.randomDrawOne(deck));
  bankerCards.push(logic.randomDrawOne(deck));
  bankerPoints = logic.countPoints(bankerCards);
  showBankerCards = false;
  console.log(logic.checkNatural(bankerCards));
};

// Define Settle Game function. I need to refactor this to move it into logic.js.

const settleGame = function () {
  winner = "";

  // If the Player bust, then the game is over right away. Dealer doesn't need to draw.
  if (playerPoints > 21) {
    // Game ends
    console.log("Player busts. Game over!");
    winner = "Banker";
  } else if (
    // If the Player has a Natural, but the Banker doesn't, the game is over right away too.
    playerPoints === 21 &&
    checkNatural(playerCards) &&
    !checkNatural(bankerCards)
  ) {
    console.log("Player has a Natural");
    winner = "Player";
  } else {
    // Dealer reveals his cards and deals more if he doesn't have 17.
    showBankerCards = true;

    // Reveal banker's cards when player clicks on 'Stand'
    if (showBankerCards === true) {
      bankerPoints = logic.countPoints(bankerCards);

      // Banker draws another card if he doesn't have at least 17.
      while (bankerPoints < 17) {
        bankerCards.push(logic.randomDrawOne(deck));
        bankerPoints = logic.countPoints(bankerCards);
      }
    }

    if (bankerPoints > playerPoints) {
      winner = "Banker";
    } else if (bankerPoints < playerPoints) {
      winner = "Player";
    } else {
      winner = "None";
    }
  }

  return winner;
};

// Start game
startGame();

// Starts when player goes to page
app.get("/", function (req, res) {
  // Count player's points. Remove 'Hit' button if player is 21 points.
  playerPoints = logic.countPoints(playerCards);

  // Show two cards on screen.
  res.render("game", {
    playerCards: playerCards,
    playerPoints: playerPoints,
    bankerCards: bankerCards,
    bankerPoints: bankerPoints,
    showBankerCards: showBankerCards,
    winner: winner,
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

app.post("/stay", function (req, res) {
  console.log("Player Stays!");
  settleGame();
  res.redirect("/");
});

app.post("/nextgame", function (req, res) {
  startGame();
  winner = "";
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on Port 3000.");
});
