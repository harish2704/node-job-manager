/*global describe, it, before, beforeEach, after, afterEach, should  */

var JobManager = require('../src/JobManager.js').JobManager;
var utils = require('../src/utils.js');
var should = require('should');

var NO_WORKERS = 5;
var workers = [], i;
for ( i = 0; i < NO_WORKERS; i ++) {
    workers[i] = function( data, cb ){
        console.log(i, ' Processing ', data );
        setTimeout( function(){
            console.log( 'Iam ', i, ' Processed ', data );
        }, i*10 );
    };
    workers[i].name = i;
}
var NO_TASKS=100;

var tasks = utils.range( NO_TASKS );

var TEST_CONCURENCY = 3;

describe('JobManager', function(){

    describe('Initialization', function(){
        var jm = new JobManager( { concurrency: TEST_CONCURENCY });
        jm.work = function( task, worker, cb ){
            worker( task , cb );
        };
        jm.workers = workers;
        jm.tasks = tasks;
        jm.onError = function(err, task, worker ){
            console.log( 'Error...', arguments );
        };
        jm.onLoadMore = function( cb ){
            console.log( 'Loading......');
            this.tasks = this.tasks.concat( tasks );
            return cb();
        };
        it('should Initialize properly', function(done){
            jm.concurrency =  jm.workers.length -1;
            jm.updateState();
            jm.tmpPool.should.have.length(NO_WORKERS);
            jm.concurrency =  jm.workers.length +1;
            jm.updateState();
            jm.tmpPool.should.have.length(NO_WORKERS*2);

            jm.tasks.should.have.length( NO_TASKS );
            jm.workers.should.have.length( NO_WORKERS );
            jm.runningTasks.should.be.equal(0);
            done();
        });

        it('getFromPool, returnToPool', function(done){
            var store = [], i, w;
            for( i =0; i< jm.concurrency; i++ ){
                w = jm.getFromPool();
                jm.runningTasks.should.be.equal( i+1);
                should.exist( w );
                store.push(w);
            }
            for( i =0; i< 6; i++ ){
                w = jm.getFromPool();
                jm.runningTasks.should.be.equal( jm.concurrency );
                should.not.exist( w );
            }
            store.forEach( function(v, i){
                jm.returnToPool(v);
                jm.runningTasks.should.be.equal( jm.concurrency-i-1 );
            });
            jm.runningTasks.should.be.equal( 0 );
            done();
        });
    });
});
