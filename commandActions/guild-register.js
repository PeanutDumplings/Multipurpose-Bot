const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync('./config/config.yaml'));

const commands = [];

const commandFolders = fs.readdirSync("commands");
for (folder of commandFolders) {
    const commandFiles = fs.readdirSync(`commands/${folder}`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../commands/${folder}/${file}`);
        commands.push(command.data.toJSON());
    }
}

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();