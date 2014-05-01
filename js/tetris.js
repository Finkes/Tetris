var game = function()
{
	this.blocks = [];
	this.grid = [];

	//colors for the blocks
	this.colors = new Array("red","green","yellow","purple","blue","white","pink","brown","gold");

	//tetrimino structures with rotations
	this.blocks[0] =[[[0,0,0,0],
		  	   	 [0,7,7,0],
		  	     [0,7,7,0],
		  	     [0,0,0,0]]];

	this.blocks[1] =[[[0,0,0,0],
					 [8,8,8,8],
					 [0,0,0,0],
					 [0,0,0,0]],

					 [[0,0,8,0],
					 [0,0,8,0],
					 [0,0,8,0],
					 [0,0,8,0]]];

	this.blocks[2] =[[[0,0,0],
					  [1,1,1],
					  [0,1,0]],

					 [[0,1,0],
					  [1,1,0],
					  [0,1,0]],

					 [[0,0,0],
					  [0,1,0],
					  [1,1,1]],

					 [[0,1,0],
					  [0,1,1],
					  [0,1,0]]];

	this.blocks[3] =[[[0,0,0],
					  [2,2,2],
					  [2,0,0]],

					 [[2,2,0],
					  [0,2,0],
					  [0,2,0]],

					 [[0,0,0],
					  [0,0,2],
					  [2,2,2]],

					 [[0,2,0],
					  [0,2,0],
					  [0,2,2]]];

	this.blocks[4] =[[[0,0,0],
					  [3,3,3],
					  [0,0,3]],

					 [[0,3,3],
					  [0,3,0],
					  [0,3,0]],

					 [[0,0,0],
					  [3,0,0],
					  [3,3,3]],

					 [[0,3,0],
					  [0,3,0],
					  [3,3,0]]];

	this.blocks[5] =[[[0,0,0],
					  [0,4,4],
					  [4,4,0]],

					 [[4,0,0],
					  [4,4,0],
					  [0,4,0]]];

	this.blocks[6] =[[[0,0,0],
					  [6,6,0],
					  [0,6,6]],

					 [[0,0,6],
					  [0,6,6],
					  [0,6,0]]];



	this.canvas = document.getElementById('game_canvas');
	this.context = this.canvas.getContext('2d');
	this.block_size = 20;
	this.grid_width = 10;
	this.grid_height = 22;

	this.game_offset_x = 10;
	this.game_offset_y = 10;

	this.next_block_offset_x = 230;
	this.next_block_offset_y = 10;

	this.elapsed_seconds = 0;
	this.elapsed_minutes = 0;

	this.timeout = 1000;

	
	this.update = function()
	{
		if(this.gamestate == "running")
		{
			var date = new Date();
			this.elapsed_seconds += (date.getTime() - this.lasttime)/1000.0;

			if(this.elapsed_seconds >= 60)
			{
				this.elapsed_seconds -= 60;
				this.elapsed_minutes++;
			}

			this.lasttime = date.getTime();
		}
			
	}

	this.setup = function()
	{
		this.gamestate = "running";
		this.score = 0;

		var date = new Date();

		this.lasttime = date.getTime();

		this.current_block = { "type": this.blocks[1], "x":0,"y":0, "rotation": 1 };
		this.next_block = {"type": this.blocks[parseInt(Math.random()*(this.blocks.length))], "x":0,"y":0,"rotation" :0 } ;

		for(var y=0;y<this.grid_height; y++)
		{
			this.grid[y] = new Array(this.grid_width);
		}

		for(var y =0;y<this.grid.length;y++)
			for(var x =0;x < this.grid[y].length;x++)
			{
				this.grid[y][x] = 0;
			}	
	}

	this.run = function()
	{
		this.setup();
			
		this.set_interval_routine();

		var that = this;

		document.onkeydown = function(event) 
		{
			that.onkeydown(event);
		}

		this.animate();
	}

	this.change_interval = function(interval)
	{
		clearInterval(this.timer);

		var that = this;
		this.timer = setInterval(function()
		{
			that.fall();
		},interval);
	}

	this.set_interval_routine = function()
	{
		var that = this;

		if(this.timer != null)
		{
			clearInterval(this.timer);
		}

		this.timer = setInterval(function()
		{
			that.fall();
		},that.timeout);
	}

	this.restart = function()
	{
		clearInterval(this.timer);
		this.setup();

		var that =  this;

		var that = this;
		this.timer = setInterval(function()
		{
			that.fall();
		},that.timeout);
	}

	this.next = function()
	{
		this.current_block.x = 2;
		this.current_block.y = 0;
		this.current_block.rotation = 0;
		this.current_block.type = this.next_block.type;
		this.next_block.type = this.blocks[parseInt(Math.random()*(this.blocks.length))];
	}

	this.fall = function()
	{
		if(this.collides_grid(this.current_block.type[this.current_block.rotation],this.current_block.x,this.current_block.y+1))
			{
				if(this.current_block.y == 0)
				{
					//game over
					this.gameover();

					clearInterval(this.timer);
				}
				else
				{
					this.current_tetrimino_to_grid();

					this.next();
				}	
			}
			else
				this.current_block.y ++;
	}

	this.gameover = function()
	{
		console.log("[GAME INFO] gameover");

		//this.restart();
		alert("game over - reload page for restart");
	}

	this.collides_grid  = function(block,ox,oy)
	{
		for(var y=0;y < block.length;y++)
			for(var x=0;x<block[y].length;x++)
			{
				if(block[y][x] != 0 && (ox+x < 0 || ox+x > this.grid_width 
												|| oy+y >= this.grid_height))
				{
					return true;
				}
				else if(block[y][x] != 0 && this.grid[y+oy][x+ox] != 0)
					return true;
				
			}
		return false;
	}

	this.current_tetrimino_to_grid = function()
	{
		var block = this.current_block.type[this.current_block.rotation];
		var ox = this.current_block.x;
		var oy = this.current_block.y;

		for(var y=0;y< block.length;y++)
			for(var x=0;x<block[y].length;x++)
			{
				if(block[y][x] != 0)
					this.grid[oy+y][ox+x] = block[y][x];
			}

		this.check_delete_rows();
	}

	this.check_delete_rows = function()
	{
		var num_deleted_rows = 0;

		for(var i= this.grid_height-1;i>0;i--)
		{
			var complete = true;
			for(var x=0;x<this.grid_width;x++)
			{
				if(this.grid[i][x] == 0)
					complete = false;
			}

			if(complete)
			{
				num_deleted_rows++;
				this.remove_line(i);
				i++;
			}	
		}

		this.score += num_deleted_rows;
	}

	this.onkeydown = function(event)
	{
		if(this.gamestate != "running")
			return;
		

		if(event.keyCode == 37)
		{
			if(!this.collides_grid(this.current_block.type[this.current_block.rotation],this.current_block.x-1,this.current_block.y))
				this.current_block.x --;
		}
		if(event.keyCode == 39)
		{
			if(!this.collides_grid(this.current_block.type[this.current_block.rotation],this.current_block.x+1,this.current_block.y))
				this.current_block.x ++;
		}  
		if(event.keyCode == 40)
		{
			this.fall();
		}
		if(event.keyCode == 81)
		{
			this.rotate_tetrimino_left();

			if(this.collides_grid(this.current_block.type[this.current_block.rotation],this.current_block.x,this.current_block.y))
			{
				this.rotate_tetrimino_right();
			}
		}
	}

	this.add_lines = function(count)
	{
		//TODO check game over

		//move lines
		for(var i=0;i<this.grid_height-count;i++)
		{
			for(var x =0;x < this.grid_width;x++)
			{
				this.grid[i][x] = this.grid[i+count][x];
			}
		}

		//add new lines
		for(var i= this.grid_height-1;i > this.grid_height-1-count;i--)
		{
			for(var x =0;x < this.grid_width;x++)
			{
				this.grid[i][x] = 1;
			}

			for(var x =0;x < this.grid_width;x+=3)
			{
				this.grid[i][x] = 0;
			}
		}

	}

	this.remove_line = function(row)
	{
		for(var x =0;x < this.grid_width;x++)
			{
				this.grid[row][x] = 0;
			}

		for(var i= row;i > 1;i--)
		{
			for(var x =0;x < this.grid_width;x++)
			{
				this.grid[i][x] = this.grid[i-1][x];
			}
		}
	}




	this.rotate_tetrimino_right = function()
	{
		if(this.current_block.rotation < this.current_block.type.length-1)
			this.current_block.rotation++;
		else
			this.current_block.rotation = 0;
	}

	this.rotate_tetrimino_left = function()
	{
		if(this.current_block.rotation > 0)
			this.current_block.rotation--;
		else
			this.current_block.rotation = this.current_block.type.length-1;
	}



	this.clear_screen = function()
	{
		this.canvas.width = this.canvas.width;

		//this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}

	this.render = function()
	{
		this.render_background();

		this.render_grid();
		//render_block(0,0);

		this.render_tetrimino(this.current_block,this.game_offset_x,this.game_offset_y);
		this.render_tetrimino(this.next_block,this.next_block_offset_x,this.next_block_offset_y);

		this.render_text();
		//render current block 
	}

	this.render_block = function(x,y,colorid)
	{
		this.context.beginPath();
		this.context.rect(x, y, this.block_size, this.block_size);
        this.context.fillStyle = this.colors[colorid];
        this.context.fill();
        this.context.lineWidth = 2;
        this.context.strokeStyle = 'black';
        this.context.stroke();
        this.context.closePath();
	}

	this.render_grid = function()
	{
		for(var y =0;y<this.grid.length;y++)
			for(var x =0;x < this.grid[y].length;x++)
			{
				if(this.grid[y][x]  != 0)
				{
					this.render_block(this.game_offset_x+ this.block_size* x,this.game_offset_y+ this.block_size * y,this.grid[y][x]);
				}
			}
	}
	
	this.render_background = function()
	{

		//render background
		this.context.beginPath();
		this.context.rect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "#00B8E5";
        this.context.fill();
        this.context.stroke();
		this.context.closePath();

		//render game rect
		this.context.beginPath();
		this.context.rect(this.game_offset_x, this.game_offset_y, this.grid_width*this.block_size, this.grid_height*this.block_size);
        this.context.fillStyle = "#B8F1FF";
        this.context.fill();
        this.context.stroke();
		this.context.closePath();

		//render next block type rect
		this.context.beginPath();
		this.context.rect(this.next_block_offset_x, this.next_block_offset_y, 4*this.block_size, 4*this.block_size);
        this.context.fillStyle = "#B8F1FF";
        this.context.fill();
        this.context.stroke();
		this.context.closePath();
	}

	this.render_tetrimino = function(tetrimino,ox,oy)
	{


		for(var y=0;y < tetrimino.type[tetrimino.rotation].length;y++)
			for(var x=0;x < tetrimino.type[tetrimino.rotation][y].length;x++)
			{
				if(tetrimino.type[tetrimino.rotation][y][x] !=  0)
					this.render_block(ox+(tetrimino.x + x) * this.block_size,oy+(tetrimino.y + y) * this.block_size,tetrimino.type[tetrimino.rotation][y][x]);
			}
	}

	this.render_text = function()
	{
		this.context.fillStyle = "black";
		this.context.font = "20px Roboto";
		this.context.fillText("SCORE: "+this.score,230,130);
		this.context.fillText("TIME: "+this.elapsed_minutes+":"+this.elapsed_seconds.toFixed(1),230,150);
	}

	this.animate = function() 
	{
		//this.canvas = document.getElementById('game_canvas');
		//this.context = this.canvas.getContext('2d');

		// update
		this.update();

		// clear
		this.clear_screen();

		// draw stuff
		this.render();

		var that = this;

		// request new frame
		requestAnimFrame(function() 
		{
		  that.animate();
		});
	}	
}


var tetris = new game();

$(document).ready(function()
{
	$("#submit_btn").click(function()
		{
			var join_message = {"name":$("#nickname").val(), "room":$("#room").val()};

			$("#gamescreen").css("display","block");

			$("#loginscreen").css("display","none");



			to_console("waiting for other players..");

		});

	$("body").on("click","#send_chat_btn",function()
			{
				console.log($("#chatinput").val());
			});



	to_console = function(content)
	{
		$("#infopanel").html($("#infopanel").html()+"<br>"+content);
		$("#infopanel").scrollTop($("#infopanel")[0].scrollHeight);
	}



	window.requestAnimFrame = (function(callback) 
	{
	        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	        function(callback) 
	        {
	          window.setTimeout(callback, 1000 / 60);
	        };
	})();


	

	tetris.run();


});