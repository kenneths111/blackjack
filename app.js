const express = require("express");
const ejs = require("ejs");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const logic = require(__dirname + "/logic.js");
const session = require("express-session");
const db = require(__dirname + "/data/database.js");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "Key that will sign my cookie",
    resave: false,
    saveUninitialized: false,
  })
);

// Morgan middleware is used to log the HTTP requests and time taken.
app.use(morgan("tiny"));

// Define key game variables.
let sessionArray = [];
let gameData = [];

// Starts when player goes to page. Player has to choose bet amount.
app.get("/", function (req, res) {
  console.log("Going to home page.");

  // Add a new key-value pair in the session object called 'isAuth' and whose value is true. By modifying the session object, express-session package will keep the session.id constant. This allows me to identify the same user.
  req.session.isAuth = true;

  if (!sessionArray.includes(req.session.id)) {
    // Save the session ID in an array, so I can find it later on.
    sessionArray.push(req.session.id);
    gameData.push(logic.createGameData());
    console.log("User doesn't exist. Will create game data for user.");
    console.log(req.session);
    console.log(req.session.id);

    // Record the position on the gameData array, so that you won't need to do a search each time you want to retrieve the gameData row.
    req.session.gameDataPosition = gameData.length - 1;
  } else {
    console.log(
      "User exists in our session array. Will not create new game data."
    );
    console.log(req.session);
    console.log(req.session.id);
  }

  console.log(gameData[req.session.gameDataPosition].wallet);

  // If Player has less than $100 in their wallet, render 'Home' page
  if (gameData[req.session.gameDataPosition].wallet <= 100) {
    // Render the home page for the user.
    res.render("home");
  } else {
    // If Player has more than $100 in their wallet, bring them back to existing game
    res.redirect("game");
  }
});

// Starts when player goes to page
app.post("/game", function (req, res) {
  // If the user clicks on 'Start Game' button without an existing user session, redirect user to home page.
  if (gameData[req.session.gameDataPosition] === undefined) {
    res.redirect("/");
  } else {
    // Start game when the player clicks on 'Start Game' from home page
    gameData[req.session.gameDataPosition] = logic.startGame(
      gameData[req.session.gameDataPosition]
    );

    // Reset the wallet each time someone starts a game from homepage.
    gameData[req.session.gameDataPosition].bet.wallet = 100;

    // Update bet based on user inputs
    gameData[req.session.gameDataPosition].bet = req.body.bet;
    res.redirect("/game");
  }
});

// Starts when player goes to page
app.get("/game", function (req, res) {
  // If the user navigates to "/game" without having an existing user session, redirect user to home page.
  if (gameData[req.session.gameDataPosition] === undefined) {
    res.redirect("/");
  }
  // If the user navigates to "/game" without setting betting amount, redirect user to home page.
  else if (gameData[req.session.gameDataPosition].bet === 0) {
    res.redirect("/");
  } else {
    // Count player's points. Remove 'Hit' button if player is 21 points.
    gameData[req.session.gameDataPosition].playerPoints = logic.countPoints(
      gameData[req.session.gameDataPosition].playerCards
    );

    // If Player has 9, 10 or 11 AND only two cards on hand, show an additional 'Double Down' button
    if (gameData[req.session.gameDataPosition].playerCards.length === 2) {
      switch (gameData[req.session.gameDataPosition].playerPoints) {
        case 9:
        case 10:
        case 11:
          gameData[req.session.gameDataPosition].allowDoubleDown = true;
          break;
      }
    }

    // Show two cards on screen.
    res.render("game", {
      playerCards: gameData[req.session.gameDataPosition].playerCards,
      playerPoints: gameData[req.session.gameDataPosition].playerPoints,
      bankerCards: gameData[req.session.gameDataPosition].bankerCards,
      bankerPoints: gameData[req.session.gameDataPosition].bankerPoints,
      showBankerCards: gameData[req.session.gameDataPosition].showBankerCards,
      winner: gameData[req.session.gameDataPosition].winner,
      bet: gameData[req.session.gameDataPosition].bet,
      wallet: gameData[req.session.gameDataPosition].wallet,
      doubleDown: gameData[req.session.gameDataPosition].doubleDown,
      allowDoubleDown: gameData[req.session.gameDataPosition].allowDoubleDown,
    });
  }
});

