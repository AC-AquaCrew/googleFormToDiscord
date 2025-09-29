const { runDiscordBot } = require('./runDiscordBot');
const { fetchGoogleFrom } = require('./fetchGoogleFrom');

setInterval(() => {
    runDiscordBot();
    fetchGoogleFrom();
}, 20 * 1000);