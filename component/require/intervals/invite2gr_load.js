/*
загрузка списка друзей для приглашения в группы
*/

function _(azbn) {
	this.name = 'invite2gr_load';
	var log_name = this.name;
	
	var ds = Math.floor(azbn.now() / 1000);
	var dl = ds - 86400;
	
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
		"WHERE 1 " + //(`" + azbn.mdl('cfg').dbt.invite2gr + "`.lastact < '" + dl + "')
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
				
				//var l = 30 + Math.floor(Math.random() * (180 + 1 - 30)) + ds;
				/*
				azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.invite2gr + "` SET lastact = '" + ds + "' WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
					azbn.echo('[ Updated lastact for user #' + h.user_id + ' ]', log_name);
				});
				*/
				
				
				var vk = require('./../../vk')(azbn, h.app_id);
				
				vk.setToken(h.access_token);
				
				h.p = JSON.parse(h.p) || {};
				
				azbn.mdl('vkstream2')
					.add(function(next){
						
						vk.request('friends.get', {'user_id' : h.user_id, 'order' : 'random', 'count' : 500,}, function(resp) {
							
							if(azbn.is_def(resp.error) && !azbn.is_null(resp.error)) {
								
								azbn.event('vk_error', {
									error : resp.error,
									user_id : h.user_id,
								});
								
								switch(resp.error.error_code) {
									
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
								
								if(resp.response.count) {
									
									var items_str = resp.response.items.join(',');
									
									vk.request('groups.isMember', {'group_id' : h.p.group_id || 39329195, 'user_ids' : items_str, }, function(resp2) {
										
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
											
											var items = [];
											for(var i in resp2.response) {
												var pr = resp2.response[i];
												if(pr.member) {
													
												} else {
													items.push(pr.user_id);
												}
											}
											
											h.p.friends = items;
											var h_str = JSON.stringify(h.p);
											
											azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.invite2gr + "` SET p = '" + h_str + "' WHERE user_id = '" + h.user_id + "'", function (err, uresult) { //lastact = '" + ds + "', 
												azbn.echo('[ Updated friends for user #' + h.user_id + ' ]', log_name);
											});
											
										}
										
									});
									
									
								}
								
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