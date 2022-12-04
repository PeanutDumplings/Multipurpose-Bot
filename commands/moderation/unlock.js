const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { confirmDeny } = require('../../util/buttons');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlocks a specified channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to unlock')
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to unlock the channel for')
        ),


    async execute(interaction) {
        const { options } = interaction;
        const channel = options.getChannel('channel') || interaction.channel;
        const role = options.getRole('role') || interaction.guild.roles.everyone;

        const confirmEmbed = new EmbedBuilder()
            .setColor(0xfeb227)
            .setDescription(`***Confirm unlocking ${channel}***`)

        const successEmbed = new EmbedBuilder()
            .setColor(0x14e913)
            .setDescription(`***Unlocked ${channel}***`)

        const cancelEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***Cancelled unlocking ${channel}***`)

        await interaction.reply({ embeds: [confirmEmbed], components: [confirmDeny], ephemeral: true })
        const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                if (channel.isVoiceBased()) {
                    await channel.permissionOverwrites.edit(role, {
                        SendMessages: null,
                        AddReactions: null,
                        CreatePublicThreads: null,
                        CreatePrivateThreads: null,
                        UseExternalStickers: null,
                        UseApplicationCommands: null,
                        UseExternalEmojis: null,
                        AttachFiles: null,
                        EmbedLinks: null,
                        SendMessagesInThreads: null,
                        Connect: null,
                        Speak: null,
                    });
                    await i.update({ embeds: [successEmbed], components: [] });
                } else {
                    await channel.permissionOverwrites.edit(role, {
                        SendMessages: null,
                        AddReactions: null,
                        CreatePublicThreads: null,
                        CreatePrivateThreads: null,
                        UseExternalStickers: null,
                        UseApplicationCommands: null,
                        UseExternalEmojis: null,
                        AttachFiles: null,
                        EmbedLinks: null,
                        SendMessagesInThreads: null,
                    });
                    await i.update({ embeds: [successEmbed], components: [] });
                }
            } else {
                await i.update({ embeds: [cancelEmbed], components: [] });
                return;
            }
        });
    }
}