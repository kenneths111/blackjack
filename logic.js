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
