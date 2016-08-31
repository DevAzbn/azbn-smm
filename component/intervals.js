/*
приложение вконтакте
*/

var intr = {
	
}

function intervals(azbn) {
	this.name = 'BotIntervals';
	var log_name = this.name;
	
	this.add = function(id, time, fnc) {
		intr[id] = setInterval(fnc,time || 1000);
	}
	
	this.clear = function(id) {
		clearInterval(intr[id]);
	}
	
	this.add('addvkfr_check', 30000, function(){
		require('./require/intervals/addvkfr_check')(azbn);
	});
	
	this.add('addvkfr_check', 30 * 60000, function(){
		require('./require/intervals/userinfo_check')(azbn);
	});
	
	require('./require/intervals/myprofile_check')(azbn);
	this.add('myprofile_check', 10 * 60000, function(){
		require('./require/intervals/myprofile_check')(azbn);
	});
	
	require('./require/intervals/friendrecent_check')(azbn);
	this.add('friendrecent_check', 10 * 60000, function(){
		require('./require/intervals/friendrecent_check')(azbn);
	});
	
	require('./require/intervals/invite2gr_load')(azbn);
	this.add('invite2gr_load', 86400000 / 4, function(){
		require('./require/intervals/invite2gr_load')(azbn);
	});
	
	this.add('invite2gr_send', 30000, function(){
		require('./require/intervals/invite2gr_send')(azbn);
	});
	
	this.add('unaddvkfr_send', 30000, function(){
		require('./require/intervals/unaddvkfr_send')(azbn);
	});
	
	this.add('telegrambot_notify', 30000, function(){
		require('./require/intervals/telegrambot_notify')(azbn);
	});
	
}

module.exports = intervals;