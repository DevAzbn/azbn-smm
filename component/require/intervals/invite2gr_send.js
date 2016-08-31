/*
загрузка списка друзей для приглашения в группы
*/

function _(azbn) {
	this.name = 'invite2gr_send';
	var log_name = this.name;
	
	var ds = Math.floor(azbn.now() / 1000);
	var dl = ds - 2160;
	
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
		"WHERE (`" +
			azbn.mdl('cfg').dbt.invite2gr + "`.lastact < '" + dl + "') " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.stop_at > '" + ds + "') " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.user_id = `" + azbn.mdl('cfg').dbt.invite2gr + "`.user_id) " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.app_id = '2') " +
			"AND " +
			"(`" + azbn.mdl('cfg').dbt.invite2gr + "`.status = '1') " +
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
				azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.invite2gr + "` SET lastact = '" + ds + "' WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
					azbn.echo('[ Updated lastact for user #' + h.user_id + ' ]', log_name);
				});
				
				
				var vk = require('./../../vk')(azbn, h.app_id);
				
				vk.setToken(h.access_token);
				
				h.p = JSON.parse(h.p) || {};
				
				//h.p.group_id = h.p.group_id || 5073524;
				
				if(azbn.is_def(h.p.friends) && !azbn.is_null(h.p.friends) && h.p.friends.length > 0 && azbn.is_def(h.p.group_id) && !azbn.is_null(h.p.group_id)) {
					
					azbn.mdl('vkstream2')
						.add(function(next){
							
							var max = h.p.friends.length - 1;
							var min = 0;
							var rand = min + Math.floor(Math.random() * (max + 1 - min));
							
							var user_id = h.p.friends[rand];
							
							vk.request('groups.invite', {'group_id' : h.p.group_id, 'user_id' : user_id, }, function(resp) { // user_id
								//console.log(resp);
								
								azbn.mdl('nedb.log').insert({
									created_at : azbn.now(),
									type : 'bot.vk.request',
									user_id : h.user_id,
									method : 'groups.invite',
									req : {'group_id' : h.p.group_id, 'user_id' : user_id, },
									resp : resp,
								});
								
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
										
										
										case 14: {
											
											azbn.echo('[ Captcha #' + vkresp.error.captcha_sid+ ' ]', log_name);
											
											azbn.mdl('ag').processFromURL(vkresp.error.captcha_img, function(error, ctext, id) {
												
												if (error) {
												
													azbn.event('vk_error', {
														error : {
															error_code : 0,
															error_msg : 'Antigate error',
															error : error,
														},
														user_id : h.user_id,
													});
												
												} else {
													
													vk.request('groups.invite', {'group_id' : h.p.group_id, 'user_id' : user_id, captcha_sid : vkresp.error.captcha_sid, captcha_key : ctext, }, function(_vkresp) {
														
														azbn.mdl('nedb.log').insert({
															created_at : azbn.now(),
															type : 'bot.vk.request',
															user_id : h.user_id,
															method : 'groups.invite',
															req : {'group_id' : h.p.group_id, 'user_id' : user_id, captcha_sid : vkresp.error.captcha_sid, captcha_key : ctext, },
															resp : _vkresp,
														});
														
														if(azbn.is_def(_vkresp.error) && !azbn.is_null(_vkresp.error)) {
															
															azbn.event('vk_error', {
																error : _vkresp.error,
																user_id : h.user_id,
															});
															
															switch(_vkresp.error.error_code) {
																
																case 5: {
																	azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.addvkfr + "` SET lastact = lastact + 216000 WHERE user_id = '" + h.user_id + "'", function (_err, _uresult) {
																		azbn.echo('[ Updated lastact for error user #' + h.user_id + ' ]', log_name);
																	});
																}
																break;
																
																default:{
																	azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.addvkfr + "` SET lastact = lastact + 1200 WHERE user_id = '" + h.user_id + "'", function (_err, _uresult) {
																		azbn.echo('[ Updated lastact for error user #' + h.user_id + ' ]', log_name);
																	});
																}
																break;
																
															}
															
														} else {
															
															h.p.friends.splice(rand,1);
															var h_str = JSON.stringify(h.p);
															
															azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.invite2gr + "` SET p = '" + h_str + "' WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
																azbn.echo('[ Updated friends for user #' + h.user_id + ' ]', log_name);
															});
															
															var item = {
																user_id : h.user_id,
																to_user_id : user_id,
																created_at : ds,
															};
															
															azbn.mdl('mysql').query("INSERT INTO `" + azbn.mdl('cfg').dbt.invite2gr_log + "` SET ? ", item, function(err, result) {
																if(result.insertId) {
																	azbn.echo('Send invite for user #' + user_id + ' from #' + h.user_id, log_name);
																} else {	
																}
															});
															
														}
														
													}, 555)
													;
													
												}
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
									
									h.p.friends.splice(rand,1);
									var h_str = JSON.stringify(h.p);
									
									azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.invite2gr + "` SET p = '" + h_str + "' WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
										azbn.echo('[ Updated friends for user #' + h.user_id + ' ]', log_name);
									});
									
									var item = {
										user_id : h.user_id,
										to_user_id : user_id,
										created_at : ds,
									};
									
									azbn.mdl('mysql').query("INSERT INTO `" + azbn.mdl('cfg').dbt.invite2gr_log + "` SET ? ", item, function(err, result) {
										if(result.insertId) {
											azbn.echo('Send invite for user #' + user_id + ' from #' + h.user_id, log_name);
										} else {	
										}
									});
									
								}
								
							});
							
							next();
						}, 350)
					;
						
				}
				
			});
			
		}
	});
	
	//azbn.echo(azbn.now() / 1000, log_name);
}

module.exports = _;