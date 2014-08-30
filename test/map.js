/* maps */
var mapMaxXY = 65536;
var mapMaxLoc = mapMaxXY * 32;
var mapSize1 = 32 * 32;
var mapSize2 = mapSize1 * 2 * 2;
var mapSize3 = mapSize1 * 3 * 3;
var mapSize4 = mapSize1 * 4 * 4;
var mapSize5 = mapSize1 * 5 * 5;

var Map = {
	buffer:[null,null,null,null,null,null,null,null,null],// 3x3 array of 32x32 blocks, player is always in the center one, auto-load outside ones, and move them around as needed
	ground:[],//96x96, filled from buffer
	light:[],
	los:[],
	shadow:[],
	x:0,// Absolute position of map within world - center tile only
	y:0,
	rough:0.7,
	water:0.0,
	init:function() {
		var x,y;
		for (x=0; x<3; x++) {
			for(y=0; y<3; y++) {
				this.load(x, y);
			}
		}
		Map.doShadow();
	}
};

Map.ground.length = mapSize3;

// Is x1 > x2?
//var _unmap = function(x1, x2)	{return x1 > x2 && x1;};
Map.load = function(x,y) {
//	debug('Map.load('+x+', '+y+')');
	var a, b, i, m, step, div, dx, dy, map = [], rnd = [], section = [], max = 5;
	this.buffer[x + (y * 3)] = section;

	for (i=0; i<(mapSize1 * max * max); i++) {
		map[i] = 0;
	}
	for (dx=0; dx<max; dx++) {
		for (dy=0; dy<max; dy++) {
			m = dx + (dy * max);
			rnd[m] = new Random(Math.rotate(this.x + dx + x - 2, mapMaxXY) + (Math.rotate(this.y + dy + y - 2, mapMaxXY) * mapMaxXY));
			map[_map5(dx*32, dy*32)] = rnd[m].get() * this.rough + this.water;// set 0,0 of each tile to the correct random number
		}
	}
	step = 16;
	div = 2;
	while (step >= 1) {
		// Diamond
		for (dx=step; dx<(max*32)-step; dx+=2*step) {
			for (dy=step; dy<(max*32)-step; dy+=2*step) {
				if (map[_map5(dx,dy)]) continue;
				m = (rnd[Math.floor(dx/32) + (Math.floor(dy/32) * max)].get() - 0.5) * this.rough / div;
				map[_map5(dx,dy)] = (map[_map5_(dx-step,dy-step)] + map[_map5_(dx+step,dy-step)] + map[_map5_(dx-step,dy+step)] + map[_map5_(dx+step,dy+step)]) / 4 + m;
			}
		}
		// Square
		for (dx=0; dx<(max*32); dx+=step) {
			for (dy=0; dy<(max*32); dy+=step) {
				if (map[_map5(dx,dy)]) continue;
				m = (rnd[Math.floor(dx/32) + (Math.floor(dy/32) * max)].get() - 0.5) * this.rough / div;
				map[_map5(dx,dy)] = (map[_map5_(dx-step,dy)] + map[_map5_(dx,dy-step)] + map[_map5_(dx+step,dy)] + map[_map5_(dx,dy+step)]) / 4 + m;
			}
		}
		step /= 2;
		div *= 2;
	}
//	for (i=0; i<map.length; i++) {
//		map[i] = Math.floor(map[i] * 10);
//	}
	for (dx=0; dx<32; dx++) {
		for (dy=0; dy<32; dy++) {
			section[_map1(dx,dy)] = section[_map1(dx,dy)] || {};
			section[_map1(dx,dy)]['a'] = Math.range(0, Math.floor(map[_map5(dx+(Math.floor(max/2)*32),dy+(Math.floor(max/2)*32))] * 10), 9);
			section[_map1(dx,dy)]['b'] = Math.range(0, Math.floor(rnd[5].get() * 10), 9) * 10 + section[_map1(dx,dy)]['a'];
//			section[_map1(dx,dy)]['b'] = section[_map1(dx,dy)]['a'];
//			this.ground[_map(dx + (32*x),dy + (32*y))] = section[_map1(dx,dy)];
		}
	}

	for (dx=0; dx<96; dx++) {
		for(dy=0; dy<96; dy++) {
			m = Math.floor(dx/32) + (Math.floor(dy/32) * 3);
			if (this.buffer[m]) {
				this.ground[_map(dx,dy)] = this.buffer[m][_map1(dx%32,dy%32)];
			}
		}
	}
};
	
