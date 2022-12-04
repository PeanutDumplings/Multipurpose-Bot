const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { confirmDeny } = require('../../util/buttons');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojisteal')
        .setDescription('Steal an emoji from another server')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers)
        .addStringOption(option => option.setName('emoji').setDescription('The emoji to steal').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('The name of the emoji').setRequired(true)),
    async execute(interaction) {

        const { options } = interaction;
        const emoji = options.getString('emoji');
        const name = options.getString('name');

        const confirmEmbed = new EmbedBuilder()
            .setColor(0xfeb227)
            .setDescription(`***Confirm creating emoji:*** *${name}*`)

        const successEmbed = new EmbedBuilder()
            .setColor(0x14e913)
            .setDescription(`***Created*** *${name}*`)

        const cancelEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***Cancelled creating*** *${name}*`)

        const invalidEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***Invalid emoji***\n Are you attempting to add a default discord emoji?`)

        const errorEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***Error creating*** *${name}*\n Have you used all of your emoji/animated emoji slots?`)


        const emojiRegex = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
        const match = emojiRegex.exec(emoji);
        if (!match) return interaction.reply({ embeds: [invalidEmbed], ephemeral: true });
        const emojiID = match[3];
        const emojiURL = `https://cdn.discordapp.com/emojis/${emojiID}.${match[1] ? 'gif' : 'png'}`;

        await interaction.reply({ embeds: [confirmEmbed], components: [confirmDeny], ephemeral: true });

        const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                try {
                    interaction.guild.emojis.create({ attachment: emojiURL, name: name })
                } catch (error) {
                    console.error(error);
                    return interaction.editReply({ embeds: [errorEmbed], components: [] });
                }
                await i.update({ embeds: [successEmbed], components: [] })
                return;
            } else {
                await i.update({ embeds: [cancelEmbed], components: [] });
                return;
            }
        });
    },
};