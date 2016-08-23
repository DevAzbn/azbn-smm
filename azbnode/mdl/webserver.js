/*
простой html-сервер
*/

//var util = require('util');
var fs = require('fs');
var url = require("url");
//var querystring = require("querystring");
var http = require("http");
var domain = require("domain").create();
var server;
var file_exists = {};

var parse_addr = function(str, azbn, actions) {
	var path_arr = str.split('/');
	var last = actions;
	path_arr.forEach(function(item, i, arr) {
		if(i > 0) {
			
			if(azbn.is_def(last[item]) && azbn.is_func(last[item]['default'])) {
				last = last[item];
			} else if(item == '') {
				
			} else {
				//last = actions.error;
			}
		}
	});
	return last;
}

domain.on('error',function(err){
	console.error("%s", err);
});

domain.run(function(){
	server = new http.Server();
});

function WebServer(azbn, config, actions) {
	var tag = 'AzbNodeWebServer';
	
	azbn.echo('Server created.', tag);

	server.on('request', function(req,res){
		
		req.setEncoding("utf8");
		
		var urlobj = url.parse(req.url, true);
		
		if(urlobj.pathname == '/') {
			urlobj.pathname = config.index;
		}

		if(urlobj.pathname!=="/favicon.ico") {
			azbn.echo(urlobj.pathname + ' // Memory ' + process.memoryUsage().heapUsed, tag);
		}
		
		//switch(urlobj.pathname) { case '/favicon.ico':{}break; default: {}break;}
		
		var fname = azbn.mdl('path').normalize(config.path.app + config.path.root + urlobj.pathname);
		var urlfnc = parse_addr(urlobj.pathname, azbn, actions);

		if(file_exists[urlobj.pathname] || fs.existsSync(fname)) {
			
			file_exists[urlobj.pathname]=true;
			res.writeHead(200, {
				"Cache-control": "public",
			});
			var file = new fs.ReadStream(fname);
			file.pipe(res);

		} else if(azbn.is_def(urlfnc) && azbn.is_func(urlfnc.default)) {
			
			urlfnc.default({
				req : req,
				res : res,
				azbn : azbn,
				config : config,
				urlobj : urlobj,
			});

		} else {
			
			if(fs.existsSync(config.path.app + config.root + config.page404)) {
				
				res.writeHead(200, {
					"Cache-control": "no-cache, no-store",
					"Content-Type": "text/html",
				});

				var file = new fs.ReadStream(config.path.app + config.root + config.page404);
				file.pipe(res);
				
			} else {
				
				res.writeHead(404, {
					"Content-Type": "text/plain",
				});
				res.end("Page " + urlobj.pathname + " not found");
				
			}

		}

	});

	server.listen(config.port);

	this.server = server;

	azbn.echo('Port ' + config.port + ' is listening.', tag);
}

module.exports = WebServer;