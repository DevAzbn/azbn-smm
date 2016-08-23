/*
подключение к БД MySQL
*/

var mysql = require('mysql');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'nodejs',
	password : 'nodejs',
	database : 'azbn_ru', //nodejs
});

//connection.connect();

module.exports = connection;
