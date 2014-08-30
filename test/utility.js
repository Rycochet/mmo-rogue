/* Utility functions */

var log = function(/*txt*/){
	$('#log').append('<tr><th>[' + (new Date).toLocaleTimeString() + ']</th><td>' + $.makeArray(arguments).join('<br>') + '</td></tr>').parent().scrollTop($('#log').height());
};

var debug = function(/*txt*/){
	$('#log').append('<tr><th class="red">[' + (new Date).toLocaleTimeString() + ']</th><td>' + $.makeArray(arguments).join('<br>') + '</td></tr>').parent().scrollTop($('#log').height());
};

Math.range = function(min, num, max) {
	return Math.max(min, Math.min(num, max));
};

Math.rotate = function(num, max) {
	num = num % max;
	return num < 0 ? num + max : num;
};

var _map1 = function(x,y) {return x + (y * 32);};
var _sec1 = function(x,y) {return Math.floor(x/32) + (Math.floor(y/32));};

var _map2 = function(x,y) {return x + (y * 64);};
var _sec2 = function(x,y) {return Math.floor(x/32) + (Math.floor(y/32) * 2);};

var _map3 = function(x,y) {return x + (y * 96);};
var _map3_ = function(x,y) {return Math.rotate(x, 96) + (Math.rotate(y, 96) * 96);};
var _sec3 = function(x,y) {return Math.floor(x/32) + (Math.floor(y/32) * 3);};

var _map4 = function(x,y) {return x + (y * 128);};
var _map4_ = function(x,y) {return Math.rotate(x, 128) + (Math.rotate(y, 128) * 128);};
var _sec4 = function(x,y) {return Math.floor(x/32) + (Math.floor(y/32) * 4);};

var _map5 = function(x,y) {return x + (y * 160);};
var _map5_ = function(x,y) {return Math.rotate(x, 160) + (Math.rotate(y, 160) * 160);};
var _sec5 = function(x,y) {return Math.floor(x/32) + (Math.floor(y/32) * 5);};

var _map = _map3;
var _map_ = _map3_;
var _sec = _sec3;

