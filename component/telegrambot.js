/*
бот телеграма
*/

var TelegramBot = require('node-telegram-bot-api');

var bot = new TelegramBot('150680674:AAHjNhLe6J2qOEvE0FcdWCIAEf7WQJWnRKU', {polling: true});

module.exports = bot;