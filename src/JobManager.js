// ഓം  നമോ നാരായണായ 

var utils = require('./utils');

var STATE = utils.createEnum(['INITIALIZING', 'INITIALIZED', 'STARTED', 'RUNNING', 'PAUSING', 'PAUSED', 'STOPPED']);

function JobManager(opts){

    //opts
    this.notifyAt = opts.notifyAt|| 3;
    this.concurrency = opts.concurrency || 20;
    
    // state
    this.state = STATE.INITIALIZED;

    this.workers = [];
    this.tasks = [];
    this.work = null;
    this.onLoadMore = null;
    this.onError = null;
    this.isLoadingTakingPlace = false;
    this.tmpPool = [];
}
JobManager.prototype.__defineSetter__( 'workers', function(workers){
    var tmpPool = Array( workers.length > this.concurrency? workers.length : this.concurrency ), i, l, j;
    this.$workers = workers;
    if(! tmpPool.length ){
        return;
    }
    for( i = 0, j=0, l = tmpPool.length; i< l; i++, j++ ){
        if(j == workers.length ){ j =0; }
        tmpPool[i] = workers[j];
    }
    this.tmpPool = tmpPool;
});

JobManager.prototype.__defineGetter__( 'workers', function(){
    return this.$workers;
});

JobManager.prototype.returnToPool = function (w){
    this.tmpPool.push(w);
};

JobManager.prototype.$doWork = function( task, worker, cb ){
    var self = this;
    this.work( task, worker, function(err){
        if(err){
            self.onError(err, task, worker );
        }
        self.returnToPool( worker );
        return cb();
    });
};

JobManager.prototype.getFromPool = function(){
    return this.tmpPool.splice(0,1)[0];
};



JobManager.prototype.start = function( ){
    var self = this;
    var tasks, workers=[], i;
    if ( this.state != STATE.INITIALIZED ){
        throw new Error('Invalid state', STATE.INITIALIZED );
    }
    this.state = STATE.RUNNING;
    var numOfTasks = self.concurrency;
    if( numOfTasks > self.tasks.length ){
        numOfTasks = self.tasks.length;
    }
    tasks = self.tasks.splice(0,numOfTasks);
    for(i=0; i< numOfTasks; i++){
        workers.push( self.getFromPool() );
    }
    tasks.forEach(function(task, i){
        var worker = workers[i];
        var cb = function(){
            var i,l;
            if(self.tasks.length/self.concurrency < self.notifyAt && (!self.isLoadingTakingPlace) ){
                if( self.onLoadMore ) {
                    self.isLoadingTakingPlace = true;
                    self.onLoadMore(function(){
                        self.isLoadingTakingPlace = false;
                    });
                }
            }
            if(self.state != STATE.RUNNING ){
                return;
            }
            var nextTask = self.tasks.splice(0,1)[0];
            if (!nextTask){
                self.state = STATE.STOPPED;
                return;
            }
            // console.log( 'lastUsed', self.lastUsedWorker );
            self.$doWork( nextTask, self.getFromPool(), cb );
        };
        self.$doWork( task, worker, cb );
    });
};

JobManager.prototype.pause = function(){
    this.state = STATE.PAUSED;
};

JobManager.prototype.resume = function(){
    this.state = STATE.INITIALIZED;
    this.start();
};

exports.JobManager = JobManager;
