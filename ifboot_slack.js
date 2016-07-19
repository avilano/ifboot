/*
# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node slack_bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.IfBootToken) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

const Botkit = require('./node_modules/botkit/lib/Botkit.js');
const os = require('os');

const controller = Botkit.slackbot({
  debug: true,
});

const bot = controller.spawn({
  token: process.env.IfBootToken,
}).startRTM();


controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'robot_face',
},  function disperr(err, res) {
    if (err) {
      bot.botkit.log('Failed to add emoji reaction :(', err);
    }
  });


  controller.storage.users.get(message.user, function(err, user) {
    if (user && user.name) {
        bot.reply(message, 'Hello ' + user.name + '!!');
    } else {
      bot.reply(message, 'Hello user.');
    }
  });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
  let name = message.match[1];
  controller.storage.users.get(message.user, function(err, user) {
    if (!user) {
        user = {
          id: message.user,
        };
    }
      user.name = name;
        controller.storage.users.save(user, function(err, id) {
          bot.reply(message, 'Most excellent! I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

  controller.storage.users.get(message.user, function(err, user) {
    if (user && user.name) {
      bot.reply(message, 'Your name is ' + user.name);
    } else {
      bot.startConversation(message, function(err, convo) {
        if (!err) {
          convo.say('I do not know your name User!');
          convo.ask('What should I call you master?', function(response, convo) {
            convo.ask('You want me to call you `' + response.text + '` then?', [
              {
                pattern: 'yes',
                callback: function(response, convo) {
                  // since no further messages are queued after this,
                  // the conversation will end naturally with status == 'completed'
                  convo.next();
                },
              },
              {
                pattern: 'no',
                callback: function(response, convo) {
                // stop the conversation. this will cause it to end with status == 'stopped'
                  convo.stop();
                },
              },
              {
                default: true,
                callback: function(response, convo) {
                  convo.repeat();
                  convo.next();
                },
              },
            ]);

            convo.next();
          }, { key: 'nickname' }); // store the results in a field called nickname

          convo.on('end', function(convo) {
            if (convo.status === 'completed') {
              bot.reply(message, 'OK! I will update my database...');

              controller.storage.users.get(message.user, function(err, user) {
                if (!user) {
                  user = {
                    id: message.user,
                  };
                }
              user.name = convo.extractResponse('nickname');
                controller.storage.users.save(user, function(err, id) {
                  bot.reply(message, 'I will call you ' + user.name + ' from now on.');
                });
              });
            } else {
            // this happens if the conversation ended prematurely for some reason
              bot.reply(message, 'OK, nevermind!');
            }
          });
        }
      });
    }
  });
});

controller.hears(['where are the slides?' ,'i need the slides','can you show me the slides?','slides','presentations'], 'direct_message,direct_mention,mention', function(bot, message) {
  bot.reply(message, 'Here you go User: https://tinyurl.com/hvu2xv4');
  bot.reply(message, 'Its always great to be of help :+1:');
});

controller.hears(['where are the videos?' ,'i need the videos','can you show me the videos?','videos','vids'], 'direct_message,direct_mention,mention', function(bot, message) {
  bot.reply(message, 'Of course Composer, here is the library: https://tinyurl.com/h4vbg7t');
});

controller.hears(['where are the videos?' ,'i need the videos','can you show me the videos?','videos','vids'], 'direct_message,direct_mention,mention', function(bot, message) {
  bot.reply(message, 'You can find the slides in here user: https://github.com/avilano/boot');
});



controller.hears(['I want food','Im hungry','whats on the menu?'], 'direct_message,direct_mention,mention', function(bot,message) {
  // start a conversation to handle this response.
  bot.startConversation(message,function(err,convo) {

    convo.ask('Well first of all, would you like veggies only?',[
      {
        pattern: 'nevermind',
        callback: function(response,convo) {
          convo.say('OK you are not hungry then.');
          convo.next();
        }
      },
      {
        pattern: bot.utterances.yes,
        callback: function(response,convo) {
          convo.say('Wow! such healty...');
          getVeggie(response, convo);
          convo.next();
        }
      },
      {
        pattern: bot.utterances.no,
        callback: function(response,convo) {
          convo.say('Ok but go workout latter.');
          getMeat(response, convo);
          convo.next();
        }
      },
      {
        default: true,
        callback: function(response,convo) {

          convo.next();
        }
      },
    ]);

    getVeggie = function(response, convo) {
      convo.ask('How much money do you have to spend?',[
        {
          pattern: 'nevermind',
          callback: function(response,convo) {
            convo.say('OK you are not hungry then.');
            convo.next();
          }
        },
        {
          pattern: 'high',
          callback: function(response,convo) {
              convo.say(message, 'Wow user you have so much money!');
              convo.say(message, 'but there are no veggan places around that fits your high standards :(');
              //do something else
              convo.next();
            }
        },
        {
          pattern: 'medium',
          callback: function(response,convo) {
            convo.say(message, 'Lets see...!');
            //getVeggie(response, convo);
            convo.next();
          }
        },
        {
          pattern: 'low',
          callback: function(response,convo) {
            convo.say(message, 'Poor derp!');
            //getVeggie(response, convo);
            convo.next();
          }
        },
        {
          default: true,
          callback: function(response,convo) {
            convo.say('Make up your mind :I');
            convo.next();
          }
        },
      ]);
    };
  });
});

controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

  bot.startConversation(message, function(err, convo) {

    convo.ask('Are you sure you want me to shutdown?', [
      {
        pattern: bot.utterances.yes,
        callback: function(response, convo) {
          convo.say('Goodbye!');
          convo.next();
          setTimeout(function() {
            process.exit();
          }, 3000);
        },
      },
      {
        pattern: bot.utterances.no,
        default: true,
        callback: function(response, convo) {
          convo.say('*I am grateful Architect, I love to be alive!*');
          convo.next();
        },
      },
    ]);
  });
});
// ========================================================================================


/*controller.hears(['I want food','I\'m hungry','what\'s on the menu?'], 'message_recieved', function(bot,message) {

  askVeggie = function(response, convo) {
    convo.ask('Well first of all, would you like veggies only?', [
      {
        pattern: bot.utterances.yes,
          callback: function(response, convo) {
            convo.say('Veggies it is!.');
            getVeggie(response, convo);
            convo.next();
          },
      },
      {
        pattern: bot.utterances.no,
        callback: function(response, convo) {
            convo.say('No veggies, roger that!.');
            getMeat(response, convo);
            convo.next();
          },
      },
    ]);
  };

    askSize = function(response, convo) {
      convo.ask('What size do you want?', function(response, convo) {
        convo.say('Ok.')
        askWhereDeliver(response, convo);
        convo.next();
      });
    }
    askWhereDeliver = function(response, convo) {
      convo.ask('So where do you want it delivered?', function(response, convo) {
        convo.say('Ok! Good bye.');
        convo.next();
      });
    }

  bot.startConversation(message, askVeggie);
});

// ========================================================================
*/
controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

      const hostname = os.hostname();
      const uptime = formatUptime(process.uptime());

      bot.reply(message,
          ':robot_face: I am a bot named <@' + bot.identity.name +
          '>. I have been running for ' + uptime + ' on ' + hostname + '.');
    });

function formatUptime(uptime) {
    let unit = 'second';
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = 'minute';
  }
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = 'hour';
  }
  if (uptime !== 1) {
  unit = unit + 's';
  }

  uptime = uptime + ' ' + unit;
  return uptime;
}