Map.doShadow=function() {
//	debug('Map.doShadow()');
	var a, b, i, x, y, m, pos, light, shadow, delta; //, timer = Date.now();
	// OBJECTS BLOCKING LINE OF SIGHT
	this.los = [];
	this.los.length = mapSize3; //3*3*32*32, all "undefined";
	for (x=0; x<96; x++) {
		for(y=0; y<96; y++) {
			pos = _map(x,y);
			shadow = 0;
			for (i in this.ground[pos]) {
				shadow = Math.max(shadow, Tilesets[i].getopts(this.ground[pos][i], 'shadow', 0));
			}
			this.los[pos] = shadow;
		}
	}

	// SHADOWS
	this.shadow = [];
	this.shadow.length = mapSize3; //3*3*32*32, all "undefined";
	x = Player.x;
	y = Player.y;
	this.shadow[_map(x, y)] = this.los[_map(x, y)];
	for (i=1; i<32; i++) {
		// STRAIGHT +
		var xiy = _map(x + i, y), x_iy = _map(x - i, y), xyi = _map(x, y + i), xy_i = _map(x, y - i);
		this.shadow[xiy]	= this.los[xiy - 1]   + this.shadow[xiy - 1];
		this.shadow[x_iy]	= this.los[x_iy + 1]  + this.shadow[x_iy + 1];
		this.shadow[xyi]	= this.los[xyi - 96]  + this.shadow[xyi - 96];
		this.shadow[xy_i]	= this.los[xy_i + 96] + this.shadow[xy_i + 96];
		// ANGLES (not diagonal)
		for (delta=1; delta<i; delta++) {
			var a1 = Math.atan(delta / i) * 1.31 /*4 / Math.PI*/, a2 = 1 - a1;
			var xiyd = _map(x + i, y + delta), x_iyd = _map(x - i, y + delta), xiy_d = _map(x + i, y - delta), x_iy_d = _map(x - i, y - delta);
			var xdyi = _map(x + delta, y + i), x_dyi = _map(x - delta, y + i), xdy_i = _map(x + delta, y - i), x_dy_i = _map(x - delta, y - i);
			// In 1/8ths, from north clockwise
			this.shadow[x_iyd]	= (a1 * (this.los[x_iyd - 96 + 1]  + this.shadow[x_iyd - 96 + 1]))  + (a2 * (this.los[x_iyd + 1]   + this.shadow[x_iyd + 1]));
			this.shadow[x_dyi]	= (a1 * (this.los[x_dyi - 96 + 1]  + this.shadow[x_dyi - 96 + 1]))  + (a2 * (this.los[x_dyi - 96]  + this.shadow[x_dyi - 96]));
			this.shadow[xdyi]	= (a1 * (this.los[xdyi - 96 - 1]   + this.shadow[xdyi - 96 - 1]))   + (a2 * (this.los[xdyi - 96]   + this.shadow[xdyi - 96]));
			this.shadow[xiyd]	= (a1 * (this.los[xiyd - 96 - 1]   + this.shadow[xiyd - 96 - 1]))   + (a2 * (this.los[xiyd - 1]    + this.shadow[xiyd - 1]));
			this.shadow[xiy_d]	= (a1 * (this.los[xiy_d + 96 - 1]  + this.shadow[xiy_d + 96 - 1]))  + (a2 * (this.los[xiy_d - 1]   + this.shadow[xiy_d - 1]));
			this.shadow[xdy_i]	= (a1 * (this.los[xdy_i + 96 - 1]  + this.shadow[xdy_i + 96 - 1]))  + (a2 * (this.los[xdy_i + 96]  + this.shadow[xdy_i + 96]));
			this.shadow[x_dy_i]	= (a1 * (this.los[x_dy_i + 96 + 1] + this.shadow[x_dy_i + 96 + 1])) + (a2 * (this.los[x_dy_i + 96] + this.shadow[x_dy_i + 96]));
			this.shadow[x_iy_d]	= (a1 * (this.los[x_iy_d + 96 + 1] + this.shadow[x_iy_d + 96 + 1])) + (a2 * (this.los[x_iy_d + 1]  + this.shadow[x_iy_d + 1]));
		}
		// DIAGONAL X
		var xiyi = _map(x + i, y + i),x_iyi = _map(x - i, y + i), xiy_i = _map(x + i, y - i), x_iy_i = _map(x - i, y - i);
		this.shadow[xiyi]	= this.los[xiyi - 96 - 1]   + this.shadow[xiyi - 96 - 1];// + ((this.shadow[xiyi - 1] + this.shadow[xiyi - 96]) / 2);
		this.shadow[x_iyi]	= this.los[x_iyi - 96 + 1]  + this.shadow[x_iyi - 96 + 1];// + ((this.shadow[x_iyi + 1] + this.shadow[x_iyi - 96]) / 2);
		this.shadow[xiy_i]	= this.los[xiy_i + 96 - 1]  + this.shadow[xiy_i + 96 - 1];// + ((this.shadow[xiy_i - 1] + this.shadow[xiy_i + 96]) / 2);
		this.shadow[x_iy_i]	= this.los[x_iy_i + 96 + 1] + this.shadow[x_iy_i + 96 + 1];// + ((this.shadow[x_iy_i + 1] + this.shadow[x_iy_i + 96]) / 2);
	}
//	debug('Map.doShadow() took '+(Date.now() - timer)+'ms');
};

