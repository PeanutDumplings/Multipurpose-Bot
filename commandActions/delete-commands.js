const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync('./config/config.yaml'));
const rest = new REST({ version: '10' }).setToken(config.token);

// ...

// for guild-based commands
rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: [] })
    .then(() => console.log('Successfully deleted all guild commands.'))
    .catch(console.error);

// for global commands
rest.put(Routes.applicationCommands(config.clientId), { body: [] })
    .then(() => console.log('Successfully deleted all application commands.'))
    .catch(console.error);