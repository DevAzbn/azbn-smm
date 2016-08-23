/*
обработчик задач по порядку поступления
*/
var util = require('util'),
	EventEmitter = require('events').EventEmitter;
var	tasks = [];
var azbn;
var taskStream = function(_azbn){
	this.o = this;
};

util.inherits(taskStream, EventEmitter);

var stream = new taskStream();

stream.name = 'taskStream';
stream.in_action = false;

var log_name = stream.name;

stream.add = function(t, __sleep_time) {
	tasks.push({task : t, sleep_time : __sleep_time || 100});
	stream.emit('task:add');
	return stream;
}

stream.run = function(task) {
	stream.emit('task:start');
	var ok = function(msg) {
		if(msg) {
			console.log(msg);
		}
		stream.emit('task:end');
	};
	azbn.sleep(task.sleep_time);
	task.task(ok);
}

stream.set = function(_azbn) {
	azbn = _azbn;
	return stream;
}

stream.on('task:add', function(){
	if(tasks.length) {
		while(stream.in_action) {
			
		}
		stream.run(tasks.shift());
	}
});
stream.on('task:start', function(){
	stream.in_action = true;
});
stream.on('task:end', function(){
	stream.in_action = false;
});

module.exports = stream;
