var fs   = require('fs'),
    sys  = require('sys'),
    util = require('util'),
    exec = require('child_process').exec;

exports.mgrstart = function(options, callback) {

  var store_module = require('./stores/' + options.store + '.js'),
      test_module  = require('./tests/' + options.test + '.js');

  var store = new store_module.store(options),
      test  = new test_module.test(options);

  var t = new Date();
  var dir = options.dir + '/sstat-' + options.test + '-' + t.getTime();

  fs.mkdir(dir, '0755', function() {
    console.log("Logs in " + dir);
    store.connect(function(){
      test.seed(store, options.seed, function() {
        var i = 0;
        for(i=0; i < options.processes; i++) {
          var e = [];
          e.push(process.execPath);
          e.push(__dirname + '/../bin/sstat-wrk');
          e.push('--ip ' + options.ip);
          e.push('--port ' + options.port);
          e.push('--test ' + options.test);
          e.push('--store ' + options.store);
          e.push('--iterations ' + options.iterations);
          e.push('--ksize ' + options.ksize);
          e.push('--dir ' + dir); 
          e.push('--id ' + i);
          e.push('--seed false');

          if (options.verbose) { console.log(e.join(' ')); }
          child = exec(e.join(' '), function (error, stdout, stderr) {
            if (error !== null) {
              console.log('Worker: ' + i + ': ' + error);
            }
          });
        }
      });

    });
  });

};

exports.wrkstart = function(options, callback) {
  var store_module = require('./stores/' + options.store + '.js'),
      test_module  = require('./tests/' + options.test + '.js');

  var store = new store_module.store(options),
      test  = new test_module.test(options);

  store.connect(function(){
    var f = options.dir + '/' + options.id + '.log';

    var file = fs.createWriteStream(f, {'flags': 'w+'});

    test.run(store, file, function() {
      console.log("Test complete. Writing to " + f);
    });

  });
}
