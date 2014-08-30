// Random number generator class based on Mersenne Twister algorithm

function Random(seed) {
	this.mt = []; 
	this.mti = 0;
	this.mt[0]= this.uint((seed || Date.now()) & 0xffffffff);
	for (this.mti=1; this.mti<624; this.mti++) {
		this.mt[this.mti] = this.add(this.mul(1812433253, this.uint(this.mt[this.mti-1] ^ (this.mt[this.mti-1] >>> 30))), this.mti);
		this.mt[this.mti] = this.uint(this.mt[this.mti] & 0xffffffff);
	}
}

Random.prototype.uint = function(n) {
	return n < 0 ? (n ^ 0x80000000) + 0x80000000 : n;
};

Random.prototype.add = function(n1, n2) {
	return this.uint((n1 + n2) & 0xffffffff)
};

Random.prototype.mul = function(n1, n2) {
	var sum = 0;
	for (var i = 0; i < 32; ++i){
		if ((n1 >>> i) & 0x1){
			sum = this.add(sum, this.uint(n2 << i));
		}
	}
	return sum;
};

Random.prototype.get = function() {
	var i, j;
	if (this.mti >= 624) {
		for (j=0;j<227;j++) {
			i = this.uint((this.mt[j]&0x80000000) | (this.mt[j+1]&0x7fffffff));
			this.mt[j] = this.uint(this.mt[j+397] ^ (i >>> 1) ^ (i % 2 ? 0x9908b0df : 0x0));
		}
		for (;j<623;j++) {
			i = this.uint((this.mt[j]&0x80000000) | (this.mt[j+1]&0x7fffffff));
			this.mt[j] = this.uint(this.mt[j-227] ^ (i >>> 1) ^ (i % 2 ? 0x9908b0df : 0x0));
		}
		i = this.uint((this.mt[624-1]&0x80000000) | (this.mt[0]&0x7fffffff));
		this.mt[623] = this.uint(this.mt[396] ^ (i >>> 1) ^ (i % 2 ? 0x9908b0df : 0x0));
		this.mti = 0;
	}
	i = this.mt[this.mti++];
	i = this.uint(i ^ (i >>> 11));
	i = this.uint(i ^ ((i << 7) & 0x9d2c5680));
	i = this.uint(i ^ ((i << 15) & 0xefc60000));
	i = this.uint(i ^ (i >>> 18));
	return i / 4294967296;// return in range 0 - 1
};

