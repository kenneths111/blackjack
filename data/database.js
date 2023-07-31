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

// require("dotenv").config();
// const { Pool } = require("pg");

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// });

// // Test the connection
// pool.query("SELECT NOW()", (err, res) => {
//   if (err) {
//     // Log the detailed error message and other relevant information
//     console.error("Error connecting to the database:");
//     console.error("Host:", process.env.DB_HOST);
//     console.error("Port:", process.env.DB_PORT);
//     console.error("User:", process.env.DB_USER);
//     console.error("Database:", process.env.DB_DATABASE);
//     console.error("Error message:", err.message);
//     console.error("Stack trace:", err.stack);
//     // If you are using pg-promise, you can log the query being executed:
//     // console.error('Query:', err.query);
//   } else {
//     console.log("Connected to the database at:", process.env.DB_HOST);
//   }
// });

require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const caCertPath = path.join(__dirname, "..", "certs", "global-bundle.pem");
const caCert = fs.readFileSync(caCertPath);

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    ca: caCert,
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
