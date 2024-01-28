Math.gcd = function(a, b, calculateX = false, calculateY = false) {
    let r1 = BigInt(a);
    let r2 = BigInt(b);
    let x1 = 1n, x2 = 0n;
    let y1 = 0n, y2 = 1n;
    while (true) {
        let q = r1/r2;
        let r3 = r1-q*r2;
        if (r3 == 0) break;
        r1 = r2;
        r2 = r3;
        if (calculateX) {
            let x3 = x1-q*x2;
            x1 = x2;
            x2 = x3;
        }
        if (calculateY) {
            let y3 = y1-q*y2;
            y1 = y2;
            y2 = y3;
        }
    }
    if (calculateX && !calculateY) return {gcd: r2, x: x2};
    if (!calculateX && calculateY) return {gcd: r2, y: y2};
    if (calculateX && calculateY) return {gcd: r2, x: x2, y: y2};
    return r2;
};
Math.powerMod = function(base, exponent, modulus) {
    let result = 1n;
    let factor = base;
    while (true) {
        if (exponent & 1n) {
            result*= factor;
            result%= modulus;
        }
        exponent >>= 1n;
        if (exponent == 0n) break;
        factor*= factor;
        factor%= modulus;
    }
    return result;
};
Math.randomBigIntBits = function(bits) {
    let length = Math.ceil(bits/32);
    let result = BigInt(Math.floor(Math.random()*2**32));
    for (let i = 1; i < length; i++) {
        result <<= 32n;
        result += BigInt(Math.floor(Math.random()*2**32));
    }
    result >>= BigInt(length*32-bits);
    return result;
};
Math.randomBigInt = function(max) {
    let result = max+1n;
    while (result > max) {
        result = Math.randomBigIntBits(max.toString(2).length);
    }
    return result;
};
Math.mrt = function(n, a) {
    let m = n-1n;
    let d = m >> 1n;
    let e = 1n;
    while (!(d & 1n)) {
        d >>= 1n;
        e++;
    }
    let p = Math.powerMod(a, d, n);
    if (p == 1n) return true;
    if (p == m) return true;
    while (e > 1n) {
        p*= p;
        p%= n;
        if (p == m) return true;
        if (p <= 1n) break;
        e--;
    }
    return false;
};
Math.mrt_mc = function(n, tests) {
    for (let i = 0; i < tests; i++) {
        let a = Math.randomBigInt(n-4n)+2n;
        if (!Math.mrt(n, a)) return false;
    }
    return true;
};
Math.findPrime = function(digits, precision) {
    let number = Math.randomBigIntBits(digits)+5n;
    let isPrime = Math.mrt_mc(number, precision);
    if (isPrime) return number;
    else return Math.findPrime(digits, precision);
};
Math.rsaKeys = function(digits, precision) {
    let p = Math.findPrime(digits, precision);
    let q = Math.findPrime(digits, precision);
    let N = p*q;
    let phi_N = (p-1n)*(q-1n);
    let e = 0n;
    while (true) {
        e = Math.randomBigInt(phi_N-4n)+2n;
        if (Math.gcd(e, phi_N) == 1n) break;
    }
    let d = Math.gcd(e, phi_N, true).x;
    if (d < 0) d+= phi_N;
    return {e: e, N: N, d: d};
};
Math.rsaEncrypt = function(message, keys) {
    let c = new Array(message.length);
    for (let i = 0; i < message.length; i++) c[i] = Math.powerMod(message[i], keys.e, keys.N);
    return c;
};
Math.rsaDecrypt = function(c, keys) {
    let message = new Array(c.length);
    for (let i = 0; i < c.length; i++) message[i] = Math.powerMod(c[i], keys.d, keys.N);
    return message;
};
Math.randInt = function(integer) {
    return Math.floor(Math.random()*integer);
};
Number.prototype.clamp = function() {
    return Math.min(Math.max(this, 0), 1);
};
Array.prototype.shuffle = function() {
    for (let i = this.length-1; i > 0; i--) {
        let j = Math.randInt(i+1);
        [this[i], this[j]] = [this[j], this[i]];
    }
};
Array.prototype.isPositiveInteger = function() {
    if (this%1 != 0) return false;
    if (this <= 0) return false;
    return true;
};
Array.prototype.random = function(not = []) {
    let result = this[Math.randInt(this.length)];
    while (not.indexOf(result) != -1) result = this[Math.floor(Math.random()*this.length)];
    return result;
};
Array.prototype.toList = function(seperator1, seperator2) {
    if (this.length == 0) return "";
    if (this.length == 1) return this[0];
    let smallerArray = this.slice(0, this.length-1);
    let lastElement = this[this.length-1];
    return smallerArray.join(seperator1)+seperator2+lastElement;
};
Array.prototype.copy = function() {
    let a = new Array(this.length);
    for (let i = 0; i < this.length; i++) a[i] = this[i];
    return a;
};
Array.prototype.fillWithArray = function(a) {
    for (let i = 0; i < this.length; i++) this[i] = a.copy();
    return this;
};
Array.prototype.findString = function(string) {
    let min = Infinity;
    let minIndex = null;
    for (let i = 0; i < this.length; i++) {
        let dist = string.lDist(this[i]);
        if (dist < min) {
            min = dist;
            minIndex = i;
        }
    }
    return {min: min, minIndex: minIndex};
};
String.prototype.lDist = function(string) {
    let m = new Array(this.length+1).fillWithArray(new Array(string.length+1));
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (y == 0) m[y][x] = x;
            else if (x == 0) m[y][x] = y;
            else if (this[y-1] == string[x-1]) m[y][x] = m[y-1][x-1];
            else m[y][x] = Math.min(m[y-1][x-1], m[y-1][x], m[y][x-1])+1;
        }
    }
    return m[this.length][string.length];
};
JSON.copy = function(e) {
    return JSON.parse(JSON.stringify(e));
};