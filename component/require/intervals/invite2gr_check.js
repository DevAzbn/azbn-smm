/*
загрузка списка друзей для приглашения в группы
*/

function _(azbn) {
	this.name = 'invite2gr_check';
	var log_name = this.name;
	
	var ds = Math.floor(azbn.now() / 1000);
	//var dl = ds - 86400;
	
	azbn.mdl('mysql').query(
		"SELECT `" +
			azbn.mdl('cfg').dbt.vk_token + "`.id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.app_id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.user_id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.access_token, `" +
			azbn.mdl('cfg').dbt.invite2gr + "`.lastact,  `" +
			azbn.mdl('cfg').dbt.invite2gr + "`.p " +
		"FROM `" +
			azbn.mdl('cfg').dbt.vk_token + "`, `" +
			azbn.mdl('cfg').dbt.invite2gr + "` " +
		"WHERE (`" + azbn.mdl('cfg').dbt.invite2gr + "`.status = '1') " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.stop_at > '" + ds + "') " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.user_id = `" + azbn.mdl('cfg').dbt.invite2gr + "`.user_id) " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.app_id = '2') " +
		"ORDER BY `" +
			azbn.mdl('cfg').dbt.invite2gr + "`.lastact", 
		
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
				
				h.p = JSON.parse(h.p) || {};
				
				var __border_moment = ds - (86400 * 10);
				
				azbn.mdl('mysql').query(
					"SELECT * " +
					"FROM `" +
						azbn.mdl('cfg').dbt.invite2gr_log + "` " +
					"WHERE " +
						"(user_id = '" + h.user_id + "') " +
						" AND " +
						"(created_at > '" + __border_moment + "') " +
						" AND " +
						"(success_at = '0') " +
					"ORDER BY created_at",
					
					function(_err, _rows, _fields) {
						
						if (_err) {
							
							//azbn.echo('Error while performing Query. ' + err, log_name);
							
						} else if(_rows.length == 0) {
							
							//azbn.echo('No rows for action', log_name);
							
						} else {
							
							var ids_arr = [];
							var ids_arr_str = '';
							
							_rows.forEach(function(_inv){
								
								ids_arr.push(_inv.to_user_id);
								
							});
							
							ids_arr_str = ids_arr.join(',');
							
							var __req = {group_id : h.p.group_id, user_ids : ids_arr_str};
							
							azbn.mdl('vkstream2')
								.add(function(next){
									
									vk.request('groups.isMember', __req, function(resp2) {
										
										azbn.mdl('nedb.log').insert({
											created_at : azbn.now(),
											type : 'bot.vk.request',
											user_id : h.user_id,
											method : 'groups.isMember',
											req : __req,
											resp : resp2,
										});
										
										if(azbn.is_def(resp2.error) && !azbn.is_null(resp2.error)) {
											
											azbn.event('vk_error', {
												error : resp2.error,
												user_id : h.user_id,
											});
											
											switch(resp2.error.error_code) {
												
												case 5: {
													azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.invite2gr + "` SET lastact = lastact + 216000 WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
														azbn.echo('[ Updated lastact for error user #' + h.user_id + ' ]', log_name);
													});
												}
												break;
												
												default:{
													azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.invite2gr + "` SET lastact = lastact + 1200 WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
														azbn.echo('[ Updated lastact for error user #' + h.user_id + ' ]', log_name);
													});
												}
												break;
												
											}
											
										} else {
											
											if(resp2.response.count) {
												
												var items = [];
												for(var i in resp2.response) {
													var pr = resp2.response[i];
													if(pr.member) {
														items.push(pr.user_id);
													} else {
														
													}
												}
												
												var items_str = items.join(',');
												
												azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.invite2gr_log + "` SET success_at = '" + ds + "' WHERE user_id = '" + h.user_id + "' AND to_user_id IN (" + items_str + ") AND success_at = 0", function (__err, uresult) { //lastact = '" + ds + "', 
													azbn.echo('[ Updated invite2gr_log for invite2gr-user #' + h.user_id + ' ]', log_name);
												});
												
											}
											
										}
										
									});
									
									next();
								}, 350)
								;
							
						}
						
				});
				
			});
			
		}
	});
	
	//azbn.echo(azbn.now() / 1000, log_name);
}

module.exports = _;