Map.addLight = function(x,y,strength) {
//	debug('Map.addLight('+x+', '+y+', '+strength+')');
	var i, d, dx, dy, mx, my, pos, shadow = []; //, timer = Date.now();
	shadow.length = mapSize3;
	shadow[_map(x, y)] = this.los[_map(x, y)];
	for (i=1; i<strength; i++) {
		// STRAIGHT +
		var xiy = _map(x + i, y), x_iy = _map(x - i, y), xyi = _map(x, y + i), xy_i = _map(x, y - i);
		x+i < 96 && (shadow[xiy]  = this.los[xiy - 1]   + shadow[xiy - 1]);
		x-i > 0  && (shadow[x_iy] = this.los[x_iy + 1]  + shadow[x_iy + 1]);
		y+i < 96 && (shadow[xyi]  = this.los[xyi - 96]  + shadow[xyi - 96]);
		y-i > 0  && (shadow[xy_i] = this.los[xy_i + 96] + shadow[xy_i + 96]);
		// ANGLES (not diagonal)
		for (d=1; d<i; d++) {
			var a1 = Math.atan(d / i) * 1.31 /*4 / Math.PI*/, a2 = 1 - a1;
			var xiyd = _map(x + i, y + d), x_iyd = _map(x - i, y + d), xiy_d = _map(x + i, y - d), x_iy_d = _map(x - i, y - d);
			var xdyi = _map(x + d, y + i), x_dyi = _map(x - d, y + i), xdy_i = _map(x + d, y - i), x_dy_i = _map(x - d, y - i);
			// In 1/8ths, from north clockwise
			x-i > 0  && y+d < 96 && (shadow[x_iyd]  = (a1 * (this.los[x_iyd - 96 + 1]  + shadow[x_iyd - 96 + 1]))  + (a2 * (this.los[x_iyd + 1]   + shadow[x_iyd + 1])));
			x-d > 0  && y+i < 96 && (shadow[x_dyi]  = (a1 * (this.los[x_dyi - 96 + 1]  + shadow[x_dyi - 96 + 1]))  + (a2 * (this.los[x_dyi - 96]  + shadow[x_dyi - 96])));
			x+d < 96 && y+i < 96 && (shadow[xdyi]   = (a1 * (this.los[xdyi - 96 - 1]   + shadow[xdyi - 96 - 1]))   + (a2 * (this.los[xdyi - 96]   + shadow[xdyi - 96])));
			x+i < 96 && y+d < 96 && (shadow[xiyd]   = (a1 * (this.los[xiyd - 96 - 1]   + shadow[xiyd - 96 - 1]))   + (a2 * (this.los[xiyd - 1]    + shadow[xiyd - 1])));
			x+i > 0  && y-d > 0  && (shadow[xiy_d]  = (a1 * (this.los[xiy_d + 96 - 1]  + shadow[xiy_d + 96 - 1]))  + (a2 * (this.los[xiy_d - 1]   + shadow[xiy_d - 1])));
			x+d > 0  && y-i > 0  && (shadow[xdy_i]  = (a1 * (this.los[xdy_i + 96 - 1]  + shadow[xdy_i + 96 - 1]))  + (a2 * (this.los[xdy_i + 96]  + shadow[xdy_i + 96])));
			x-d < 96 && y-i > 0  && (shadow[x_dy_i] = (a1 * (this.los[x_dy_i + 96 + 1] + shadow[x_dy_i + 96 + 1])) + (a2 * (this.los[x_dy_i + 96] + shadow[x_dy_i + 96])));
			x-i < 96 && y-d > 0  && (shadow[x_iy_d] = (a1 * (this.los[x_iy_d + 96 + 1] + shadow[x_iy_d + 96 + 1])) + (a2 * (this.los[x_iy_d + 1]  + shadow[x_iy_d + 1])));
		}
		// DIAGONAL X
		var xiyi = _map(x + i, y + i),x_iyi = _map(x - i, y + i), xiy_i = _map(x + i, y - i), x_iy_i = _map(x - i, y - i);
		shadow[xiyi]   = this.los[xiyi - 96 - 1]   + shadow[xiyi - 96 - 1];// + ((this.shadow[xiyi - 1] + this.shadow[xiyi - 96]) / 2);
		shadow[x_iyi]  = this.los[x_iyi - 96 + 1]  + shadow[x_iyi - 96 + 1];// + ((this.shadow[x_iyi + 1] + this.shadow[x_iyi - 96]) / 2);
		shadow[xiy_i]  = this.los[xiy_i + 96 - 1]  + shadow[xiy_i + 96 - 1];// + ((this.shadow[xiy_i - 1] + this.shadow[xiy_i + 96]) / 2);
		shadow[x_iy_i] = this.los[x_iy_i + 96 + 1] + shadow[x_iy_i + 96 + 1];// + ((this.shadow[x_iy_i + 1] + this.shadow[x_iy_i + 96]) / 2);
	}
	mx = Math.min(x + Math.ceil(strength), 96);
	my = Math.min(y + Math.ceil(strength), 96);
	for (dx = Math.max(x - Math.floor(strength), 0); dx<mx; dx++) {
		for (dy = Math.max(y - Math.floor(strength), 0); dy<my; dy++) {
			pos = _map(dx, dy);
			if (pos in shadow) {
				distance = Math.sqrt(Math.pow(dx - x, 2) + Math.pow(dy - y, 2));
				if (distance < strength) {
					this.light[pos] = Math.max((1 - shadow[pos]) * (1 - Math.range(0, Math.pow(distance,2) / Math.pow(strength,2), 1)), (this.light[pos] || 0));
				}
			}
		}
	}
//	debug('Map.addLight() took '+(Date.now() - timer)+'ms');
};