app.post("/hit", function (req, res) {
  // If the user clicks on 'Hit' button without an existing user session, redirect user to home page.
  if (gameData[req.session.gameDataPosition] === undefined) {
    res.redirect("/");
  }

  console.log("Player Hits!");
  gameData[req.session.gameDataPosition].playerPoints = logic.countPoints(
    gameData[req.session.gameDataPosition].playerCards
  );
  if (gameData[req.session.gameDataPosition].playerPoints < 21) {
    gameData[req.session.gameDataPosition].playerCards.push(
      logic.randomDrawOne(gameData[req.session.gameDataPosition].deck)
    );
  }
  res.redirect("/game");
});

app.post("/stay", function (req, res) {
  // If the user clicks on 'Stay' button without an existing user session, redirect user to home page.
  if (gameData[req.session.gameDataPosition] === undefined) {
    res.redirect("/");
  }
  console.log("Player Stays!");
  gameData[req.session.gameDataPosition] = logic.settleGame(
    gameData[req.session.gameDataPosition]
  );

  // Write game data to the database if wallet is less than $1.
  if (
    gameData[req.session.gameDataPosition].wallet < 1 &&
    gameData[req.session.gameDataPosition].highScore > 100
  ) {
    db.query({
      text: "INSERT INTO games(high_score, final_score) VALUES($1, $2)",
      values: [
        gameData[req.session.gameDataPosition].highScore,
        gameData[req.session.gameDataPosition].wallet,
      ],
    });
    console.log(
      "Added Game Session. High score: " +
        gameData[req.session.gameDataPosition].highScore
    );
  }

  res.redirect("/game");
});

app.post("/double", function (req, res) {
  // If the user clicks on 'Double' button without an existing user session, redirect user to home page.
  if (gameData[req.session.gameDataPosition] === undefined) {
    res.redirect("/");
  }
  console.log("Player Double Down!");

  // Double bet
  gameData[req.session.gameDataPosition].bet *= 2;
  gameData[req.session.gameDataPosition].doubleDown = true;
  console.log(gameData[req.session.gameDataPosition].doubleDown);

  // Draw one card
  gameData[req.session.gameDataPosition].playerCards.push(
    logic.randomDrawOne(gameData[req.session.gameDataPosition].deck)
  );

  // Settle game
  gameData[req.session.gameDataPosition] = logic.settleGame(
    gameData[req.session.gameDataPosition]
  );

  res.redirect("/game");
});

app.post("/nextgame", function (req, res) {
  // If the user clicks on 'Next Game' button without an existing user session, redirect user to home page.
  if (gameData[req.session.gameDataPosition] === undefined) {
    res.redirect("/");
  }
  gameData[req.session.gameDataPosition].bet = Number(req.body.bet);
  gameData[req.session.gameDataPosition] = logic.startGame(
    gameData[req.session.gameDataPosition]
  );

  res.redirect("/game");
});

app.post("/gameover", function (req, res) {
  // If the user clicks on 'Game Over' button without an existing user session, redirect user to home page.
  if (gameData[req.session.gameDataPosition] === undefined) {
    res.redirect("/");
  }

  gameData[req.session.gameDataPosition] = logic.startGame(
    gameData[req.session.gameDataPosition]
  );

  // Reset all the game variables.
  gameData[req.session.gameDataPosition].winner = "";
  gameData[req.session.gameDataPosition].wallet = 100;
  gameData[req.session.gameDataPosition].bet = 0;
  gameData[req.session.gameDataPosition].highScore = 100;

  res.redirect("/");
});

app.get("/highscore", function (req, res) {
  let scoreList;

  db.query("SELECT high_score, name from GAMES")
    .then((queryResult) => {
      if (queryResult.rows) {
        scoreList = queryResult.rows;
        scoreList.sort((a, b) => b.high_score - a.high_score);
      }

      res.render("highscore", { scoreList: scoreList });
    })
    .catch((error) => {
      console.error("Error fetching high scores:", error);
      res.status(500).send("Error fetching high scores");
    });
});

app.get("/highscore-retro", function (req, res) {
  res.render("highscore-retro");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on Port 3000.");
});
