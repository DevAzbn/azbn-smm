/*
вынесенная функция
*/

function _(azbn, msg) {
	this.name = 'tg_on_message_start';
	var log_name = this.name;
	
	var resp = 	'Use' + '\n'+
				'/start for this info' + '\n'+
				''
				;
	
	azbn.mdl('tg').sendMessage(msg.chat.id, resp, {
		reply_to_message_id : msg.message_id,
		caption: 'How you can use me',
	});
	
	azbn.echo(msg.text, log_name);
}

module.exports = _;