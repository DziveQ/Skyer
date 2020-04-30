const Discord = require('discord.js');
const { Client, Collection } = require("discord.js");
const { config } = require("dotenv");
const cfg = require('./config.json');

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes();
var dateTime = date+' | '+time;

const client = new Client({
    disableEveryone: true
})

// Collections
client.commands = new Collection();
client.aliases = new Collection();

config({
    path: __dirname + "/.env"
});

// Run the command loader
["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on("ready", () => {
    console.log(`Hi, ${client.user.username} is now online!`);

    const embed = new Discord.RichEmbed()
    .setTitle('Discord Bot - Start')
    .setColor('#00FF00')
    
    .setDescription('Skyer has just been started!')
    .addField('Current version: ', cfg.version)
    
    .setFooter('Skyer | ' + cfg.version)
    .setTimestamp()
    client.channels.get(cfg.serviceChannel).send(embed);

    client.user.setPresence({
        status: "online",
        game: {
            name: 'Skyer | '+cfg.version,
            type: "PLAYING"
        }
    });
    
})

let codeText = '```'


client.on("message", async message => {
    const prefix = cfg.prefix;

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;

    // If message.member is uncached, cache it.
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    
    if (cmd.length === 0) return;
    
    // Get the command
    let command = client.commands.get(cmd);
    // If none is found, try to find it by alias
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    // If a command is finally found, run the command
    if (command) 
        command.run(client, message, args);
});

client.login(cfg.token);