var nMemcached = require('memcached');

var store = function(options) {
  this.ip = options.ip;
  this.port = options.port;
  this.client = new nMemcached(this.ip + ':' + this.port);
};

store.prototype.connect = function(callback) {
  this.client.connect(this.ip + ':' + this.port, function() {
    callback();
  });
  //callback();
};

store.prototype.get = function(key, callback) {
  this.client.get(key, function(err, res) {
    callback(err, res);
  });
};

store.prototype.set = function(key, value, ttl, callback) {
  this.client.set(key, value, ttl, function(err, res) {
    callback(err, res);
  });
};

store.prototype.close = function() {
  this.client.end();
};

exports.store = store;
