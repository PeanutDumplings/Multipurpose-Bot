const AsciiTable = require('ascii-table');
const fs = require('fs');

module.exports = (client) => {
    client.handleEvents = async () => {
        var eventTable = new AsciiTable('Events');
        eventTable.setHeading('Event', 'Category', 'Status');

        const eventFolders = fs.readdirSync("events");
        for (folder of eventFolders) {
            const eventFiles = fs.readdirSync(`events/${folder}`).filter(file => file.endsWith('.js'));

            for (const file of eventFiles) {
                const event = require(`../events/${folder}/${file}`);
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
                eventTable.addRow(event.name, folder, 'Loaded');
            }
        }
        console.log(eventTable.toString());
    }
}