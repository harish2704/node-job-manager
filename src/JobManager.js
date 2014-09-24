// ഓം  നമോ നാരായണായ 

var utils = require('./utils');

var STATE = utils.createEnum([ 'RUNNING' , 'NOT_RUNNING']);

function JobManager(opts){

    //opts
    this.notifyAt = opts.notifyAt|| 3;
    this.concurrency = opts.concurrency || 20;
    this.minConcurrency = opts.minConcurrency != null ? opts.minConcurrency : 2;

    // state
    this.state = STATE.NOT_RUNNING;

    this.workers = [];
    this.tasks = [];
    this.work = null;
    this.onLoadMore = null;
    this.onError = null;
    this.isLoadingTakingPlace = false;
    this.endReached = false;
    this.runningTasks = 0;
    this.tmpPoolLen=0;
    this.tmpPool = [];
}
/*
 * JobManager.prototype.__defineSetter__( 'workers', function(workers){
 *     this.$workers = workers;
 *     this.updateState();
 * });
 */

JobManager.prototype.updateState = function(){
    this.updateTmpPool( this.concurrency );
};

JobManager.prototype.updateTmpPool = function(newVal){
    if( newVal > this.tmpPoolLen ){
        var tmpPool = this.tmpPool;
        var additionalPoolBlocks = Math.ceil( ( newVal - this.tmpPoolLen )/this.workers.length ), i;
        for( i=0; i < additionalPoolBlocks; i++){
            tmpPool = tmpPool.concat( this.workers );
        }
        this.tmpPoolLen += additionalPoolBlocks * this.workers.length ;
        this.tmpPool = tmpPool;
    }
};

JobManager.prototype.setConcurrency = function( newVal ){
    if( newVal > this.minConcurrency ){
        this.updateTmpPool(newVal);
        this.concurrency = newVal;
    }
};

/*
 * JobManager.prototype.__defineGetter__( 'workers', function(){
 *     return this.$workers;
 * });
 */

JobManager.prototype.returnToPool = function (w){
    this.runningTasks--;
    this.tmpPool.push( w );
};

JobManager.prototype.getFromPool = function(){
    if( this.runningTasks < this.concurrency ){
        this.runningTasks++;
        return this.tmpPool.splice(0,1)[0];
    }
};

JobManager.prototype.$doWork_ = function( cb ){
    var self = this;
    var task = self.tasks.splice(0, 1)[0];
    if( task == undefined ){
        this.stop();
        return;
    }
    var worker = self.getFromPool();
    this.work( task, worker, function(err){
        if(err && self.onError ){
            self.onError(err, task, worker );
        }
        if(self.tasks.length/self.concurrency < self.notifyAt && (!self.isLoadingTakingPlace) ){
            if( self.onLoadMore && !self.endReached ) {
                self.$onLoadMore();
            }
        }
        if( self.state == STATE.NOT_RUNNING  ){
            if( ( self.runningTasks == 1 ) &&  self.onStopped ) { self.onStopped(); }
        }
        self.returnToPool( worker );
        cb();
    });
};


JobManager.prototype.$trigger = function (){
    var self = this;
    while( this.runningTasks < this.concurrency && this.state == STATE.RUNNING ){
        this.$doWork_( function(){
            self.$trigger();
        });
    }
};

JobManager.prototype.start = function( ) {
    this.state = STATE.RUNNING;
    this.updateState();
    var self = this;
    if( this.tasks.length ) {
        return this.$trigger();
    }
    return this.$onLoadMore( function(){
        self.$trigger();
    });
};

JobManager.prototype.$onLoadMore = function( cb ){
    cb = cb || function(){};
    var self = this;
    self.isLoadingTakingPlace = true;
    self.onLoadMore(function(){
        self.isLoadingTakingPlace = false;
        return cb();
    });
};

JobManager.prototype.pause = function(){
    this.state = STATE.NOT_RUNNING;
};

JobManager.prototype.stop = function(){
    this.state = STATE.NOT_RUNNING;
};


JobManager.prototype.resume = function(){
    this.start();
};

exports.JobManager = JobManager;
