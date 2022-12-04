const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const confirmDeny = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger))

module.exports = {
    confirmDeny: confirmDeny
}