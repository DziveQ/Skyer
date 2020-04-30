const { RichEmbed } = require("discord.js");
const cfg = require("../../config.json");

module.exports = {
    name: 'invite',
    aliases: ['invite', 'inv', 'join'],
    category: "info",
    description: "Sends a link to invite the bot",
    usage: "<input>",
    run: (client, message, args) => {
        if (message.author.bot) return;
        if (!message.guild) return;
        if (!message.content.startsWith(cfg.prefix)) return;

        const embed = new RichEmbed()
        .setTitle('Invite our bot, on your own discord server!')
        .setColor('#CFB53B')

        .setDescription('Hi <@' + message.author.id + '> \n \n' +
                        'You can invite our bot via this link: \nhttps://discordapp.com/oauth2/authorize?client_id=704793227919622255&permissions=2146955127&scope=bot \n \n')
        .addField('Please keep in mind, that our bot are still under devlopment, and you may have some problems with it. Please let us know about them!', '\u200b')

        .setFooter('Skyer | ' + cfg.version)
        .setTimestamp()

        message.reply(embed)
    }
}
