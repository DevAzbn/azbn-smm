/*
получение данных о пользователях
*/

function _(azbn) {
	this.name = 'userinfo_check';
	var log_name = this.name;
	
	var app_id = 1;
	
	var ds = Math.floor(azbn.now() / 1000);
	var dl = ds - 86400;
	
	azbn.mdl('mysql').query(
		"SELECT * " +
		"FROM `" +
			azbn.mdl('cfg').dbt.userinfo + "` " +
		"WHERE (lastact < '" + dl + "') " +
		"ORDER BY lastact",
		
		function(err, rows, fields) {
		if (err) {
			
			azbn.echo('Error while performing Query. ' + err, log_name);
			
		} else if(rows.length == 0) {
			
			azbn.echo('No rows for action', log_name);
			
		} else {
			
			azbn.echo('Rows for update: ' + rows.length, log_name);
			
			var str = '';
			var str_arr = [];
			
			rows.forEach(function(h){
				
				str_arr.push(h.user_id);
				
			});
			
			str = str_arr.join(',');
			
			azbn.mdl('mysql').query("SELECT * FROM `" + azbn.mdl('cfg').dbt.vk_token + "` WHERE (app_id = '" + app_id + "') ORDER BY RAND() LIMIT 1", function(_err, _rows, _fields) {
				if (_err) {
					
					//azbn.echo('Error while performing Query. ' + err, log_name);
					
				} else if(_rows.length == 0) {
					
					//azbn.echo('No rows for action', log_name);
					
				} else {
					
					//azbn.echo('Rows for update: ' + rows.length, log_name);
					
					_rows.forEach(function(h){
						
						var vk = require('./../../vk')(azbn, h.app_id);
						
						vk.setToken(h.access_token);
						
						vk.request('users.get', {'user_ids' : str , fields :'sex,city,country,photo_100,photo_200_orig,photo_200,photo_400_orig,photo_max,photo_max_orig,photo_id,last_seen,screen_name,counters' }, function(resp) {
							
							if(azbn.is_def(resp.error) && !azbn.is_null(resp.error)) {
								
								azbn.event('vk_error', {
									error : resp.error,
									user_id : h.user_id,
								});
								
							} else {
								
								resp.response.forEach(function(user){
									
									var p = JSON.stringify(user);
									
									if(rows.length == 1) {
										var item = {
											created_at : ds,
											user_id : user.id || 0,
										};
										
										if(user.counters.friends) {
											item.counters_friends = user.counters.friends;
										} else {
											item.counters_friends = 0;
										}
										
										if(user.counters.followers) {
											item.counters_followers = user.counters.followers;
										} else {
											item.counters_followers = 0;
										}
										
										if(user.counters.subscriptions) {
											item.counters_subscriptions = user.counters.subscriptions;
										} else {
											item.counters_subscriptions = 0;
										}
										
										azbn.mdl('mysql').query("INSERT INTO `" + azbn.mdl('cfg').dbt.userhistory + "` SET ? ", item, function(err, result) {
											if(result.insertId) {
												azbn.echo('[ Inserted counters for user #' + user.id + ' ]', log_name);
											} else {
												azbn.echo('[ Error on inserting counters for user #' + user.id + ' ]', log_name);
											}
										});
									}
									
									azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.userinfo + "` SET lastact = '" + ds + "', p = '" + p + "' WHERE user_id = '" + user.id + "'", function (err, uresult) {
										azbn.echo('[ Updated info for user #' + user.id + ' ]', log_name);
									});
									
								});
								
							}
							
						});
						
					});
					
				}
			});
			
		}
	});
	
	//azbn.echo(azbn.now() / 1000, log_name);
}

module.exports = _;