Map.doLighting = function() {
	// LIGHTING
	var x, y, pos, light; //, timer = Date.now();
	this.light = [];
	this.light.length = mapSize3; //3*3*32*32;
	for (x=0; x<96; x++) {
		for(y=0; y<96; y++) {
			pos = _map(x,y);
			for (i in this.ground[pos]) {
				light = Tilesets[i].getopts(this.ground[pos][i], 'light', 0);
				if (light > 0) {
					this.addLight(x, y, light + (Math.random() - 0.5));
					Player.redraw = true;
				}
			}
		}
	}
//	debug('Map.doLighting() took '+(Date.now() - timer)+'ms');
};

Map.draw = function() {
//	debug('Map.draw()');
	var x, y, i, pos, light, start=Date.now();
	ctx.globalAlpha = 1.0;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	this.doLighting();
	this.addLight(Player.x, Player.y, Player.light);
	for (x=-31; x<32; x++) {
		for (y=-31; y<32; y++) {
			pos = _map(Player.x + x, Player.y + y);
			light = Math.max(globalLight, this.light[pos] || 0);
			if (light && this.shadow[pos] < 1) {
				for (i in this.ground[pos]) {
					Tilesets[i].draw(this.ground[pos][i], x, y, Math.range(0, light * (this.los[pos] ? this.los[pos] : (1-this.shadow[pos])), 1));
				}
			}
		}
	}
	Mouse.frame && frame.draw(1,Mouse.x,Mouse.y,1);
	player.draw(0,0,0,1)
	$('#fps').html('frame:'+(Date.now() - start)+'ms');
};

