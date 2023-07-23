const logic = require(__dirname + "/logic.js");

exports.createDeck = function () {
  let deck = [];

  for (let i = 1; i <= 13; i++) {
    for (let j = 1; j <= 4; j++) {
      // Create a card that is empty
      var card = {};

      // Fill in the value and letter for the card
      switch (i) {
        case 1:
          card.value = 11;
          card.letter = "A";
          break;
        case 11:
          card.value = 10;
          card.letter = "J";
          break;
        case 12:
          card.value = 10;
          card.letter = "Q";
          break;
        case 13:
          card.value = 10;
          card.letter = "K";
          break;
        default:
          card.value = i;
          card.letter = i;
          break;
      }

      // Fill in the suit for the card
      switch (j) {
        case 1:
          card.suit = "S";
          break;
        case 2:
          card.suit = "H";
          break;
        case 3:
          card.suit = "C";
          break;
        case 4:
          card.suit = "D";
          break;
        default:
          console.log("Error: Not within list of suits.");
          break;
      }

      // Join the letter and suit to create the card image url
      card.img = card.letter + card.suit + ".svg";
      deck.push(card);
    }
  }
  return deck;
};

exports.randomDrawOne = function (deck) {
  let randomNumber = Math.floor(Math.random() * deck.length);
  let chosenCard = deck.splice(randomNumber, 1);

  // chosenCard is an array containing the object, so you need to use chosenCard[0] if you just want the card.
  return chosenCard[0];
};

exports.countPoints = function (hand) {
  let points = 0;
  for (let i = 0; i < hand.length; i++) {
    points += hand[i].value;
  }

  // If points is above 21, check if you can change an Ace down to 1 point
  if (points > 21) {
    for (let i = 0; i < hand.length; i++) {
      if (hand[i].value === 11) {
        hand[i].value = 1;
        points -= 10;
        break;
      }
    }
  }

  console.log(hand);
  console.log("Total points: " + points);

  return points;
};

// Check for Naturals
exports.checkNatural = function (hand) {
  if (hand.length != 2) {
    return false;
  }

  let hasAce = false;
  let hasPicture = false;

  for (let i = 0; i < hand.length; i++) {
    switch (hand[i].letter) {
      case "A":
        hasAce = true;
        break;
      case "J":
        hasPicture = true;
        break;
      case "Q":
        hasPicture = true;
        break;
      case "K":
        hasPicture = true;
        break;
      case 10:
        hasPicture = true;
        break;
      default:
        break;
    }
  }

  if (hasAce && hasPicture) {
    return true;
  } else {
    return false;
  }
};

// Create Game Data for a new player
exports.createGameData = function () {
  let gameDataObject = {
    playerCards: [],
    playerPoints: 0,
    bankerCards: [],
    bankerPoints: 0,
    showBankerCards: false,
    deck: [],
    winner: "",
    wallet: 100,
    bet: 0,
    doubleDown: false,
    allowDoubleDown: false,
  };
  return gameDataObject;
};

exports.startGame = function (gameData) {
  // Clear last game's data (i.e. winner, player's hand and banker's hand)
  gameData.winner = "";
  gameData.doubleDown = false;
  gameData.allowDoubleDown = false;
  gameData.bankerCards = [];
  gameData.playerCards = [];

  // Open a new deck
  gameData.deck = logic.createDeck();

  // Draw two cards for the player
  gameData.playerCards.push(logic.randomDrawOne(gameData.deck));
  gameData.playerCards.push(logic.randomDrawOne(gameData.deck));
  gameData.playerPoints = logic.countPoints(gameData.playerCards);

  // Draw two cards for the banker
  gameData.bankerCards.push(logic.randomDrawOne(gameData.deck));
  gameData.bankerCards.push(logic.randomDrawOne(gameData.deck));
  gameData.bankerPoints = logic.countPoints(gameData.bankerCards);
  gameData.showBankerCards = false;

  return gameData;
};

exports.settleGame = function (gameData) {
  gameData.winner = "";
  gameData.showBankerCards = true;

  // Calculate points for player and banker
  gameData.playerPoints = logic.countPoints(gameData.playerCards);
  gameData.bankerPoints = logic.countPoints(gameData.bankerCards);

  // Scenario 1: Player busts. Game ends right away.
  if (gameData.playerPoints > 21) {
    // Game ends
    console.log("Player busts. Game over!");
    gameData.winner = "Banker";
    gameData.wallet -= Number(gameData.bet);
  } else if (
    // Scenario 2: Player has a Natural, but Banker doesn't.
    gameData.playerPoints === 21 &&
    logic.checkNatural(gameData.playerCards) &&
    !logic.checkNatural(gameData.bankerCards)
  ) {
    console.log("Player has a Natural");
    gameData.winner = "Player";
    gameData.wallet += Number(gameData.bet * 1.5);
  } else if (
    // Scenario 3: Banker has a Natural, but Player doesn't.
    gameData.bankerPoints === 21 &&
    !logic.checkNatural(gameData.playerCards) &&
    logic.checkNatural(gameData.bankerCards)
  ) {
    console.log("Banker has a Natural");
    gameData.winner = "Banker";
    gameData.wallet -= Number(gameData.bet);
  } else {
    // Dealer reveals his cards and deals more if he doesn't have 17.

    // Reveal banker's cards when player clicks on 'Stand'
    if (gameData.showBankerCards === true) {
      gameData.bankerPoints = logic.countPoints(gameData.bankerCards);

      // Banker draws another card if he doesn't have at least 17.
      while (gameData.bankerPoints < 17) {
        gameData.bankerCards.push(logic.randomDrawOne(gameData.deck));
        gameData.bankerPoints = logic.countPoints(gameData.bankerCards);
      }
    }

    //Scenario 4: Banker busts.
    if (gameData.bankerPoints > 21) {
      gameData.winner = "Player";
      gameData.wallet += Number(gameData.bet);
      // Scenario 5: Banker beats Player.
    } else if (gameData.bankerPoints > gameData.playerPoints) {
      gameData.winner = "Banker";
      gameData.wallet -= Number(gameData.bet);
      // Scenario 6: Player beats Banker.
    } else if (gameData.bankerPoints < gameData.playerPoints) {
      gameData.winner = "Player";
      gameData.wallet += Number(gameData.bet);
      // Scenario 7: Draws
    } else {
      gameData.winner = "None";
    }
  }

  return gameData;
};
