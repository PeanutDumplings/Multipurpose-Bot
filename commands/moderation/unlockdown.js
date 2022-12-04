const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { confirmDeny } = require('../../util/buttons');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlockdown')
        .setDescription('Locks all channels')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('Role to lock server for')
        ),

    async execute(interaction) {
        const { options } = interaction;
        const role = options.getRole('role') || interaction.guild.roles.everyone;

        const confirmEmbed = new EmbedBuilder()
            .setColor(0xfeb227)
            .setDescription(`***Confirm unlocking for ${role}***`)

        const successEmbed = new EmbedBuilder()
            .setColor(0x14e913)
            .setDescription(`***Unlocked server for ${role}***`)

        const cancelEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***Cancelled unlocking server for ${role}***`)

        await interaction.reply({ embeds: [confirmEmbed], components: [confirmDeny], ephemeral: true })
        const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                await interaction.guild.channels.cache.forEach(async channel => {
                    if (channel.isVoiceBased()) {
                        await channel.permissionOverwrites.edit(role, {
                            SendMessages: null,
                            AddReactions: null,
                            CreatePublicThreads: null,
                            CreatePrivateThreads: null,
                            UseExternalStickers: null,
                            UseApplicationCommands: null,
                            UseExternalEmojis: null,
                            Connect: null,
                            Speak: null,
                        })
                    } else {
                        await channel.permissionOverwrites.edit(role, {
                            SendMessages: null,
                            AddReactions: null,
                            CreatePublicThreads: null,
                            CreatePrivateThreads: null,
                            UseExternalStickers: null,
                            UseApplicationCommands: null,
                            UseExternalEmojis: null,
                        });
                    }
                });
                await interaction.editReply({ embeds: [successEmbed], components: [] });
                return;
            } else {
                await interaction.editReply({ embeds: [cancelEmbed], components: [] });
                return;
            }
        });

    }
}