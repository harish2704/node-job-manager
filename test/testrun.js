var JobManager = require('../src/JobManager.js').JobManager;
var utils = require('../src/utils.js');
var range = utils.range;
var async = require('async');

var wrks = range(4);
wrks.forEach( function(v,k){
    wrks[k] = function(data,cb){
        console.log( 'S ', data );
        setTimeout( function(){ 
            console.log( 'E ', data );
            cb();
        } , ( 1 ) * 1000 );
    };
    wrks[k].id = v;
});

var tStart = 0;
var getTasks = function(){
    var i, out=[];
    for( i = 0; i< 50; i++, tStart++ ){
        out[i] = tStart;
    }
    return out;
};

var tasks = getTasks();
if(0){
    console.log( tasks.length );
    var y = 0;
    async.eachLimit( tasks, 300, function( data, cb ){
        setTimeout( function(){ 
            console.log( data );
            cb();
        } , 1);
    }, console.log );

    return;
}

var jm = new JobManager({concurrency: 6});
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
// jm.start();
jm._start();
