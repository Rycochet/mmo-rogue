// Mouse handling

var old_x = null, old_y = null;

var Mouse = {
	frame:false,
	x:0,
	y:0,
	last_x:0,
	last_y:0
};

Mouse.translate = function(left,top) {// Pass location from top-left, will translate relative to player
// Rotate 45 degrees around 364,284, then tile size is sqrt(845) = 29.0688
// 760 x 640
//	var left = (26*(y-x)) + Math.floor((54-this.dx)/2), top = (13*(x+y)) + Math.floor((49 - this.dy) / 2), imgx, imgy;
	var tile = Math.sqrt(1250), ti = tile / 2, cos = Math.cos(Math.PI / 4), sin = -Math.sin(Math.PI / 4);
	left -= 380
	top = (top - 320) * 2;
	this.x = (left * cos) - (top * sin);
	this.y = (left * sin) + (top * cos);
	this.x = this.x>=0 ? Math.floor((this.x + ti) / tile) : Math.ceil((this.x - ti) / tile);
	this.y = this.y>=0 ? Math.floor((this.y + ti) / tile) : Math.ceil((this.y - ti) / tile);
};

Mouse.init = function() {
	$('#display')
	.mouseover(function(event){
//		debug('Mouse.mouseover()');
		Mouse.frame = true;
	})
	.mouseout(function(event){
//		debug('Mouse.mouseout()');
		Mouse.frame = false;
	})
	.mousemove(function(event){
//		debug('Mouse.mousemove()');
		Mouse.translate(event.pageX - $(this).offset().left, event.pageY - $(this).offset().top);
		if (Mouse.last_x === Mouse.x && Mouse.last_y === Mouse.y) {
			return;
		}
		Mouse.frame = true;
		Mouse.last_x = Mouse.x;
		Mouse.last_y = Mouse.y;
		Player.redraw = true;
		return false;
	})
	.mousedown(function(event){
//		debug('Mouse.mousedown()');
		if (event.which === 1) // Left click
		Mouse.translate(event.pageX - $(this).offset().left, event.pageY - $(this).offset().top);
		switch(event.which) {
			case 1:// Left button
				if (Map.canMove(Mouse.x,Mouse.y)) {
//					log('moveTo('+Mouse.x+','+Mouse.y+')');
					Player.to_x = Player.x + Mouse.x;
					Player.to_y = Player.y + Mouse.y;
				}
				break;
			case 2:// Middle button
				if (Map.canMove(Mouse.x,Mouse.y)) {
					if (event.shiftKey) {
						log('addTorch('+Player.x + Mouse.x+','+Player.y + Mouse.y+')');
						Map.ground[_map(Player.x + Mouse.x,Player.y + Mouse.y)]['l'] = 0;
					} else {
						log('addWall('+Player.x + Mouse.x+','+Player.y + Mouse.y+')');
						Map.ground[_map(Player.x + Mouse.x,Player.y + Mouse.y)]['c'] = 0;
					}
					Map.doShadow();
					Player.redraw = true;
				}
				break;
			case 3:// Right button
				break;
			default:// Unknown button
				return true;
		}
		return false;
	});
};

