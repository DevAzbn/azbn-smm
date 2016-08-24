/*
получение данных о пользователях
*/

function _(azbn) {
	this.name = 'myprofile_check';
	var log_name = this.name;
	
	var app_id = 1;
	
	var ds = Math.floor(azbn.now() / 1000);
	var dl = ds - (3600 * 3);
	
	azbn.mdl('mysql').query(
		"SELECT * " +
		"FROM `" +
			azbn.mdl('cfg').dbt.vk_token + "` " +
		"WHERE (app_id = '" + app_id + "' AND stop_at > '" + ds + "') " +
		"ORDER BY RAND() " +
		"LIMIT 3",
		
		function(err, rows, fields) {
		if (err) {
			
			azbn.echo('Error while performing Query. ' + err, log_name);
			
		} else if(rows.length == 0) {
			
			azbn.echo('No rows for action', log_name);
			
		} else {
			
			azbn.echo('Rows for update: ' + rows.length, log_name);
			
			rows.forEach(function(h){
				
				//str_arr.push(h.user_id);
				
				var vk = require('./../../vk')(azbn, h.app_id);
				
				vk.request('users.get', {'user_ids' : h.user_id, fields :'photo_id,verified,sex,bdate,city,country,home_town,has_photo,photo_50,photo_100,photo_200_orig,photo_200,photo_400_orig,photo_max,photo_max_orig,online,lists,domain,has_mobile,contacts,site,education,universities,schools,status,last_seen,followers_count,occupation,nickname,relatives,relation,personal,connections,exports,wall_comments,activities,interests,music,movies,tv,books,games,about,quotes,can_post,can_see_all_posts,can_see_audio,can_write_private_message,can_send_friend_request,is_favorite,is_hidden_from_feed,timezone,screen_name,maiden_name,crop_photo,is_friend,friend_status,career,military,counters' }, function(resp) {
					
					if(azbn.is_def(resp.error) && !azbn.is_null(resp.error)) {
						
						azbn.event('vk_error', {
							error : resp.error,
							user_id : h.user_id,
						});
						
					} else {
						
						resp.response.forEach(function(user){
							
							var p = JSON.stringify(user);
							
							var item = {
								created_at : ds,
								user_id : user.id || 0,
								p : p,
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
							
						});
						
					}
					
				});
				
			});
			
		}
	});
	
	//azbn.echo(azbn.now() / 1000, log_name);
}

module.exports = _;