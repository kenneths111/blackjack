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