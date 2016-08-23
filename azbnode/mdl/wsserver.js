/*
простой web-socket-сервер
*/

function WSServer(azbn, config) {

	azbn.echo("WSServer created.");

	var wss = new require("ws");
	var domain = require("domain").create();
	var server;
	var clients = {};

	domain.on('error',function(err){
		console.error("WS %s", err);
	});

	domain.run(function(){
		server = new wss.Server({port: config.wsport});
		});

	server.on('connection', function(ws) {
		var id = Math.random();
		clients[id] = ws;
		azbn.echo("новое соединение " + id);
		
		ws.on('message', function(message) {
			azbn.echo('получено сообщение от ' + id + ': ' + message);
			for(var key in clients) {
				clients[key].send(message);
			}
		});

		ws.on('close', function() {
			azbn.echo('соединение закрыто ' + id);
			delete clients[id];
		});
	});

	this.server = server;

	azbn.echo("WSPort is listening.");
}

module.exports = WSServer;
