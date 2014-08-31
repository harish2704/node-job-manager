var JobManager = require('../src/JobManager.js').JobManager;
var utils = require('../src/utils.js');
var range = utils.range;

var wrks = range(400000);
wrks.forEach( function(v,k){
    wrks[k] = function(data,cb){
        var self = this;
        process.nextTick(function(){
            // console.log( 'I am done: ', v );
            cb( null, data);
        } );
    };
    wrks[k].id = v;
});

var tStart = 0;
var getTasks = function(){
    var i, out=[];
    for( i = 0; i< 1000; i++, tStart++ ){
        out[i] = tStart;
    }
    return out;
};

var tasks = getTasks();

var jm = new JobManager({concurrency:3});
jm.tasks = tasks;
jm.workers = wrks;
jm.onError = function(err, task, worker ){
    console.log( 'Error...', arguments );
};

jm.work = function(task, worker, cb){
    // console.log( 'Worker ', worker.id, ' with ', task );
    return worker( task, cb );
};
jm.onLoadMore = function( cb ){
    console.log( 'Loading......');
    this.tasks = this.tasks.concat( getTasks() );
    return cb();
};
jm.start();
