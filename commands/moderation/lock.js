const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { confirmDeny } = require('../../util/buttons');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Locks a specified channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to lock')
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to lock the channel for')
        ),


    async execute(interaction) {
        const { options } = interaction;
        const channel = options.getChannel('channel') || interaction.channel;
        const role = options.getRole('role') || interaction.guild.roles.everyone;

        const confirmEmbed = new EmbedBuilder()
            .setColor(0xfeb227)
            .setDescription(`***Confirm locking ${channel}***`)

        const successEmbed = new EmbedBuilder()
            .setColor(0x14e913)
            .setDescription(`***Locked ${channel}***`)

        const cancelEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***Cancelled locking ${channel}***`)

        await interaction.reply({ embeds: [confirmEmbed], components: [confirmDeny], ephemeral: true })
        const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                if (channel.isVoiceBased()) {
                    await channel.permissionOverwrites.edit(role, {
                        SendMessages: false,
                        AddReactions: false,
                        CreatePublicThreads: false,
                        CreatePrivateThreads: false,
                        UseExternalStickers: false,
                        UseApplicationCommands: false,
                        UseExternalEmojis: false,
                        AttachFiles: false,
                        EmbedLinks: false,
                        SendMessagesInThreads: false,
                        Connect: false,
                        Speak: false,
                    });

                } else {
                    await channel.permissionOverwrites.edit(role, {
                        SendMessages: false,
                        AddReactions: false,
                        CreatePublicThreads: false,
                        CreatePrivateThreads: false,
                        UseExternalStickers: false,
                        UseApplicationCommands: false,
                        UseExternalEmojis: false,
                        AttachFiles: false,
                        EmbedLinks: false,
                        SendMessagesInThreads: false,
                    });
                }
                await i.update({ embeds: [successEmbed], components: [] });
                return;
            } else {
                await i.update({ embeds: [cancelEmbed], components: [] });
                return;
            }
        });
    }
}