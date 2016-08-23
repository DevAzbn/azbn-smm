/*
обработчик задач по порядку поступления
*/

var child_process = require('child_process');
var azbn;

var cmdProcess = function(_azbn) {
	this.ctrl = this;
	azbn = _azbn;
};

cmdProcess.runTask = function(cmd, events) {
	var task;
	if(process.platform === 'win32') {
		task = child_process.spawn('cmd', ['/c', 'dir'].concat(cmd.param));//'cmd', ['/c', 'dir']
	} else {
		task = child_process.spawn(cmd.line, cmd.param);//'/root/sh/reload_servers.sh', []
	}
	
	if(events.onOut) {
		task.stdout.on('data', events.onOut);
	}
	
	if(events.onError) {
		task.stderr.on('data', events.onError);
	}
	
	if(events.onClose) {
		task.on('close', events.onClose);
	}
	
	//task.on('error', function() {console.log(arguments);});
};

module.exports = cmdProcess;
