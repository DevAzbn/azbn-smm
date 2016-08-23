/*
вынесенная функция
*/

function _(azbn, msg) {
	this.name = 'tg_on_message_reload_servers';
	var log_name = this.name;
	
	var resp = 'CMD response:';
	
	var child_process = require('child_process');
	var reload = child_process.spawn('/root/sh/reload_servers.sh', []);
	
	reload.stdout.on('data', function(data){
		//console.log(`stdout: ${data}`);
		resp = resp + '\n' + data;
	});
	
	reload.stderr.on('data', function(data){
		//console.log(`stderr: ${data}`);
		resp = resp + '\n' + data;
	});
	
	reload.on('close', function(code){
		//console.log(`child process exited with code ${code}`);
		resp = resp + '\n' + 'Child process exited with code' + code;
		
		azbn.mdl('tg').sendMessage(msg.chat.id, resp, {
			reply_to_message_id : msg.message_id,
			caption: 'Child process exited',
		});
	});
	
	azbn.echo(msg.text, log_name);
}

module.exports = _;