/*
приложение вконтакте
*/

var VK = require('vksdk');

function genVK(azbn, appId) {
	this.name = 'vkapp_init';
	var log_name = this.name;
	
	var app = azbn.mdl('cfg').vk_app[appId];
	
	var vk = new VK({
		'appId'     :	app.appId,
		'appSecret' :	app.appSecret,
		'https'		:	true,
		'secure'	:	true,
		'version'	: 	'5.60',
		'language'	:	app.language,
	});

	vk.on('serverTokenReady', function(_o) {
		vk.setToken(_o.access_token);
	});
	
	return vk;
}

/*
var vk = new VK({
	'appId'     :	5172708,
	'appSecret' :	'DcT2TMRKnXtdgl40DUaX',
	'https'		:	true,
	'secure'	:	true,
	'version'	: 	'5.45',
	'language'	:	'ru',
});

vk.on('serverTokenReady', function(_o) {
	vk.setToken(_o.access_token);
});
*/
//vk.setSecureRequests(true);
//vk.setVersion(5.40);

module.exports = genVK;