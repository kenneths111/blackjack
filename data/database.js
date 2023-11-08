/* 
Database Structure for BlackJack. 
User: We will create a new user each time a player starts a game.
- id: unique identifier for Player
- session_id: session ID

Game: We will create a new game each time a player finishes a game (i.e. hits 'Game Over' or 'End Game')
- id: unique identifier for Game
- user_id: relates to the player
- high_score: highest wallet amount at any point in game
- final_score: wallet amount when player ends game

Banker: We will update this each time a player finishes a game (i.e. hits 'Game Over')
- id: unique identifier for Banker (i.e. '1')
- total_pot: total amount of money won by banker since beginning.
*/

// This is to allow for .env configurations
require("dotenv").config();

// Importing Postgres package
const { Client } = require("pg");

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    ca: process.env.DB_SSL_CERT,
  },
});

client.connect();

client.query("Select * from GAMES", (err, res) => {
  if (!err) {
    console.log(res.rows);
  } else {
    console.log(err.message);
  }
});

module.exports = client;
