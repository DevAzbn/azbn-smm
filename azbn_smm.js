'use strict';
/*
Примерный файл подключения AzbNode
*/
var cfg = {
	'path' : {
		'azbnode' : './azbnode',
		'app' : './component',
	}
};

var azbn = require(cfg.path.azbnode + '/azbnode');

azbn.load('azbnodeevents', new require(cfg.path.azbnode + '/azbnodeevents')(azbn));
azbn.event('loaded_azbnode', azbn);


//парсинг параметров командной строки
azbn.parseArgv();
azbn.event('parsed_argv', azbn);

//cfg.path.subapp = azbn.getArgv('root')||cfg.path.subapp;

azbn.load('fs', require('fs'));
//azbn.load('querystring', require('querystring'));
//azbn.load('path', require('path'));
azbn.load('url', require('url'));
//azbn.load('vow', require('vow'));

azbn.load('cfg', require(cfg.path.app + '/config'));
azbn.load('mysql', require(cfg.path.app + '/mysql'));
azbn.load('tg', require(cfg.path.app + '/telegrambot'));
azbn.load('vk', require(cfg.path.app + '/vk'));

var NeDB = require('nedb');
azbn.load('nedb.log', new NeDB({filename : 'log/nedb.log'}));
azbn.mdl('nedb.log').loadDatabase();

azbn.event('loaded_mdls', azbn);

/* --------- Код здесь --------- */

//azbn.echo(azbn.mdl('cfg').vk.appId);

azbn.mdl('nedb.log').insert({
	created_at : azbn.now(),
	type : 'bot.start',
});

azbn.mdl('mysql').connect(function(err){
	
	if(err) {
		
		azbn.echo('Could not connect to mysql');
		
	} else {
		
		azbn.echo('DB is connected');
		
		var Antigate = require('antigate');
		azbn.load('ag', new Antigate(azbn.mdl('cfg').antigate_key));
		
		var vks = require(cfg.path.app + '/vkstream');
		var vks2 = require(cfg.path.app + '/vkstream');
		var vks3 = require(cfg.path.app + '/vkstream');
		azbn.load('vkstream', vks.set(azbn));
		azbn.load('vkstream2', vks2.set(azbn));
		azbn.load('vkstream3', vks3.set(azbn));
		
		
		azbn.mdl('mysql').query("SELECT * FROM `" + azbn.mdl('cfg').dbt.vk_app + "` WHERE 1 ORDER BY id", function(err, rows, fields) {
			
			if (err) {
				
				azbn.echo('Error on load VK-apps: ' + err);
				
			} else if(rows.length == 0) {
				
				azbn.echo('No VK-apps in DB!');
				
			} else {
				
				for(var i = 0; i < rows.length; i++){
					
					var a = rows[i];
					azbn.mdl('cfg').vk_app[a.id] = a;
					
				}
				
				azbn.echo('Init VK-apps from DB');
				
				var INTV = require(cfg.path.app + '/intervals');
				azbn.load('intervals', new INTV(azbn));
				
				//clear('load_vk_app');
				
			}
			
		});
		
		
		azbn.mdl('tg').getMe().then(function(me) {
			
			azbn.mdl('nedb.log').insert({
				created_at : azbn.now(),
				type : 'bot.tg.getMe',
			});
			
			require(cfg.path.app + '/require/telegram/tg_getMe')(azbn, me);
			
			azbn.mdl('tg').sendMessage(-107139655, 'Бот ' + me.username + ' в сети', {
				//reply_to_message_id : msg.message_id,
				caption: 'Подключение к Телеграму',
			});
			
		});
		
		azbn.mdl('tg').on('message', function (msg) {
			require(cfg.path.app + '/require/telegram/tg_on_message')(azbn, msg);
		});
		
	}
});

azbn.regEvent('vk_error', 'rootfile', function(prm){
	prm.created_at = Math.floor(azbn.now() / 1000);
	prm.error_code = prm.error.error_code;
	prm.error = JSON.stringify(prm.error);
	
	azbn.mdl('mysql').query("INSERT INTO `" + azbn.mdl('cfg').dbt.vk_error + "` SET ? ", prm, function(err, result) {
		if(result.insertId) {
			azbn.echo('vk_error #' + result.insertId);
		} else {
			
		}
	});
	
});

/*
azbn.mdl('vkstream')
	.add(function(next){
		azbn.echo('2 ' + azbn.now());
		next();
	})
	.add(function(next){
		azbn.echo('3 ' + azbn.now());
		next();
	}, 3000)
	;
*/

/*

https://github.com/dfilatov/vow-fs
http://catethysis.ru/node-js-vow/
http://catethysis.ru/express-node-js/





function readFile(filename, encoding) {
	var promise = Vow.promise();
	fs.readFile(filename, encoding, function(err, data) {
		if (err) return promise.reject(err);
		promise.fulfill(data);
	});
	return promise;
}
Vow.all([readFile('test1.txt', 'utf8'), readFile('test2.txt', 'utf8')]).then(function(results) {
	console.log(results.join('\n'));
});





var vow = require('vow');
var semaphore1 = vow.promise();
var semaphore2 = vow.promise();

//В одной асинхронной функции
semaphore1.fulfill(0);

//В другой асинхронной функции
semaphore2.fulfill(0);

vow.all([semaphore1,semaphore2]).then(function(value) {
	//обработка
});




var file_read = vow.promise();
var sql_select = vow.promise();

fs.readFile('template.htm', function (err,page){ file_read.fulfill(String(page)); });

connection.query('select * form table;', function(fields, result) {
	sql_select.fulfill(photos);
});

vow.all([file_read, sql_select]).spread(function (page, photos) {
	//конечно, за кадром осталась работа с шаблоном и данными - она не нужна
	//для демонстрации. Примем, что мы как бы просто склеиваем две этих строки.
	res.end(page+photos);
});



*/

/* --------- /Код здесь --------- */

azbn.event('eval_script', azbn);