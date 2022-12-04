const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { confirmDeny } = require('../../util/buttons');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick a user from the discord server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("User to be kicked.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Reason for the kick.")
        ),

    async execute(interaction) {

        // Getting properties of interaction

        const { options } = interaction;
        const user = options.getMember("target");
        const reason = options.getString("reason") || "**No reason provided**";
        const member = await interaction.guild.members.fetch(user.id);

        // Registering embeds

        const confirmEmbed = new EmbedBuilder()
            .setColor(0xfeb227)
            .setDescription(`***Confirm kicking ${user}***`)

        const errorEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`You can not kick ${user}, as they either have the same or higher role than you or have more permissions than you.\n
            **Your highest role: **${interaction.member.roles.highest} ㅤㅤㅤㅤㅤㅤㅤㅤ **Their highest role: **${member.roles.highest}`)

        const selfEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***You can not kick yourself (${user})***`)

        const successEmbed = new EmbedBuilder()
            .setColor(0x14e913)
            .setDescription(`***Kicked ${user}***`)

        const cancelEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***Cancelled kicking ${user}***`)

        // Executing command

        if (user == interaction.member) {
            return interaction.reply({ embeds: [selfEmbed], ephemeral: true });
        } else if (member.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [confirmEmbed], components: [confirmDeny], ephemeral: true })

            const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

            const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'confirm') {
                    await member.kick(reason);
                    await i.update({ embeds: [successEmbed], components: [] });
                } else {
                    await i.update({ embeds: [cancelEmbed], components: [] });
                    return;
                }
            });
        }
    }
}