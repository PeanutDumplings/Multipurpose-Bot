const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync('./config/config.yaml'));

const commands = [];
const commandFiles = fs.readdirSync('../commands').filter(file => file.endsWith('.js'));

// Place your client and guild ids here
const clientId = '1028515671442726963';
const guildId = '876543210987654321';

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();