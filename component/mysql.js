/*
подключение к БД MySQL
*/

var mysql = require('mysql');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'azbn_ru',
	password : 'azbn_ru',
	database : 'azbn_ru', //nodejs
});

//connection.connect();

module.exports = connection;
