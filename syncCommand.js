import { REST, Routes } from 'discord.js';

import commands from './command.json' with { type: "json" };
import config from './config.json' with { type: "json" };

const rest = new REST({ version: '10' }).setToken(config.botConfig.botToken);

try {
    console.log('sync start.');

    await rest.put(Routes.applicationCommands(config.botConfig.botId), { body: commands.command });

    console.log('sync done.');
} catch (error) {
    console.error(error);
};
