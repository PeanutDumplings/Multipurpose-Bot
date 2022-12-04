const { EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync('./config/config.yaml'));

// const welcomeChannel = '1027439401451671582';

module.exports = {
    name: 'guildMemberAdd',
    execute(client) {
        client.on('inviteCreate', (invite) => {
            client.invites[invite.code] = invite.uses
        })

        client.on('guildMemberAdd', async (member) => {
            member.guild.invites.fetch().then(guildInvites => {
                guildInvites.each(invite => {
                    if (invite.uses != client.invites[invite.code]) {
                        var joinTime = Math.round(member.user.createdTimestamp / 1000);
                        const welcomeEmbed = new EmbedBuilder()
                            .setColor(0x66f359)
                            .setThumbnail(`${member.user.displayAvatarURL()}`)
                            .addFields(
                                { name: '<:welcome:1027459248856252436> User Joined', value: `・<@${member.user.id}>\n・\`${member.user.tag}\`\n・Account created <t:${joinTime}:R>\n・Invited by <@${invite.inviter.id}>` },
                            )
                        client.channels.cache.get(config.welcomeChannel).send({ embeds: [welcomeEmbed] });
                        client.invites[invite.code] = invite.uses
                    }
                })
            })
        })
    }
}