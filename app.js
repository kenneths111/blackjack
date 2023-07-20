const express = require("express");
const ejs = require("ejs");
const morgan = require("morgan");
const { checkNatural } = require("./logic");
const bodyParser = require("body-parser");
const app = express();
const logic = require(__dirname + "/logic.js");

app.set("view engine", "ejs");
app.use(express.static("images"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// Define key game variables;

let playerCards;
let playerPoints;
let bankerCards;
let bankerPoints;
let showBankerCards;
let deck;
let winner = "";
let wallet = 100;
let bet = 0;

// Define Start Game function. I need to refactor this later to push this function to logic.js

const startGame = function () {
  // Shuffle deck
  deck = logic.createDeck();

  // Draw two cards for the player
  playerCards = [];
  playerCards.push(logic.randomDrawOne(deck));
  playerCards.push(logic.randomDrawOne(deck));
  playerPoints = logic.countPoints(playerCards);

  // Draw two cards for the banker
  bankerCards = [];
  bankerCards.push(logic.randomDrawOne(deck));
  bankerCards.push(logic.randomDrawOne(deck));
  bankerPoints = logic.countPoints(bankerCards);
  showBankerCards = false;

  // Clear winner value
  winner = "";
};

// Define Settle Game function. I need to refactor this to move it into logic.js.

const settleGame = function () {
  winner = "";
  showBankerCards = true;

  // Scenario 1: Player busts. Game ends right away.
  if (playerPoints > 21) {
    // Game ends
    console.log("Player busts. Game over!");
    winner = "Banker";
    wallet -= Number(bet);
  } else if (
    // Scenario 2: Player has a Natural, but Banker doesn't.
    playerPoints === 21 &&
    checkNatural(playerCards) &&
    !checkNatural(bankerCards)
  ) {
    console.log("Player has a Natural");
    winner = "Player";
    wallet += Number(bet * 1.5);
  } else {
    // Dealer reveals his cards and deals more if he doesn't have 17.

    // Reveal banker's cards when player clicks on 'Stand'
    if (showBankerCards === true) {
      bankerPoints = logic.countPoints(bankerCards);

      // Banker draws another card if he doesn't have at least 17.
      while (bankerPoints < 17) {
        bankerCards.push(logic.randomDrawOne(deck));
        bankerPoints = logic.countPoints(bankerCards);
      }
    }

    //Scenario 3: Banker busts.
    if (bankerPoints > 21) {
      winner = "Player";
      wallet += Number(bet);
      // Scenario 4: Banker beats Player.
    } else if (bankerPoints > playerPoints) {
      winner = "Banker";
      wallet -= Number(bet);
      // Scenario 5: Player beats Banker.
    } else if (bankerPoints < playerPoints) {
      winner = "Player";
      wallet += Number(bet);
      // Scenario 6: Draws
    } else {
      winner = "None";
    }
  }

  return winner;
};

startGame();

// Starts when player goes to page. Player has to choose bet amount.
app.get("/", function (req, res) {
  res.render("home");
});

// Starts when player goes to page
app.post("/game", function (req, res) {
  // Start game when the player cicks on 'Start Game' from home page
  startGame();

  // Update bet based on user inputs
  bet = req.body.bet;
  console.log(bet);

  // Reset the wallet each time someone starts a game from homepage
  // This is to prevent users from going to an unfinished game
  wallet = 100;
  console.log(wallet);

  res.redirect("/game");
});

// Starts when player goes to page
app.get("/game", function (req, res) {
  // If the user navigates to "/game" without setting betting amount, we will direct user to home page.
  if (bet === 0) {
    res.render("home");
  } else {
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
      bet: bet,
      wallet: wallet,
    });
  }
});

app.post("/hit", function (req, res) {
  console.log("Player Hits!");
  playerPoints = logic.countPoints(playerCards);
  if (playerPoints < 21) {
    playerCards.push(logic.randomDrawOne(deck));
  }
  res.redirect("/game");
});

app.post("/stay", function (req, res) {
  console.log("Player Stays!");
  settleGame();
  res.redirect("/game");
});

app.post("/nextgame", function (req, res) {
  bet = Number(req.body.bet);
  startGame();
  winner = "";
  res.redirect("/game");
});

app.post("/gameover", function (req, res) {
  startGame();

  // Reset all the game variables.
  winner = "";
  wallet = 100;
  bet = 0;

  res.redirect("/");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on Port 3000.");
});
