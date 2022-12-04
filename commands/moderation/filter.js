const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { confirmDeny } = require('../../util/buttons');
const { successColour, failureColour, warningColour } = require('../../util/colours')
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Create and manage a list of filtered words')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a word to filter')
                .addStringOption(option =>
                    option
                        .setName('word')
                        .setDescription('The word to be added to the filter')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a word from the filter')
                .addStringOption(option =>
                    option
                        .setName('word')
                        .setDescription('The word to be removed from the filter')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List filtered words (result defaults as ephemeral)')
                .addBooleanOption(option =>
                    option
                        .setName('ephemeral')
                        .setDescription('Whether the response should be ephemeral'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('roleadd')
                .setDescription('Add a role to bypass the filter')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to be added to the bypass list')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('roleremove')
                .setDescription('Remove a role that bypasses the filter')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to be removed from the bypass list')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('useradd')
                .setDescription('Add a user to bypass the filter')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to be added to the bypass list')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('userremove')
                .setDescription('Remove a user that bypasses the filter')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to be removed from the bypass list')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('state')
                .setDescription('Turn on or off the filter')
                .addStringOption(option =>
                    option.setName('state')
                        .setDescription('Whether the filter is on or off')
                        .setRequired(true)
                        .addChoices(
                            { name: 'On', value: 'on' },
                            { name: 'Off', value: 'off' },
                        ))
        ),

    async execute(interaction) {
        const { options } = interaction;
        const subcommand = options.getSubcommand();
        const word = options.getString('word');
        const ephemeral = options.getBoolean('ephemeral');
        const role = options.getRole('role') || 0;
        const user = options.getUser('user') || 0;
        const state = options.getString('state') || 'a';
        const filter = require('../../config/filter.json');
        const filterBypass = require('../../config/filterBypass.json');

        const filterListEmbed = new EmbedBuilder()
            .setTitle('Filtered Words')
            .setColor(successColour)
            .setDescription(filter.words.map(word => `• **${word}**`).join('\n'))

        const filterCurrentlyEmbed = new EmbedBuilder()
            .setDescription(`**\`${word}\`** ***is already being filtered***`)
            .setColor(failureColour)

        const filterAddConfirmEmbed = new EmbedBuilder()
            .setDescription(`***Confirm adding*** **\`${word}\`** ***to the filter***`)
            .setColor(warningColour)

        const filterAddedEmbed = new EmbedBuilder()
            .setDescription(`***Added*** **\`${word}\`** ***to the filter***`)
            .setColor(successColour)

        const filterAddCancelledEmbed = new EmbedBuilder()
            .setDescription(`***Cancelled adding*** **\`${word}\`** ***to the filter***`)
            .setColor(failureColour)

        const filterRemoveConfirmEmbed = new EmbedBuilder()
            .setDescription(`***Confirm removing*** **\`${word}\`** ***from the filter***`)
            .setColor(warningColour)

        const filterRemoveCancelledEmbed = new EmbedBuilder()
            .setDescription(`***Cancelled removing*** **\`${word}\`** ***from the filter***`)
            .setColor(failureColour)

        const filterRemoveEmbed = new EmbedBuilder()
            .setDescription(`***Removed*** **\`${word}\`** ***from the filter***`)
            .setColor(failureColour)

        const filterUnfilteredEmbed = new EmbedBuilder()
            .setDescription(`**\`${word}\`** ***is not filtered***`)
            .setColor(failureColour)

        const filterRoleCurrentlyFiltered = new EmbedBuilder()
            .setDescription(`**<@&${role.id}>** ***already bypasses the filter***`)
            .setColor(failureColour)

        const filterRoleConfirmEmbed = new EmbedBuilder()
            .setDescription(`***Confirm adding*** **<@&${role.id}>** ***to the filter bypass list***`)
            .setColor(warningColour)

        const filterRoleAddedEmbed = new EmbedBuilder()
            .setDescription(`***Added*** **<@&${role.id}>** ***to the filter bypass list***`)
            .setColor(successColour)

        const filterRoleAddCancelledEmbed = new EmbedBuilder()
            .setDescription(`***Cancelled adding*** **<@&${role.id}>** ***to the filter bypass list***`)
            .setColor(failureColour)

        const filterRoleRemoveConfirmEmbed = new EmbedBuilder()
            .setDescription(`***Confirm removing*** **<@&${role.id}>** ***from the filter bypass list***`)
            .setColor(warningColour)

        const filterRoleRemoveCancelledEmbed = new EmbedBuilder()
            .setDescription(`***Cancelled removing*** **<@&${role.id}>** ***from the filter bypass list***`)
            .setColor(failureColour)

        const filterRoleRemoveEmbed = new EmbedBuilder()
            .setDescription(`***Removed*** **<@&${role.id}>** ***from the filter bypass list***`)
            .setColor(failureColour)

        const filterRoleUnfilteredEmbed = new EmbedBuilder()
            .setDescription(`**<@&${role.id}>** ***does not bypass the filter***`)
            .setColor(failureColour)

        const filterUserCurrentlyFiltered = new EmbedBuilder()
            .setDescription(`**<@${user.id}>** ***already bypasses the filter***`)
            .setColor(failureColour)

        const filterUserConfirmEmbed = new EmbedBuilder()
            .setDescription(`***Confirm adding*** **<@${user.id}>** ***to the filter bypass list***`)
            .setColor(warningColour)

        const filterUserAddedEmbed = new EmbedBuilder()
            .setDescription(`***Added*** **<@${user.id}>** ***to the filter bypass list***`)
            .setColor(successColour)

        const filterUserAddCancelledEmbed = new EmbedBuilder()
            .setDescription(`***Cancelled adding*** **<@${user.id}>** ***to the filter bypass list***`)
            .setColor(failureColour)

        const filterUserRemoveConfirmEmbed = new EmbedBuilder()
            .setDescription(`***Confirm removing*** **<@${user.id}>** ***from the filter bypass list***`)
            .setColor(warningColour)

        const filterUserRemoveCancelledEmbed = new EmbedBuilder()
            .setDescription(`***Cancelled removing*** **<@${user.id}>** ***from the filter bypass list***`)
            .setColor(failureColour)

        const filterUserRemoveEmbed = new EmbedBuilder()
            .setDescription(`***Removed*** **<@${user.id}>** ***from the filter bypass list***`)
            .setColor(failureColour)

        const filterUserUnfilteredEmbed = new EmbedBuilder()
            .setDescription(`**<@${user.id}>** ***does not bypass the filter***`)
            .setColor(failureColour)

        const filterStateConfirmEmbed = new EmbedBuilder()
            .setDescription(`***Confirm turning the filter ${state.toLowerCase()}***`)
            .setColor(warningColour)

        const filterStateSetEmbed = new EmbedBuilder()
            .setDescription(`***Turned the filter ${state.toLowerCase()}***`)
            .setColor(successColour)

        const filterStateSetCancelledEmbed = new EmbedBuilder()
            .setDescription(`***Cancelled turning the filter ${state.toLowerCase()}***`)
            .setColor(failureColour)


        if (subcommand === 'add') {

            if (filter.words.includes(word)) {
                await interaction.reply({ embeds: [filterCurrentlyEmbed], ephemeral: true });
                delete require.cache[require.resolve('../../config/filter.json')]
                return;

            } else {
                await interaction.reply({ embeds: [filterAddConfirmEmbed], components: [confirmDeny], ephemeral: true })

                const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

                collector.on('collect', async i => {
                    if (i.customId === 'confirm') {
                        fs.readFile('./config/filter.json', 'utf8', function readFileCallback(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                var obj = JSON.parse(data);
                                obj.words.push(word);
                                var json = JSON.stringify(obj, null, 2);
                                fs.writeFile('./config/filter.json', json, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        i.update({ embeds: [filterAddedEmbed], components: [], ephemeral: true });
                                        delete require.cache[require.resolve('../../config/filter.json')]
                                        return;
                                    }
                                });
                            }
                        });
                    } else {
                        await i.update({ embeds: [filterAddCancelledEmbed], components: [], ephemeral: true });
                        delete require.cache[require.resolve('../../config/filter.json')]
                        return;
                    }
                });
            }
        } else if (subcommand === 'remove') {
            if (!filter.words.includes(word)) {
                await interaction.reply({ embeds: [filterUnfilteredEmbed], ephemeral: true });
                delete require.cache[require.resolve('../../config/filter.json')]
                return;
            } else {


                await interaction.reply({ embeds: [filterRemoveConfirmEmbed], components: [confirmDeny], ephemeral: true })

                const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

                collector.on('collect', async i => {
                    if (i.customId === 'confirm') {
                        fs.readFile('./config/filter.json', 'utf8', function readFileCallback(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                var obj = JSON.parse(data);
                                obj.words = obj.words.filter(e => e !== word);
                                var json = JSON.stringify(obj, null, 2);
                                fs.writeFile('./config/filter.json', json, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        i.update({ embeds: [filterRemoveEmbed], components: [], ephemeral: true });
                                        delete require.cache[require.resolve('../../config/filter.json')]
                                        return;
                                    }
                                });
                            }
                        });
                    } else {
                        await i.update({ embeds: [filterRemoveCancelledEmbed], components: [] });
                        return;
                    }
                });
            }
        } else if (subcommand === 'roleadd') {

            if (filterBypass.roles.includes(role.id)) {
                await interaction.reply({ embeds: [filterRoleCurrentlyFiltered], ephemeral: true });
                delete require.cache[require.resolve('../../config/filterBypass.json')]
                return;
            } else {
                await interaction.reply({ embeds: [filterRoleConfirmEmbed], components: [confirmDeny], ephemeral: true })

                const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

                collector.on('collect', async i => {
                    if (i.customId === 'confirm') {
                        fs.readFile('./config/filterBypass.json', 'utf8', function readFileCallback(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                var obj = JSON.parse(data);
                                obj.roles.push(role.id);
                                var json = JSON.stringify(obj, null, 2);
                                fs.writeFile('./config/filterBypass.json', json, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        i.update({ embeds: [filterRoleAddedEmbed], components: [] });
                                        delete require.cache[require.resolve('../../config/filterBypass.json')]
                                        return;
                                    }
                                });
                            }
                        });
                    } else {
                        await i.update({ embeds: [filterRoleAddCancelledEmbed], components: [] });
                        delete require.cache[require.resolve('../../config/filterBypass.json')]
                        return;
                    }
                })
            }

        } else if (subcommand === 'roleremove') {
            if (!filterBypass.roles.includes(role.id)) {
                await interaction.reply({ embeds: [filterRoleUnfilteredEmbed], ephemeral: true });
                delete require.cache[require.resolve('../../config/filterBypass.json')]
                return;
            } else {
                await interaction.reply({ embeds: [filterRoleRemoveConfirmEmbed], components: [confirmDeny], ephemeral: true })

                const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

                collector.on('collect', async i => {
                    if (i.customId === 'confirm') {
                        fs.readFile('./config/filterBypass.json', 'utf8', function readFileCallback(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                var obj = JSON.parse(data);
                                obj.roles = obj.roles.filter(e => e !== role.id);
                                var json = JSON.stringify(obj, null, 2);
                                fs.writeFile('./config/filterBypass.json', json, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        i.update({ embeds: [filterRoleRemoveEmbed], components: [] });
                                        delete require.cache[require.resolve('../../config/filterBypass.json')]
                                        return;
                                    }
                                });
                            }
                        });
                    } else {
                        await i.update({ embeds: [filterRoleRemoveCancelledEmbed], components: [] });
                        delete require.cache[require.resolve('../../config/filterBypass.json')]
                        return;
                    }
                });
            }
        } else if (subcommand == 'useradd') {
            if (filterBypass.users.includes(user.id)) {
                await interaction.reply({ embeds: [filterUserCurrentlyFiltered], ephemeral: true });
                delete require.cache[require.resolve('../../config/filterBypass.json')]
                return;
            } else {
                await interaction.reply({ embeds: [filterUserConfirmEmbed], components: [confirmDeny], ephemeral: true })

                const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

                collector.on('collect', async i => {
                    if (i.customId === 'confirm') {
                        fs.readFile('./config/filterBypass.json', 'utf8', function readFileCallback(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                var obj = JSON.parse(data);
                                obj.users.push(user.id);
                                var json = JSON.stringify(obj, null, 2);
                                fs.writeFile('./config/filterBypass.json', json, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        i.update({ embeds: [filterUserAddedEmbed], components: [] });
                                        delete require.cache[require.resolve('../../config/filterBypass.json')]
                                        return;
                                    }
                                });
                            }
                        });
                    } else {
                        await i.update({ embeds: [filterUserAddCancelledEmbed], components: [] });
                        delete require.cache[require.resolve('../../config/filterBypass.json')]
                        return;
                    }
                })
            }
        } else if (subcommand == 'userremove') {
            if (!filterBypass.users.includes(user.id)) {
                await interaction.reply({ embeds: [filterUserUnfilteredEmbed], ephemeral: true });
                delete require.cache[require.resolve('../../config/filterBypass.json')]
                return;
            } else {
                await interaction.reply({ embeds: [filterUserRemoveConfirmEmbed], components: [confirmDeny], ephemeral: true })

                const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

                const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

                collector.on('collect', async i => {
                    if (i.customId === 'confirm') {
                        fs.readFile('./config/filterBypass.json', 'utf8', function readFileCallback(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                var obj = JSON.parse(data);
                                obj.users = obj.users.filter(e => e !== user.id);
                                var json = JSON.stringify(obj, null, 2);
                                fs.writeFile('./config/filterBypass.json', json, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        i.update({ embeds: [filterUserRemoveEmbed], components: [] });
                                        delete require.cache[require.resolve('../../config/filterBypass.json')]
                                        return;
                                    }
                                });
                            }
                        });
                    } else {
                        await i.update({ embeds: [filterUserRemoveCancelledEmbed], components: [] });
                        delete require.cache[require.resolve('../../config/filterBypass.json')]
                        return;
                    }
                });
            }
        } else if (subcommand == 'state') {
            fs.readFile('./config/filter.json', 'utf8', async function readFileCallback(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    var obj = JSON.parse(data);
                }


                if (state === 'On') {

                    await interaction.reply({ embeds: [filterStateConfirmEmbed], components: [confirmDeny], ephemeral: true })

                    const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

                    const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

                    collector.on('collect', async i => {
                        if (i.customId === 'confirm') {
                            obj.state = 'on';
                            var json = JSON.stringify(obj, null, 2);
                            fs.writeFile('./config/filter.json', json, 'utf8', function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    i.update({ embeds: [filterStateSetEmbed], components: [] });
                                    delete require.cache[require.resolve('../../config/filter.json')]
                                    return;
                                }
                            });
                        } else {
                            await i.update({ embeds: [filterStateSetCancelledEmbed], components: [] });
                            delete require.cache[require.resolve('../../config/filter.json')]
                            return;
                        }
                    });

                } else if (state === 'Off') {
                    await interaction.reply({ embeds: [filterStateConfirmEmbed], components: [confirmDeny], ephemeral: true })

                    const filter = i => i.customId === 'confirm' || i.customId === 'cancel';

                    const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 15000 });

                    collector.on('collect', async i => {
                        if (i.customId === 'confirm') {
                            obj.state = 'off';
                            var json = JSON.stringify(obj, null, 2);
                            fs.writeFile('./config/filter.json', json, 'utf8', function (err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    i.update({ embeds: [filterStateSetEmbed], components: [] });
                                    delete require.cache[require.resolve('../../config/filter.json')]
                                    return;
                                }
                            });
                        } else {
                            await i.update({ embeds: [filterStateSetCancelledEmbed], components: [] });
                            delete require.cache[require.resolve('../../config/filter.json')]
                            return;
                        }
                    });
                }

            });
        }

        else {
            if (ephemeral == true) {
                await interaction.reply({ embeds: [filterListEmbed], ephemeral: true });
                delete require.cache[require.resolve('../../config/filter.json')]
                return;

            } else if (ephemeral == false) {
                await interaction.reply({ embeds: [filterListEmbed] });
                delete require.cache[require.resolve('../../config/filter.json')]
                return;
            } else {
                await interaction.reply({ embeds: [filterListEmbed], ephemeral: true });
                delete require.cache[require.resolve('../../config/filter.json')]
                return;
            }
        }
    }
}