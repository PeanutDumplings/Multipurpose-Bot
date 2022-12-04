const fs = require('fs');
const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const qr = require('qrcode');
const rn = require('random-number');
const rnOptions = {
    min: 100000,
    max: 999999
    , integer: true
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('qr')
        .setDescription('Generates a QR code from a URL')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL to encode')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Whether or not the QR code should be ephemeral')),

    async execute(interaction) {
        const { options } = interaction;
        const url = options.getString('url');
        const ephemeral = options.getBoolean('ephemeral');
        const id = rn(rnOptions);

        function build() {
            const qrFile = new AttachmentBuilder(`data/qr/${id}.png`);

            const qrEmbed = new EmbedBuilder()
                .setColor(0x1d77ab)
                .setImage(`attachment://${id}.png`)
                .setTimestamp()

            if (ephemeral) {
                interaction.reply({ embeds: [qrEmbed], files: [qrFile], ephemeral: true });
            } else {
                interaction.reply({ embeds: [qrEmbed], files: [qrFile] });
            }
        }

        function del() {
            fs.unlink('./data/qr/' + `${id}.png`, (err) => {
                if (err) {
                    throw err;
                }
            });
        }

        qr.toFile(`data/qr/${id}.png`, url, function (err) {
            if (err) return console.error(err);
        });

        setTimeout(build, 30);
        setTimeout(del, 1000);

    }
}