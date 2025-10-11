const { runDiscordBot } = require('./runDiscordBot');
const { fetchGoogleFrom } = require('./fetchGoogleFrom');
const { botListenCommand } = require('./botListenCommand');

setInterval(() => {
    fetchGoogleFrom();
    runDiscordBot();
}, 20 * 1000);

botListenCommand();