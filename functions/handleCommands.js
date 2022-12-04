const AsciiTable = require('ascii-table');
const fs = require('fs');

module.exports = (client) => {
    client.handleCommands = async () => {
        var commandTable = new AsciiTable('Commands');
        commandTable.setHeading('Command', 'Category', 'Status');

        const commandFolders = fs.readdirSync("commands");
        client.commandArray = [];
        for (folder of commandFolders) {
            const commandFiles = fs.readdirSync(`commands/${folder}`).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require(`../commands/${folder}/${file}`);
                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());
                commandTable.addRow(command.data.name, folder, 'Loaded');
            }
        }

        console.log(commandTable.toString());
    }
}