Map.canMove = function(dx,dy) {
//	debug('Map.canMove('+dx+','+dy+')');
	if ('c' in this.ground[_map(Player.x + dx, Player.y + dy)]) {
		return false;
	}
	return true;
};

Map.doMove = function(dx,dy) {
//	debug('Map.doMove('+dx+','+dy+')');
	if (!Player.moved && this.canMove(dx,dy)) {
		var x, y;
		Player.x += dx;
		Player.y += dy;
		if (Player.x < 32) {
//			debug('Move Map Right');
			Player.x += 32;
			Player.to_x += 32;
			this.x = Math.rotate(this.x-1, mapMaxXY);
			this.buffer.splice(0,0,null);
			this.buffer.splice(3,1,null);
			this.buffer.splice(6,1,null);
			this.buffer.splice(9,1);
		} else if (Player.x >= 64) {
//			debug('Move Map Left');
			Player.x -= 32;
			Player.to_x -= 32;
			this.x = Math.rotate(this.x+1, mapMaxXY);
			this.buffer.splice(0,1);
			this.buffer.splice(2,1,null);
			this.buffer.splice(5,1,null);
			this.buffer.splice(8,0,null);
		}
		if (Player.y < 32) {
//			debug('Move Map Down');
			Player.y += 32;
			Player.to_y += 32;
			this.y = Math.rotate(this.y-1, mapMaxXY);
			this.buffer.splice(6,3);
			this.buffer.splice(0,0,null,null,null);
		} else if (Player.y >= 64) {
//			debug('Move Map Up');
			Player.y -= 32;
			Player.to_y -= 32;
			this.y = Math.rotate(this.y+1, mapMaxXY);
			this.buffer.splice(0,3);
			this.buffer.splice(6,0,null,null,null);
		}
		for (x=0; x<3; x++) {
			for(y=0; y<3; y++) {
				!this.buffer[x + (y * 3)] && this.load(x, y);
			}
		}
		Player.redraw = true;
		Player.moved = true;
		Map.doShadow();
	}
};

Map.findPath = function(startx, starty, destx, desty) {// returns [dx,dy] for next tile or null if impossible
//	debug('Map.findPath('+startx+','+starty+','+destx+','+desty+')');
	var route = [], todo = [], x, y, dx, dy, pos, val, val2, max = 0, end = _map(startx,starty); //, timer = Date.now();
	route.length = mapSize3; //3*3*32*32;
	route[_map(destx,desty)] = 1;
	todo.push([destx,desty]);
	while(todo.length) {
		todo.sort(function(a,b){return route[_map(a[0],a[1])] - route[_map(b[0],b[1])]});
		pos = todo.shift();
		x = pos[0];
		y = pos[1];
		if (x<1 || x>94 || y<1 || y>94) {
			continue;
		}
		val = route[_map(x,y)];
		max = Math.max(max, val);
		if (max > 31) {
//			debug('Route too long or impossible...');
			break; // no use going too far...
		}
		for (dx=-1; dx<2; dx++) {
			for(dy=-1; dy<2; dy++) {
				if (!dx && !dy) continue;
				if ('c' in Map.ground[_map(x+dx, y+dy)]) continue;
				pos = _map(x+dx,y+dy);
				val2 = val + Math.sqrt(Math.abs(dx) + Math.abs(dy));
				if (!route[pos] || route[pos] > val2) {
					route[pos] = val2;
					todo.push([x+dx, y+dy]);
					if (pos === end) {
//						debug('findPath took '+(Date.now() - timer)+'ms');
//						debug('Route found!');
						return [0-dx, 0-dy];
					}
				}
			}
		}
	}
	return null;
};


