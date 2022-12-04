const fs = require('node:fs');
const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync('./config/config.yaml'));
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        Partials.Channel
    ]
});

client.commands = new Collection();

const functions = fs.readdirSync('./functions').filter(file => file.endsWith('.js'));

(async () => {
    for (file of functions) { require(`./functions/${file}`)(client); }
    client.handleCommands();
    client.handleEvents();
    client.login(config.token);
})();