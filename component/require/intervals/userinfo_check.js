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
				if (err) {
					
					//azbn.echo('Error while performing Query. ' + err, log_name);
					
				} else if(rows.length == 0) {
					
					//azbn.echo('No rows for action', log_name);
					
				} else {
					
					//azbn.echo('Rows for update: ' + rows.length, log_name);
					
					_rows.forEach(function(h){
						
						var vk = require('./../../vk')(azbn, h.app_id);
						
						var __req = {'user_ids' : str , fields :'sex,city,country,photo_100,photo_200_orig,photo_200,photo_400_orig,photo_max,photo_max_orig,photo_id,last_seen,screen_name' };
						
						vk.request('users.get', __req, function(resp) {
							
							/*
							azbn.mdl('nedb.log').insert({
								created_at : azbn.now(),
								type : 'bot.vk.request',
								user_id : h.user_id,
								method : 'users.get',
								req : __req,
								resp : resp,
							});
							*/
							
							if(azbn.is_def(resp.error) && !azbn.is_null(resp.error)) {
								
								azbn.event('vk_error', {
									error : resp.error,
									user_id : h.user_id,
								});
								
							} else {
								
								resp.response.forEach(function(user){
									
									var p = JSON.stringify(user);
									
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