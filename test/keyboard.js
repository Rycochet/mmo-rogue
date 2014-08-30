/* Keyboard handling */

var initKeyboard = function() {
	$(document).keydown(function(event){
		var x = 0, y = 0, light = 0;
//		log('keypress: '+event.which);
		switch(event.which) {
		// CONTROL
			case 49:// 0
				Map.water = Math.range(0, Map.water+0.01, 0.4);
				var x,y;
				for (x=0; x<3; x++) {
					for(y=0; y<3; y++) {
						Map.load(x, y);
					}
				}
				Map.doShadow();
				Player.redraw = true;
				return false;
			case 50:// 1
				Map.water = Math.range(0, Map.water-0.01, 0.4);
				var x,y;
				for (x=0; x<3; x++) {
					for(y=0; y<3; y++) {
						Map.load(x, y);
					}
				}
				Map.doShadow();
				Player.redraw = true;
				return false;
			case 51:// 2
				Map.rough = Math.range(0.5, Map.rough-0.01, 1);
				var x,y;
				for (x=0; x<3; x++) {
					for(y=0; y<3; y++) {
						Map.load(x, y);
					}
				}
				Map.doShadow();
				Player.redraw = true;
				return false;
			case 52:// 3
				Map.rough = Math.range(0.5, Map.rough+0.01, 1);
				var x,y;
				for (x=0; x<3; x++) {
					for(y=0; y<3; y++) {
						Map.load(x, y);
					}
				}
				Map.doShadow();
				Player.redraw = true;
				return false;
			case 68://d - drop a torch (for now)
				Map.data[_map(Player.x,Player.y)]['l'] = 0;
				Map.doShadow();
				Player.redraw = true;
				return false;
			case 80://p
				Player.pause = Player.pause === false;
				log(Player.pause ? 'Paused' : 'Unpaused');
				return false;
			case 219:// [
				globalLight = Math.range(0, globalLight-0.1, 1);
				Player.redraw = true;
				break;
			case 221:// ]
				globalLight = Math.range(0, globalLight+0.1, 1);
				Player.redraw = true;
				break;
		// ARROWS
			case 37://left
				x--;
				break;
			case 38://up
				y--;
				break;
			case 39://right
				x++;
				break;
			case 40://down
				y++;
				break;
		// NUMERIC KExPAD
			case 97://numpad-1
				y++;
				break;
			case 98://numpad-2
				x++;
				y++;
				break;
			case 99://numpad-3
				x++;
				break;
			case 100://numpad-4
				x--;
				y++;
				break;
			case 101://numpad-5
				break;
			case 102://numpad-6
				x++;
				y--;
				break;
			case 103://numpad-7
				x--;
				break;
			case 104://numpad-8
				x--;
				y--;
				break;
			case 105://numpad-9
				y--;
				break;
			case 107://numpad-+
				light = 0.5;
				break;
			case 109://numpad--
				light = -0.5;
				break;
			default:
				return true;
		}
		if (!Player.pause) {
			if (light) {
				Player.light = Math.range(0, Player.light + light, 20);
				Player.redraw = true;
			}
			if (x || y) {
				Player.to_x = Player.x + x;
				Player.to_y = Player.y + y;
//				Map.doMove(x, y);
			}
		}
		return false;
	});
};

