const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { confirmDeny } = require('../../util/buttons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a role or channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels && PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('voicechannel')
                .setDescription('Create a voice channel')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('The name of the voice channel')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('bitrate')
                        .setDescription('The bitrate of the voice channel')
                        .addChoices(
                            { name: '8kbps', value: '8000' },
                            { name: '16kbps', value: '16000' },
                            { name: '32kbps', value: '32000' },
                            { name: '64kbps', value: '64000' },
                            { name: '80kbps', value: '80000' },
                            { name: '96kbps', value: '96000' },
                        ))
                .addIntegerOption(option =>
                    option
                        .setName('userlimit')
                        .setDescription('The bitrate of the voice channel'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('textchannel')
                .setDescription('Create a text channel')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('The name of the text channel')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('topic')
                        .setDescription('The topic of the text channel')),
        ),
    // .addSubcommand(subcommand =>
    //     subcommand
    //         .setName('role')
    //         .setDescription('Create a role')
    //         .addStringOption(option =>
    //             option
    //                 .setName('name')
    //                 .setDescription('The name of the role')
    //                 .setRequired(true))
    //         .addStringOption(option =>
    //             option
    //                 .setName('topic')
    //                 .setDescription('The topic of the text channel')),
    // ),

    async execute(interaction) {
        const { options } = interaction;
        const name = options.getString('name');
        const topic = options.getString('topic');
        const type = options.getSubcommand();
        const bitrate = options.getString('bitrate' || null);
        const userlimit = options.getInteger('userlimit');

        const userlimitEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***The user limit must be between 1 and 99***`)

        const confirmEmbed = new EmbedBuilder()
            .setColor(0xfeb227)
            .setDescription(`***Confirm creating channel:*** **${name}**`)

        const successEmbed = new EmbedBuilder()
            .setColor(0x14e913)
            .setDescription(`***Created channel:*** **${name}**`)

        const cancelEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***Cancelled creating channel:*** **${name}**`)


        interaction.reply({ embeds: [confirmEmbed], components: [confirmDeny], ephemeral: true });
        const filter = i => i.customId === 'confirm' || i.customId === 'cancel';
        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                if (type == 'voicechannel') {
                    if (userlimit == null || userlimit >= 1 && userlimit <= 99) {
                        await interaction.guild.channels.create({
                            name: name,
                            type: ChannelType.GuildVoice,
                            bitrate: bitrate,
                            userLimit: userlimit,
                        });
                        await interaction.editReply({ embeds: [successEmbed], components: [], ephemeral: true });
                        return;
                    } else {
                        await interaction.editReply({ embeds: [userlimitEmbed], components: [], ephemeral: true });
                        return;
                    }
                } else if (type == 'textchannel') {
                    interaction.guild.channels.create({
                        name: name,
                        topic: topic,
                        type: ChannelType.GuildText,
                    });
                    await interaction.editReply({ embeds: [successEmbed], components: [], ephemeral: true });
                    return;
                }
                await interaction.editReply({ embeds: [successEmbed], components: [], ephemeral: true });
                return;
            } else if (i.customId === 'cancel') {
                await interaction.editReply({ embeds: [cancelEmbed], components: [], ephemeral: true });
                return;
            }
        });
    },
}