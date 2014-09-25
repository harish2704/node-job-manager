node-job-manager
================

JobManager is a multipurpose, flexible, asynchronous queue manager class written in Nodejs. Queue is processed using given workers. It is possible to change concurrency and load bulk tasks at run time. See demo for better understanding

Overview
--------
### A JobManager instance need the following informations to get started. They are,
* ```workers```: An array of worker instances that are used to do the work.
* ```onLoadMore```: A function that tells how to retrieve tasks that need to processed with workers.
* ```work```: a function that does the real task. It is called with following syntax: worker( task, worker, cb ). task and worker are are belongs to the available tasks and workers. cb is the callback function that should be called after work is done.
* ```onError```: A function that is called when a Error is occurred during 'work' function. it is called with following syntax: onError(err, task, worker);
* ```onStopped```: A function that is called when all tasks are processed.


### JobManager instance is controlled by the following configuration options
* ```concurrency```: An integer that tells how many workers should be run a time. Note that, concurrency cab be higher than no.of workers. In this case, one worker may be used to process more than one task at a time.
* ```minConcurrency```: An integer. concurrency can not be decreased below this value.
* ```notifyAt```: if ( no.tasks/concurrency < notifyAt ), onLoadMore function is called to fetch more tasks.
* ```endReached```: A Boolean. if it is set to true, onLoadMore will not be called further. and thus, execution of JobManager will stop after processing all the currently available tasks.
* ```setConcurrency```: A function that is used to change concurrency at runtime.

### Following variables reveals current state of JobManager instance.
* ```state```: NOT_RUNNING | RUNNING.
* ```isLoadingTakingPlace```: onLoadMore function is taking place.

Usage
-----
```javascript
var JobManager = require('job-manager').JobManager;
var jm = new JobManager({ configuration options});
jm.workers = workers;
jm.onLoadMore = function(cb){// code; if( !tasks ){ this.endReached = true; }  cb()}
jm.work = function(task, worker,cb){ // worker.process( task, cb ); }
jm.onError = function( err, task, worker){ // log( err,  task, worker ); }
jm.onStopped = function(){ // log('Finished'); cb(); }
jm.start();
// jm.stop();
```

Demo
----
 A pure javascript demo at http://harish2704.github.io/jobmanager-demo/test.html will give a more cleat idea. This demo uses the same JobManager class to do the animation.


Self promotion
--------------
* I am a javascript freelancer. You can hire me.
* star my repos.

