/*
добавление новых друзей
*/

function _(azbn) {
	this.name = 'telegrambot_notify';
	var log_name = this.name;
	
	//var ds = Math.floor(azbn.now() / 1000);
	//var dl = ds - 2160;
	
	azbn.mdl('mysql').query(
		"SELECT * " +
		"FROM `" +
			azbn.mdl('cfg').dbt.telegrambot_notify + "` " +
		"WHERE (status = 0) " +
		"ORDER BY id",
		
		function(err, rows, fields) {
		if (err) {
			
			azbn.echo('Error while performing Query. ' + err, log_name);
			
		} else if(rows.length == 0) {
			
			azbn.echo('No rows for action', log_name);
			
		} else {
			
			azbn.echo('Notifies for update: ' + rows.length, log_name);
			
			rows.forEach(function(h){
								
				//var l = 30 + Math.floor(Math.random() * (180 + 1 - 30)) + ds;
				azbn.mdl('mysql').query("UPDATE `" + azbn.mdl('cfg').dbt.telegrambot_notify + "` SET status = '1' WHERE id = '" + h.id + "'", function (err, uresult) {
					azbn.echo('[ Updated status for notify #' + h.id + ' ]', log_name);
				});
				
				azbn.mdl('tg').sendMessage(h.chat_id, h.title, {
					//reply_to_message_id : msg.message_id,
					caption: 'Notify from service',
				});
				
			});
			
		}
	});
	
	//azbn.echo(azbn.now() / 1000, log_name);
}

module.exports = _;