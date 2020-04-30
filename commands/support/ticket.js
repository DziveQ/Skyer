const { RichEmbed } = require("discord.js");
const cfg = require("../../config.json");
const mysqlPass = require("../../mysql.json");
const mysql = require("mysql");

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

module.exports = {
    name: "ticket",
    category: "support",
    description: "Create a ticket for the Skyer Support",
    usage: "<input>",
    run: (client, message, args) => {
        var con = mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: '',
          database: 'skyer'
        });

        if (message.author.bot) return;
        if (!message.guild) return;
        if (!message.content.startsWith(cfg.prefix)) return;
        if (!args[0]) return message.reply('Please use a valid option: `create`, `close`, `status`, `edit')

        if (args[0] == 'create') {
            if (!args[1] || !args[2]) return message.reply('Please make sure, that you have typed a valid **Title** and/or **Description**.');

            let author = message.author.id
            let sql = "SELECT id, ticketID FROM tickets WHERE ticketOwner = " + mysql.escape(author);
            con.query(sql, function(err, result, fields) { if (err) throw err;
              if (result == '') { console.log(result)
                const ticketID = makecode(5);
                const ticketOwner = message.author.id;
                const ticketTitle = args[1];
                const ticketDescription = args.slice(2).join(" ");
                const ticketStatus = "Waiting for Skyer Support";
                const ticketDate = today.getFullYear()+'-'+today.getMonth()+1+'-'+today.getDate();
      
                const embed = new RichEmbed()
                .setTitle('Skyer Support System')
                .setColor('#00FF00')        
                .setDescription('Hi <@' + message.author.id + '> \n \n' +
                                'You are about to create a ticket for the Skyer Support. Please keep in mind, that your server can be blacklisted, if you overuse this command. \n \n' + 
                                'If you want to close the ticket, type `!ticket close <ID>` \n \n')
      
                .addField('Your tickets ID: ', ticketID, true)
                .addField('Your tickets title: ', ticketTitle)
                .addField('Your tickets description: ', ticketDescription)
                .addField('Your tickets status: ', ticketStatus)
                .addField('Your tickets start date: ', ticketDate)
      
                .setFooter('Skyer | ' + cfg.version)
                .setTimestamp()
      
                message.reply(embed);

                const embed2 = new RichEmbed()
                .setTitle('Skyer Support System')
                .setColor('#00FF00')        

                .addField('User: ', '<@' + message.author.id + '>')
                .addField('Tickets ID: ', ticketID, true)
                .addField('Tickets title: ', ticketTitle)
                .addField('Tickets description: ', ticketDescription)
                .addField('Tickets status: ', ticketStatus)
                .addField('Tickets supporter: ', 'None')
                .addField('Tickets start date: ', ticketDate)
      
                .setFooter('Skyer | ' + cfg.version)
                .setTimestamp()
      
                client.channels.get(cfg.ticketsChannel).send(embed2).then(sent => { const ticketMsg = sent.id
                  var sql = "INSERT INTO tickets (ticketID, ticketOwner, ticketTitle, ticketDescription, ticketStatus, ticketMsg, ticketDate) VALUES ?";
                  var values = [[ticketID, ticketOwner, ticketTitle, ticketDescription, ticketStatus, ticketMsg, ticketDate]];
                  con.query(sql, [values], function (err, result) { if (err) throw err;
                     console.log("Inserted a ticket with ID: " + ticketID);
                  });
                });

              } else { console.log(result)
                const embed = new RichEmbed()
                .setTitle('Skyer Support System')
                .setColor('#FF0000')        
                .setDescription('Hi <@' + message.author.id + '> \n \n' +
                                "You can't create a new ticket, until you close the first one. You can only have one opened ticket at the same time.\n \n" + 
                                'If you want to close the ticket, type `!ticket close <ID>` \n \n')
      
                .addField('Your tickets ID: ', result[0].ticketID, true)
      
                .setFooter('Skyer | ' + cfg.version)
                .setTimestamp()
      
                message.reply(embed)
              }
            });
        } else if (args[0] == 'close') {
          if (!args[1]) return message.reply('Please use a valid ticket ID')

          const embed = new RichEmbed()
          .setTitle('Skyer Support System')
          .setColor('#FF0000')        
          .setDescription('Hi <@' + message.author.id + '> \n \n' +
                          "You have closed ticket with ID: `" + args[1] + '`')
        
          .setFooter('Skyer | ' + cfg.version)
          .setTimestamp()
        
          message.reply(embed)
          var closeID = args[1]

          var sql = 'DELETE FROM tickets WHERE ticketID = ' + mysql.escape(closeID);
          con.query(sql, function (err, result) { if (err) throw err;});
        } else if (args[0] == 'status') {
          if (!args[1]) return message.reply('Please use a valid ticket ID');

          let sql = "SELECT ticketID, ticketOwner, ticketTitle, ticketDescription, ticketStatus, ticketAdmin, ticketDate FROM tickets WHERE ticketid = " + mysql.escape(args[1]);
          con.query(sql, function(err, result, fields) { if (err) throw err;
            if (result[0].ticketOwner != message.author.id) return message.reply("You can't lookup other players tickets.")
            
            const embed = new RichEmbed()
            .setTitle('Skyer Support System')
            .setColor('#00FF00')        
            .setDescription('Hi <@' + message.author.id + '> \n \n' +
                            'Here you have all details about your ticket.')
    
            .addField('Your tickets ID: ', result[0].ticketID, true)
            .addField('Your tickets title: ', result[0].ticketTitle)
            .addField('Your tickets description: ', result[0].ticketDescription)
            .addField('Your tickets status: ', result[0].ticketStatus)
            .addField('Your tickets supporter: ', result[0].ticketAdmin)
            .addField('Your tickets start date: ', result[0].ticketDate)
    
            .setFooter('Skyer | ' + cfg.version)
            .setTimestamp()
      
            message.reply(embed);
          });
        } else if (args[0] == 'edit') {
          console.log(args[2])
          if (!args[2]) return message.reply('Please type a valid edit option. You can edit **Title** and **Description**');

          if (args[2] == 'Title' || args[2] == 'title') {
            var sql = "UPDATE tickets SET ticketTitle =" + mysql.escape(args.slice(3).join(" ")) + "WHERE ticketID = " + mysql.escape(args[1]);
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log(result.affectedRows + " record(s) updated");

              var sql2 = 'SELECT ticketMsg FROM tickets WHERE ticketID = ' + mysql.escape(args[1])
              con.query(sql2, function (err, result) { if (err) throw err;
                message.delete(result[0].ticketMsg).then(sent => { const ticketMsg = sent.id
                  var sql = "SELECT ticketOwner, ticketTitle, ticketDescription, ticketStatus, ticketAdmin, ticketDate FROM tickets WHERE ticketID = " + mysql.escape(args[1]);
                  con.query(sql, function (err, result) { if (err) throw err;

                    const embed = new RichEmbed()
                    .setTitle('Skyer Support System')
                    .setColor('#00FF00')        

                    .addField('User: ', '<@' + result[0].ticketOwner + '>')
                    .addField('Tickets ID: ', result[0].ticketID, true)
                    .addField('Tickets title: ', result[0].ticketTitle)
                    .addField('Tickets description: ', result[0].ticketDescription)
                    .addField('Tickets status: ', result[0].ticketStatus)
                    .addField('Tickets supporter: ', result[0].ticketAdmin)
                    .addField('Tickets start date: ', result[0].ticketDate)
          
                    .setFooter('Skyer | ' + cfg.version)
                    .setTimestamp()
          
                    client.channels.get(cfg.ticketsChannel).send(embed).then(sent => { const ticketMsg2 = sent.id
                      var sql = "UPDATE tickets SET ticketMsg = " + mysql.escape(ticketMsg2);
                      con.query(sql, function (err, result) { if (err) throw err;});
                    });
                  });
                });
              });
            });
          } else if (args[2] == 'Description' || args[2] == 'description' || args[2] == 'Desc' || args[2] == 'desc') {
            var sql = "UPDATE tickets SET ticketDescription =" + mysql.escape(args.slice(3).join(" ")) + "WHERE ticketID = " + mysql.escape(args[1]);
            con.query(sql, function (err, result) {
              if (err) throw err;
              console.log(result.affectedRows + " record(s) updated");

              var sql2 = 'SELECT ticketMsg FROM tickets WHERE ticketID = ' + mysql.escape(args[1])
              con.query(sql2, function (err, result) { if (err) throw err;
                message.delete(result[0].ticketMsg).then(sent => { const ticketMsg = sent.id
                  var sql = "SELECT ticketOwner, ticketTitle, ticketDescription, ticketStatus, ticketAdmin, ticketDate FROM tickets WHERE ticketID = " + mysql.escape(args[1]);
                  con.query(sql, function (err, result) { if (err) throw err;

                    const embed = new RichEmbed()
                    .setTitle('Skyer Support System')
                    .setColor('#00FF00')        

                    .addField('User: ', '<@' + result[0].ticketOwner + '>')
                    .addField('Tickets ID: ', result[0].ticketID, true)
                    .addField('Tickets title: ', result[0].ticketTitle)
                    .addField('Tickets description: ', result[0].ticketDescription)
                    .addField('Tickets status: ', result[0].ticketStatus)
                    .addField('Tickets supporter: ', result[0].ticketAdmin)
                    .addField('Tickets start date: ', result[0].ticketDate)
          
                    .setFooter('Skyer | ' + cfg.version)
                    .setTimestamp()
          
                    client.channels.get(cfg.ticketsChannel).send(embed).then(sent => { const ticketMsg2 = sent.id
                      var sql = "UPDATE tickets SET ticketMsg = " + mysql.escape(ticketMsg2);
                      con.query(sql, function (err, result) { if (err) throw err;});
                    });
                  });
                });
              });
            });
          }
        }
    }
}

function makecode(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
