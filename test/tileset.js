/**
* List of all tilesets for quick access
*/
var Tilesets = {};

/**
* Tilesets for use in displaying the map
* @constructor
* @param {string} id Identity of the tileset - used for choosing which tiles to display.
* @param {string} img URL of the image file to use
* @param {number} dx Width of an individual tile in the image
* @param {number} dy Height of an individual tile in the image
* @param {array=} opts Options - array of objects, 1 per tile, shadow:Light blocking (default 0), light:Light given out (default 0)
* @param {number=} ox Image offset (vertical)
* @param {number=} oy Image offset (horizontal)
* @param {number=} sx Space between tiles - horizontal
* @param {number=} sy Space between tiles - vertical
*/
function Tileset(id, img, dx, dy, opts, ox, oy, sx, sy) {
	this.id = id;
	Tilesets[id] = this;
	this.img = new Image();
	$(this.img).bind('load', function(){
		tiles = Tilesets[id];
		tiles.cols = Math.floor(tiles.img.width / (tiles.dx + tiles.sx));
		tiles.rows = Math.floor(tiles.img.height / (tiles.dy + tiles.sy));
		Player.redraw = true;
		tiles._loaded = true;
	});
	this.img.src = img;
	this.dx = dx;
	this.dy = dy;
	this.ox = ox || 0;
	this.oy = oy || 0;
	this.sx = sx || 0;
	this.sy = sy || 0;
	this.options = opts ? opts.splice(0) : [];
};

Tileset.prototype._loaded = false;

Tileset.prototype.getopts = function(id, key, def) {
	if (id in this.options && key in this.options[id]) {
		return this.options[id][key];
	}
	return def;
};

/**
* Draw a single tile in a canvas at position x,y
* @param {number} id Which tile, left to right, then top to bottom
* @param {number} x Horizontal position
* @param {number} y Vertical position
* @param {number=} light How light it appears, 0 (black) to 1 (solid) (transparent through to black)
*/
Tileset.prototype.draw = function(id, x, y, light) {// 760 x 640
	var left = 354 + (26*(x-y)) + Math.floor((54-this.dx)/2) + this.ox, top = 307 + (13*(x+y)) + this.oy, imgx, imgy;
	if (!this._loaded || !light || left + this.dx < 0 || left > 760 || top + this.dy < 0 || top > 640) {
		return;
	}
	imgx = (this.dx + this.sx) * (id % this.cols);
	imgy = (this.dy + this.sy) * Math.floor(id / this.cols);
	ctx.save();
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'destination-out';
	ctx.drawImage(this.img, imgx, imgy, this.dx, this.dy, left, top, this.dx, this.dy);
	ctx.globalAlpha = light;
	ctx.globalCompositeOperation = 'source-over';
	ctx.drawImage(this.img, imgx, imgy, this.dx, this.dy, left, top, this.dx, this.dy);
	ctx.restore();
};