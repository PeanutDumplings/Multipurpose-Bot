const { EmbedBuilder } = require('discord.js');
const { failureColour } = require('../../util/colours');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        const words = require('../../config/filter.json');
        const state = require('../../config/filter.json');
        const bypass = require('../../config/filterBypass.json');
        const messageContent = message.content.toLowerCase();
        const results = words.words.some(word => messageContent.includes(word));

        const filterWarnEmbedded = new EmbedBuilder()
            .setDescription(`***<@${message.author.id}> You cannot use that word***`)
            .setColor(failureColour)

        if (message.member.roles.cache.some(role => bypass.roles.includes(role.id)) || bypass.users.includes(message.author.id) || results == false || state.state == 'off') {
            return;
        } else {
            await message.delete();
            client.channels.cache.get(message.channelId).send({ embeds: [filterWarnEmbedded] })
            setTimeout(() => {
                client.channels.cache.get(message.channelId).bulkDelete(1);
            }, 5000);
            delete require.cache[require.resolve('../../config/filter.json')];
            return;
        }
    }
}