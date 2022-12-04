const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { confirmDeny } = require('../../util/buttons');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user from the discord server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option
                .setName("id")
                .setDescription("Id of user to be unbanned.")
                .setRequired(true)
        ),

    async execute(interaction) {
        const { options } = interaction;
        const user = options.getUser("id");
        // const member = await interaction.guild.members.fetch(user.id);

        const confirmEmbed = new EmbedBuilder()
            .setColor(0xfeb227)
            .setDescription(`***Confirm unbanning ${user}***`)

        const selfEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***You can not unban yourself (${user})***`)

        const successEmbed = new EmbedBuilder()
            .setColor(0x14e913)
            .setDescription(`***Unbanned ${user}***`)

        const cancelEmbed = new EmbedBuilder()
            .setColor(0xeb0e0e)
            .setDescription(`***Cancelled unbanning ${user}***`)

        if (user.id === interaction.user.id) {
            interaction.reply({ embeds: [selfEmbed], ephemeral: true });
        } else {
            interaction.reply({ embeds: [confirmEmbed], components: [confirmDeny], ephemeral: true });
            const filter = i => i.customId === 'confirm' || i.customId === 'cancel';
            const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

            collector.on('collect', async i => {
                if (i.customId === 'confirm') {
                    await interaction.guild.members.unban(user.id);
                    interaction.editReply({ embeds: [successEmbed], components: [], ephemeral: true });
                    return;
                } else if (i.customId === 'cancel') {
                    interaction.editReply({ embeds: [cancelEmbed], components: [], ephemeral: true });
                    return;
                }
            });
        }
    }
}

