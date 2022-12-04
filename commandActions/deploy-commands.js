const path = require('node:path');
const { REST, SlashCommandBuilder, Routes } = require('discord.js');
const fs = require('node:fs');
const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync('./config/config.yaml'));

const commands = [
    new SlashCommandBuilder().setName('usersinfo').setDescription('Get info about a user or yourself'),
];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);