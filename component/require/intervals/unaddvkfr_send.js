/*
добавление новых друзей
*/

function _(azbn) {
	this.name = 'unaddvkfr_send';
	var log_name = this.name;
	
	var ds = Math.floor(azbn.now() / 1000);
	var dl = ds - 600;//2160;
	
	azbn.mdl('mysql').query(
		"SELECT `" +
			azbn.mdl('cfg').dbt.vk_token + "`.id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.app_id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.user_id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.access_token, `" +
			azbn.mdl('cfg').dbt.unaddvkfr + "`.lastact " +
		"FROM `" +
			azbn.mdl('cfg').dbt.vk_token + "`, `" +
			azbn.mdl('cfg').dbt.unaddvkfr + "` " +
		"WHERE 1 " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.unaddvkfr + "`.lastact < '" + dl + "') " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.stop_at > '" + ds + "') " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.user_id = `" + azbn.mdl('cfg').dbt.unaddvkfr + "`.user_id) " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.app_id = '3') " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.unaddvkfr + "`.status = '1') " +
		"ORDER BY `" +
			azbn.mdl('cfg').dbt.unaddvkfr + "`.lastact",
			
		function(err, rows, fields) {
		
		if (err) {
			
			azbn.echo('Error while performing Query. ' + err, log_name);
			
		} else if(rows.length == 0) {
			
			azbn.echo('No rows for action', log_name);
			
		} else {
			
			azbn.echo('Rows for update: ' + rows.length, log_name);
			
			rows.forEach(function(h){
				
				//str += ' ' + row.id + ' ';
			
			//for(var i = 0; i < rows.length; i++){
				
				//var h = row;
				
				
				var l = 30 + Math.floor(Math.random() * (180 + 1 - 30)) + ds;
				azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.unaddvkfr + "` SET lastact = '" + l + "' WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
					azbn.echo('[ Updated lastact for unaddvkfr-user #' + h.user_id + ' ]', log_name);
				});
				
				var __border_moment = ds - (86400 * 9);
				
				azbn.mdl('mysql').query(
					"SELECT * " +
					"FROM `" +
						azbn.mdl('cfg').dbt.addvkfr_log + "` " +
					"WHERE " +
						"(user_id = '" + h.user_id + "') " +
						" AND " +
						"(created_at < '" + __border_moment + "') " +
						" AND " +
						"(success_at = '0') " +
					"ORDER BY RAND() LIMIT 1",
					
					function(_err, _rows, _fields) {
					
					if (err) {
						
						//azbn.echo('Error while performing Query. ' + err, log_name);
						
					} else if(rows.length == 0) {
						
						//azbn.echo('No rows for action', log_name);
						
					} else {
						
						//azbn.echo('Rows for update: ' + rows.length, log_name);
						
						_rows.forEach(function(_fr){
							
							var vk = require('./../../vk')(azbn, h.app_id);
							
							vk.setToken(h.access_token);
							
							var __req = { user_id : _fr.to_user_id };
							
							azbn.mdl('vkstream3')
								.add(function(next){
									
									vk.request('friends.delete', __req, function(resp) {
										
										/*
										azbn.mdl('nedb.log').insert({
											created_at : azbn.now(),
											type : 'bot.vk.request',
											user_id : h.user_id,
											method : 'friends.delete',
											req : __req,
											resp : resp,
										});
										*/
										
										azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.addvkfr_log + "` SET success_at = '" + (- ds) + "' WHERE id = '" + _fr.id + "'", function (err, uresult) {
											azbn.echo('[ Updated addvkfr_log for unaddvkfr-user #' + h.user_id + ' ]', log_name);
										});
										
										if(azbn.is_def(resp.error) && !azbn.is_null(resp.error)) {
											
											azbn.event('vk_error', {
												error : resp.error,
												user_id : h.user_id,
											});
											
										} else {
											
											if(resp.response.out_request_deleted) {
												
											}
											
										}
										
									});
									
									next();
								}, 350)
								;
							
						});
						
					}
				});
				
			});
			
		}
	});
	
	//azbn.echo(azbn.now() / 1000, log_name);
}

module.exports = _;