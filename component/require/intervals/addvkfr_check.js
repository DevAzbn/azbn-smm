/*
добавление новых друзей
*/

function _(azbn) {
	this.name = 'addvkfr_check';
	var log_name = this.name;
	
	var ds = Math.floor(azbn.now() / 1000);
	var dl = ds - 2160;
	
	azbn.mdl('mysql').query(
		"SELECT `" +
			azbn.mdl('cfg').dbt.vk_token + "`.id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.app_id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.user_id, `" +
			azbn.mdl('cfg').dbt.vk_token + "`.access_token, `" +
			azbn.mdl('cfg').dbt.addvkfr + "`.lastact, `" +
			azbn.mdl('cfg').dbt.addvkfr + "`.p " +
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
			"(`" + azbn.mdl('cfg').dbt.vk_token + "`.app_id = '1') " +
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
				
				//str += ' ' + row.id + ' ';
			
			//for(var i = 0; i < rows.length; i++){
				
				//var h = row;
				
				
				var l = 30 + Math.floor(Math.random() * (180 + 1 - 30)) + ds;
				azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.addvkfr + "` SET lastact = '" + l + "' WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
					azbn.echo('[ Updated lastact for user #' + h.user_id + ' ]', log_name);
				});
				
				
				var vk = require('./../../vk')(azbn, h.app_id);
				
				vk.setToken(h.access_token);
				
				var o = JSON.parse(h.p) || {};
				var _method = '';
				
				switch(o.sort) {
					
					case 2:{
						_method = 'friends.getSuggestions';
						o = {
							filter : 'mutual',
							count : 200,
						};
					}
					break;
					
					default:{
						_method = 'users.search';
						o.count = 200;
					}
					break;
					
				};
				
				azbn.mdl('vkstream')
					.add(function(next){
						
						vk.request(_method, o, function(resp) {
							
							azbn.echo('[ Get users by ' + _method + ' method and user #' + h.user_id + ' ]', log_name);
							
							azbn.mdl('nedb.log').insert({
								created_at : azbn.now(),
								type : 'bot.vk.request',
								user_id : h.user_id,
								method : _method,
								req : o,
								resp : resp,
							});
							
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
								
								var max = o.count - 1;
								var min = 0;
								var rand = min + Math.floor(Math.random() * (max + 1 - min));
								
								var u = resp.response.items[rand];
								
								azbn.mdl('vkstream')
									.add(function(_next){
										
										var __req = {'user_id' : u.id, };
										
										vk.request('friends.add', __req, function(vkresp) { //'https' : 1,
											
											azbn.mdl('nedb.log').insert({
												created_at : azbn.now(),
												type : 'bot.vk.request',
												user_id : h.user_id,
												method : 'friends.add',
												req : __req,
												resp : vkresp,
											});
											
											if(azbn.is_def(vkresp.error) && !azbn.is_null(vkresp.error)) {
												
												azbn.event('vk_error', {
													error : vkresp.error,
													user_id : h.user_id,
												});
												
												switch(vkresp.error.error_code) {
													
													case 5: {
														azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.addvkfr + "` SET lastact = lastact + 216000 WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
															azbn.echo('[ Updated lastact for error user #' + h.user_id + ' ]', log_name);
														});
													}
													break;
													
													case 14: {
														//captcha_img captcha_sid
														
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
																//console.log(ctext);
																
																var __req2 = {'user_id' : u.id, captcha_sid : vkresp.error.captcha_sid, captcha_key : ctext, };
																
																vk.request('friends.add', __req2, function(_vkresp) {
																	
																	azbn.mdl('nedb.log').insert({
																		created_at : azbn.now(),
																		type : 'bot.vk.request',
																		user_id : h.user_id,
																		method : 'friends.add',
																		req : __req2,
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
																		
																		var item = {
																			user_id : h.user_id,
																			to_user_id : u.id,
																			created_at : ds,
																		};
																		
																		azbn.mdl('mysql').query("INSERT INTO `" + azbn.mdl('cfg').dbt.addvkfr_log + "` SET ? ", item, function(err, result) {
																			if(result.insertId) {
																				azbn.echo('Send request for user #' + u.id + ' from #' + h.user_id, log_name);
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
														azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.addvkfr + "` SET lastact = lastact + 1200 WHERE user_id = '" + h.user_id + "'", function (err, uresult) {
															azbn.echo('[ Updated lastact for error user #' + h.user_id + ' ]', log_name);
														});
													}
													break;
													
												}
												
											} else {
												
												var item = {
													user_id : h.user_id,
													to_user_id : u.id,
													created_at : ds,
												};
												
												azbn.mdl('mysql').query("INSERT INTO `" + azbn.mdl('cfg').dbt.addvkfr_log + "` SET ? ", item, function(err, result) {
													if(result.insertId) {
														azbn.echo('Send request for user #' + u.id + ' from #' + h.user_id, log_name);
													} else {	
													}
												});
												
											}
											
										});
										
										
										_next();
									}, 555)
									;
								
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