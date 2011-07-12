var fs    = require('fs'),
    mtime = require('microtime');

var test = function(options) {
  this.shouldSeed = options.seed;
  this.iterations = options.iterations;
  this.ksize = options.ksize;
  this.value = '';
  var i = 0;
  for (i=0; i < options.vsize; i++) {
    this.value = this.value + '1';
  }
}

test.prototype.keypad = function (number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}


test.prototype.seed = function(store, should, callback) {
  var self = this;

  if (should !== true) {
    callback();
  }
  (function recurse(i) {
    var k = self.keypad(i, self.ksize);
    store.set(k, self.value, 0, function(err, res) {
      if (i < self.iterations) {
        recurse(i+=1);
      } else {
        callback();
      }
    });
  })(0);
}

test.prototype.randomKey = function() {
  return Math.floor(Math.random() * (this.iterations+1));
}

test.prototype.stats = function(ar) {
  var stats = [0,0,0,0,0]; // COUNT, AVG, LONGEST, 75, 95, 99

  ar.sort(function (a,b) { return a - b; });
  var sum = 0, i, len = ar.length;
  for (i = 0; i < len; i++) {
    sum += ar[i];
  }
  stats[0] = (len/60).toFixed(3); // OPS
  stats[1] = len ? (sum / len).toFixed(3) : 0.0; // AVG
  stats[2] = ar[len]; // LONGEST
  stats[3] = ar[Math.round(len*0.75)]; // 75
  stats[4] = ar[Math.round(len*0.95)]; // 95
  stats[5] = ar[Math.round(len*0.99)]; // 99
  return stats;
}

test.prototype.run = function(store, file, callback) {
  var data = [];
  var minute = null;
  var self = this;

  this.seed(store, this.shouldSeed, function() {

    (function recurse(key, i) {
      var start = mtime.nowStruct()[1];
      store.get(key, function(err, res) {
        var t = mtime.nowStruct();
        if (minute && minute >= t[0]) {
          var v = (t[1]-start)/1000;
          if (v < 0) { v = 0.001; } // XXX
          data.push(v);
        } else if (minute) {
          var s = self.stats(data);
          console.log(t[0] + '\t' + s.join('\t'));
          file.write(t[0] + '\t' + s.join('\t') + '\n');
          minute = t[0] + 60;
          data = [];
        } else {
          minute = t[0] + 60;
        }
        var k = self.keypad(i, self.ksize);
        if (i < self.iterations && k !== undefined) {
          recurse(k, i+=1);
        } else {
          callback();
        }
      });
    })(self.keypad(0, self.ksize), 1);

  });
}

exports.test = test;
