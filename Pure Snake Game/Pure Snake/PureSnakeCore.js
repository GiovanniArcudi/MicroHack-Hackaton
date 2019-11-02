//Canvas stuff
var canvas = new Object();
canvas.element = document.getElementById('canvas');
canvas.context = canvas.element.getContext('2d');
canvas.width = canvas.element.getAttribute('width');
canvas.height = canvas.element.getAttribute('height');
canvas.cellWidth = 10;

//some useful variables about the playarea
var cw = 10; 				//width of the cells
var maxx = canvas.width/cw; //the maximum allowed position on the grid
var maxy = canvas.height/cw;//the maximum allowed position on the grid

//these variables represent the state of the game
var d;			//direction of the snake (right, left, up, down)
var food;		//the cell representing the current item of food, has a food.x and food.y position
var score;		//the players current score
var snakeArray; //an array of cells to make up the snake, each have an x and y position

var getTimeout;

//set it so the init function is called when the page is loaded
window.onload=init;

	function init(msgText)
	{
		getTimeout = (function() { // IIFE
		    var _setTimeout = setTimeout, // Reference to the original setTimeout
		        map = {}; // Map of all timeouts with their start date and delay

		    setTimeout = function(callback, delay) { // Modify setTimeout
		        var id = _setTimeout(callback, delay); // Run the original, and store the id

		        map[id] = [Date.now(), delay]; // Store the start date and delay

		        return id; // Return the id
		    };

		    return function(id) { // The actual getTimeLeft function
		        var m = map[id]; // Find the timeout in map

		        // If there was no timeout with that id, return NaN, otherwise, return the time left clamped to 0
		        return m ? Math.max(m[1] - Date.now() + m[0], 0) : NaN;
		    }
		})();

		d = "right"; //default direction

		createSnake(); //build and show the snake
		createFood(); 	//build and show the first food item
		
		//initialise the score
		score = 0;
		
		//Lets move the snake now using a timer which will trigger 
		//the paint function every 60ms
		if(typeof game_loop != "undefined") clearInterval(game_loop);
		game_loop = setInterval(paint, 120);
		pauseGame(msgText);
	}
	
	//Lets paint the snake now
	function paint()
	{
		//To avoid the snake trail we need to paint the background on every frame
		//Lets paint the canvas 
		canvas.context.fillStyle = "black";
		canvas.context.fillRect(0, 0, canvas.width, canvas.height);
		canvas.context.strokeStyle = "white";
		canvas.context.strokeRect(0, 0, canvas.width, canvas.height);
		
		//update the snakes position based on the current direction
		updateSnake(d);
		
		//Lets paint the snake	
		for(var i = 0; i < snakeArray.length; i++)
		{
			var c = snakeArray[i];
			//Lets paint 10px wide cells
			paintCell(c.x, c.y, "green");
		}
		
		//Lets paint the food
		paintCell(food.x, food.y, "red");
		
		//Lets paint the score
		var scoreText = "Score: " + score;
		canvas.context.fillText(scoreText, 5, canvas.height-5);
	}
	
	//a generic function to paint cells
	function paintCell(x, y, color)
	{
		canvas.context.fillStyle = color;
		canvas.context.fillRect(x*cw, y*cw, cw, cw);
		canvas.context.strokeStyle = "white";
		canvas.context.strokeRect(x*cw, y*cw, cw, cw);
	}

	

	
