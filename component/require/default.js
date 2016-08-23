/*
вынесенная функция
*/

function _(azbn) {
	this.name = 'DefaultCode';
	var log_name = this.name;
	
	azbn.echo(log_name, log_name);
}

module.exports = _;