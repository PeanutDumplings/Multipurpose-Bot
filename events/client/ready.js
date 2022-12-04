const fs = require('node:fs');
const yaml = require('js-yaml');
const info = yaml.load(fs.readFileSync('./config/info.yaml'));

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        client.invites = {}
        client.guilds.cache.each(guild => {
            guild.invites.fetch().then(guildInvites => {
                guildInvites.each(guildInvite => {
                    client.invites[guildInvite.code] = guildInvite.uses
                })
            })
        })
        console.log(`Multipurpose bot version ${info.version} is online and ready!`);
    },
};