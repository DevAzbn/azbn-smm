/*
добавление новых друзей
*/

function _(azbn) {
	this.name = 'friendrecent_check';
	var log_name = this.name;
	
	var app_id = 1;
	
	var ds = Math.floor(azbn.now() / 1000);
	var dl = ds - 1200;
	
	azbn.mdl('mysql').query(
		"SELECT `" +
			azbn.mdl('cfg').dbt.vk_token + "`.id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.app_id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.user_id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.access_token, `" +
			azbn.mdl('cfg').dbt.addvkfr + "`.lastact " +
		"FROM `" +
			azbn.mdl('cfg').dbt.vk_token + "`, `" +
			azbn.mdl('cfg').dbt.addvkfr + "` " +
		"WHERE 1 " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.addvkfr + "`.lastact < '" + dl + "') " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.stop_at > '" + ds + "') " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.user_id = `" + azbn.mdl('cfg').dbt.addvkfr + "`.user_id) " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.app_id = '" + app_id + "') " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.addvkfr + "`.status = '1') " +
		"ORDER BY `" +
			azbn.mdl('cfg').dbt.addvkfr + "`.lastact",
			
		function(err, rows, fields) {
		
		if (err) {
			
			azbn.echo('Error while performing Query. ' + err, log_name);
			
		} else if(rows.length == 0) {
			
			azbn.echo('No rows for action', log_name);
			
		} else {
			
			azbn.echo('Rows for update: ' + rows.length, log_name);
			
			rows.forEach(function(h){
				
				var vk = require('./../../vk')(azbn, h.app_id);
				
				vk.setToken(h.access_token);
				
				var o = {};
				//o.sort = 1;
				o.count = 200;
				//o.online = 1;
				
				azbn.mdl('vkstream')
					.add(function(next){
						
						vk.request('friends.getRecent', o, function(resp) {
							
							if(azbn.is_def(resp.error) && !azbn.is_null(resp.error)) {
								
								azbn.event('vk_error', {
									error : resp.error,
									user_id : h.user_id,
								});
								
								switch(resp.error.error_code) {
									
									case 5: {
										azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.addvkfr + "` SET lastact = lastact + 216000 WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
											azbn.echo('[ Updated lastact for error user #' + h.user_id + ' ]', log_name);
										});
									}
									break;
									
									default:{
										azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.addvkfr + "` SET lastact = lastact + 1200 WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
											azbn.echo('[ Updated lastact for error user #' + h.user_id + ' ]', log_name);
										});
									}
									break;
									
								}
								
							} else {
								
								
								var ids_str = resp.response.join(',');
								
								azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.addvkfr_log + "` SET success_at = '" + ds + "' WHERE user_id = '" + h.user_id + "' AND success_at = 0 AND to_user_id IN (" + ids_str + ")", function (err, uresult) {
									azbn.echo('[ Updated new friends for user #' + h.user_id + ' ]', log_name);
								});
								
							}
							
						});
						
						next();
					}, 350)
					;
				
			});
			
		}
	});
	
	//azbn.echo(azbn.now() / 1000, log_name);
}

module.exports = _;