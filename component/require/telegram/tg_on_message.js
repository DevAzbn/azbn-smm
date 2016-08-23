/*
вынесенная функция
*/

function _(azbn, msg) {
	this.name = 'tg_on_message';
	var log_name = this.name;
	
	var text = msg.text;
	
	if(text === '/start') {
		
		require('./tg_on_message/start')(azbn, msg);
		//azbn.echo('start', log_name);
		
	} else {
		
		var text_arr = text.split(' ');
		
		switch(text_arr[0]) {
			
			case '/ping' : {
				require('./tg_on_message/ping')(azbn, msg);
			}
			break;
			
			case '/reload_servers' : {
				require('./tg_on_message/reload_servers')(azbn, msg);
			}
			break;
			
			default : {
				
			}
			break;
			
		}
		
	}
	
	azbn.echo('msg from chat #' + msg.chat.id, log_name);
}

module.exports = _;