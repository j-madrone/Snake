$(document).ready(function() {
  var cellSize;
  var cellSizeScale = .008; //Percentage width of the screen size
  var cellsX = 80;
  var cellsY = 50;
  var gameX;
  var gameY;
  var food;
  var gameSpeed = 60; //Lower numbers are faster, in milliseconds for game loop time
  var initialDirection = 3; //Up
  var initialSnakeLength = 5;
  var players;
  var player1 = {
    snake: [],
    score: 0,
    direction: 3,
    keyStrokes: [],
    playerNumber: 1,
    xStart: cellsX / 2 + 1,
    gamesWon: 0,
    keyMap: {
      '39': 1,
      '37': 2,
      '38': 3,
      '40': 4
    },
    reverseKeyMap: {
      '39': 2,
      '37': 1,
      '38': 4,
      '40': 3
    }
  },
  player2 = {
    snake: [],
    score: 0,
    direction: 3,
    keyStrokes: [],
    playerNumber: 2,
    xStart: cellsX / 2 - 1,
    gamesWon: 0,
    keyMap: {
      '68': 1,
      '65': 2,
      '87': 3,
      '83': 4
    },
    reverseKeyMap: {
      '68': 2,
      '65': 1,
      '87': 4,
      '83': 3
    }
  };

  //Initialize the game board
  function drawGameBoard() {
    //Scale the cell size to a percentage of the body's width
    cellSize = Math.round($('body').width() * cellSizeScale);

    //Set the game board size based on cell size
    gameX = cellSize * cellsX;
    gameY = gameX * cellsY / cellsX;
    $('.game-board').css('height', gameY + 'px').css('width', gameX + 'px');
    $('.game-wrapper').css('height', gameY + 2 * cellSize + 'px').css('width', gameX + 2 * cellSize + 'px');
    
    //Scale the font size as a function of cell size
    $('html').css('font-size', cellSize + 'px');
  }
  
  drawGameBoard();

  //Start the game as paused
  togglePauseGame();

  //Redraw the game board when the window resizes
  $(window).resize(drawGameBoard);

  //Start a new game for a given number of players (1 or 2)
  function startNewGame(numberOfPlayers) {
    players = numberOfPlayers;
    //Clear the snake if it already exists on the board from a game-over
    $('.snake-body').remove();

    //Clear the old score values
    $('.score').text('');
    
    //Remove any food objects and draw the initial food object
    $('.game-board').find('.food').remove();
    generateFood();
    drawCell(food.x, food.y, 'food');

    //Set initial values for each player
    player1.direction = initialDirection;
    initializeSnake(player1);
    player1.score = 0;
    player1.keyStrokes = [];
    
    if (players == 2) {
      player2.direction = initialDirection;
      initializeSnake(player2);
      player2.score = 0;
      player2.keyStrokes = [];
    }
    
    //If there is a current game loop running, clear it
    if (typeof gameLoop != "undefined") {
      clearInterval(gameLoop);
    }

    //Start a new game loop for the given game speed
    gameLoop = setInterval(
      function() {
        if (players == 2) {
          drawSnakes(player1, player2);
        } else {
          drawSnakes(player1);
        }
      },
      gameSpeed
    );
  }
  
  //Start a 1 player game
  $('.1-player').on('click', function() {
    //Unpause
    togglePauseGame();
    $('.games-won').text('');
    player1.gamesWon = 0;
    player2.gamesWon = 0;
    startNewGame(1);
  });

  //Start a 2 player game
  $('.2-player').on('click', function() {
    //Unpause
    togglePauseGame();
    $('.games-won').text('');
    player1.gamesWon = 0;
    player2.gamesWon = 0;
    startNewGame(2);
  });

  //Draw a snake starting in the middle/bottom of the play area of initial snake length
  function initializeSnake(player) {
    player.snake = [];
    for (var i = initialSnakeLength - 1; i >= 0; i--) {
      var yDistance = cellsY - i;
      if (i == initialSnakeLength - 1) {
        //Add the head piece
        player.snake.push({x: player.xStart, y: yDistance, bodyPart: 'head', d: initialDirection});
      } else if (i == 0) {
        //Add the tail piece
        player.snake.push({x: player.xStart, y: yDistance, bodyPart: 'tail', d: initialDirection});
      } else {
        //Add the body pieces
        player.snake.push({x: player.xStart, y: yDistance, bodyPart: 'body', d: initialDirection});
      }
    }
  }
  

  //Randomly draw a food cell on the game board
  function generateFood() {
    food = {
      x: Math.round(Math.random() * (cellsX - 1)), 
      y: Math.round(Math.random() * (cellsY - 1)), 
    };
  }

  function drawSnake(player) {
    //Get the current state of the snake's head
    var headX = player.snake[0].x;
    var headY = player.snake[0].y;
    var headBodyPart = player.snake[0].bodyPart;
    var headD = player.direction;

    //Move the head 1 cell forward in the direction the player's snake is going
    switch (headD) {
      case 1: //right
        headX++;
        break;
      case 2: //left
        headX--;
        break;
      case 3: //up
        headY--;
        break;
      case 4: //down
        headY++;
        break;
      default:
        break;
    }

    //Game over criteria
    //If the snake hits the walls, or another snake
    if (headX == -1
        || headX == cellsX
        || headY == -1
        || headY == cellsY
        || checkCollision(headX, headY, player.snake)
        || (player.playerNumber == 1 && checkCollision(headX, headY, player2.snake))
        || (player.playerNumber == 2 && checkCollision(headX, headY, player1.snake))) {
      if (players == 2) {
        var gamesWonText = 'Games Won: ';
        if (player.playerNumber == 1) {
          player2.gamesWon += 1;
          gamesWonText += player2.gamesWon;
          $('#player-2-games-won').text(gamesWonText);
        } else if (player.playerNumber == 2) {
          player1.gamesWon += 1;
          gamesWonText += player1.gamesWon;
          $('#player-1-games-won').text(gamesWonText);
        }
      }
      
      //Start a new game with the current amount of players
      startNewGame(players);
      return;
    }

    //If the snake runs into the food cell, add a new piece to the front of the snake
    //Else move the snake forward 1 space
    if ((headX == food.x && headY == food.y) || checkCollision(food.x, food.y, player.snake)) {
      var newHead = {x: headX, y: headY, bodyPart: headBodyPart, d: headD};
      //Increase the score
      player.score++;

      //Make a new food cell
      generateFood();
      
      //Clear the old food cell
      $('.game-board').find('.food').remove();

      //Draw the new food cell
      drawCell(food.x, food.y, 'food');
    } else {
      //Create a new snake piece equal to the snake's old tail piece
      var newHead = player.snake.pop();

      //Set the new piece to the snake's old head piece
      newHead.x = headX;
      newHead.y = headY;
      newHead.bodyPart = headBodyPart;
      newHead.d = headD;
    }

    //Set the head to be a body part
    player.snake[0].bodyPart = 'body';

    //Set the last piece of the snake to be the new tail
    player.snake[player.snake.length - 1].bodyPart = 'tail';

    //Move the tail piece to the head to make the snake move forward
    player.snake.unshift(newHead); 

    //Clear the snake from the board to redraw it
    $('.game-board').find('.snake-body.player-' + player.playerNumber).remove();

    //Put each new piece of the snake onto the board
    for (var i = 0; i < player.snake.length; i++) {
      var snakeBody = player.snake[i];
      drawCell(snakeBody.x, snakeBody.y, 'snake-body player-' + player.playerNumber, snakeBody.bodyPart, snakeBody.d, player.playerNumber);
    }
    
    //Update the score
    var scoreText = 'Player ' + player.playerNumber + ': ' + player.score;
    $('.score.player-' + player.playerNumber).text(scoreText);
  }

  //Draw the snake(s)
  function drawSnakes(p1, p2) {
    //Only draw if game is unpaused
    if (!$('.game-board').hasClass('paused')) {
      //If there are new keystrokes in the player's key cache, set the next direction to be the next keystroke
      if (p1.keyStrokes.length) {
        p1.direction = p1.keyStrokes.shift();
      }
      if (p2 && p2.keyStrokes.length) {
        p2.direction = p2.keyStrokes.shift();
      }

      //Draw the first player
      drawSnake(p1);
      //If a second player is available, draw it
      if (p2) {
        drawSnake(p2);
      }
    }
  }

  //Draw the snake body or food based on coordinates, type, direction, and player number (to control the color of the snake)
  function drawCell(x, y, classType, bodyType, direction, playerNumber) {
    $('<div class=\'' + classType + '\'/>')
      .height(cellSize + 'px')
      .width(cellSize + 'px')
      .css('left', x * cellSize + 'px')
      .css('top', y * cellSize + 'px')
      .css('background', ((classType == 'snake-body player-1' || classType == 'snake-body player-2') ? 'url(images/' + bodyType + '_' + direction + '_' + playerNumber + '.png)' : 'url(images/apple.gif)'))
      .css('background-repeat', 'no-repeat')
      .appendTo('.game-board');
  }
  
  //Determine if the given coordinates are in a given array
  //Used to determine if the snake hits itself or another snake, or a snake hits food
  function checkCollision(x, y, array) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].x == x && array[i].y == y)
       return true;
    }
    return false;
  }

  //Add a key the a player's key cache
  function assignKeyStroke(player, key) {
    //If available, assign the player's current key to be the next one in the cache
    //Else use the player's current direction
    var currentKeyStroke = player.keyStrokes.length ? player.keyStrokes[player.keyStrokes.length - 1] : player.direction;
    
    //If the current player key is not the reverse direction
    if (currentKeyStroke != player.reverseKeyMap[key]) {
      //Add the key to the player's key cache
      player.keyStrokes.push(player.keyMap[key]);
    }
  }

  //Pause or Unpause the game
  function togglePauseGame() {
    $('.overlay').toggle();
    $('.modal').toggle();
    $('.game-board').toggleClass('paused');
  }

  //Event listener for the keyboard controls
  $(document).on('keydown', function(event){
    event.preventDefault();
    //Supports cross-browser compatibility key determination
    var key = (event.keyCode ? event.keyCode : event.which);

    //Pause or unpause the game if the 'P' key is hit
    if (key == 80) {
      togglePauseGame();
    }

    //Only accept keyboard input for the Snakes if the game is unpaused
    if (!$('.game-board').hasClass('paused')) {
      //If the player has the key available to them as a control
      if (player1.keyMap[key]) {
        assignKeyStroke(player1, key);
      } else if (player2.keyMap[key]) {
        assignKeyStroke(player2, key);
      }
    }
  });
});
