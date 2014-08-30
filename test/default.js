// mmo-rogue test...
// Should probably use Mersenne Twister for random generation to be consistent between php and js
var canvas, ctx, canvas1, canvas2, buffer1, buffer2, buffer = true;

var Player = {
	x:43,
	y:43,
	to_x:43,
	to_y:43,
	light:10,
	redraw:true,
	pause:false
};

var globalLight = 0;//1;

/* Tiles */
var ground = new Tileset('a','images/ground.png',54,49,null,0,-23);
var terrain = new Tileset('b','images/terrain.png',54,49,null,0,-23);
var walls = new Tileset('c','images/walls.png',54,49,[{shadow:1},{shadow:1},{shadow:1}],0,-23);
var doors = new Tileset('d','images/doors.png',54,49,null,0,-23);
var frame = new Tileset('f','images/tiles1.png',54,49,null,0,-23);
//var lights = new Tileset('l','images/lights.png',32,32,[{light:5}]);
var torch = new Tileset('l','images/torch.png',11,15,[{light:5}],0,4);
var player = new Tileset('p','images/player.png',32,32,null,0,-15);

//drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
drawDungeon = function() {
	canvas = buffer ? canvas2 : canvas;
	ctx = buffer ? buffer2 : buffer1;
	Map.draw();
	if (buffer) {
		canvas1.style.display = 'none';
		canvas2.style.display = '';
		buffer = false;
	} else {
		canvas1.style.display = '';
		canvas2.style.display = 'none';
		buffer = true;
	}
};

$(function(){
	canvas = canvas1 = document.getElementById('buffer1');  
	canvas2 = document.getElementById('buffer2');  
	if (!canvas1.getContext){
		log('canvas unsupported, get a decent browser');
		return;
	}
	ctx = buffer1 = canvas1.getContext('2d');
	buffer2 = canvas2.getContext('2d');

	initKeyboard();

	$('#clear').click(function(){$('#log').empty();});

	Map.init();
	Mouse.init();

	Player.to_x = Player.x;
	Player.to_y = Player.y;

	log('<b>Keyboard:</b> Numpad or Arrows to move, Numpad "+" / "-" to change light radius, "p" to Pause, "d" to Drop a torch, "[" / "]" to change global light.','"1" / "2" - Change water level (CPU intensive!!), "3" / "4" - Change roughness (CPU intensive!!)');
	log('<b>Mouse:</b> Left click to move, Middle click to place a wall, Shift+Middle click to place a torch');
	var timer = window.setInterval(function(){
		if (!Player.pause) {
			if (Player.x !== Player.to_x || Player.y !== Player.to_y) {
				var path = Map.findPath(Player.x, Player.y, Player.to_x, Player.to_y);
				if (path) {
					Map.doMove(path[0], path[1]);
					Player.redraw = true;
				}
			}
			if (Player.redraw) {
				Player.redraw = false;
				Player.moved = false;
				$('#pos').html('x:'+Player.x+' ('+Map.x+'), y:'+Player.y+' ('+Map.y+'), light:'+Player.light+' (global:'+globalLight+')<br>water: '+Map.water+', rough: '+Map.rough);
				drawDungeon();
			}
		}
	}, 250);
});