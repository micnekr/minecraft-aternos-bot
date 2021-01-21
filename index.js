const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();

const status = require("./commands/status.js");
const start = require("./commands/start.js");

let settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
defaultSettings = {
  prefix: "/"
};

settings = Object.assign({}, defaultSettings, settings);
settings.checkInterval *= 1000;

token = fs.readFileSync("./token.txt", "utf8").replace(/\r?\n|\r/g, "");

console.log("settings", settings);
console.log("token", [token]);

start.setup(settings);

client.on("ready", () => {
  console.log(`The bot is running as ${client.user.tag}`);

  // update the bot
  updateBotStatus();
  setInterval(updateBotStatus, settings.checkInterval);
});

client.on("message", async function (msg) {
  console.log(msg.content);

  // do the prefix
  if (msg.content.startsWith(settings.prefix)) {
    const command = msg.content.substring(settings.prefix.length);
    try{
      const data = await updateBotStatus();
      console.log(command);
      switch(command){
        case "status":
            // update the status

            let embed = getDefaultEmbed(data).setTitle(`The server is ${status.getStatusMessage(data.online)}`)
            msg.channel.send(embed);
          
          break;
          case "start":
            // first check if the bot is online
            if (data.online){
              console.log("already online");
              let embed = getDefaultEmbed(data).setTitle("The server is already online")
              msg.channel.send(embed);
            }else{
              console.log("starting");
              let embed = getDefaultEmbed(data).setTitle("Starting the server")
              let sentMsg = await msg.channel.send(embed);
              await start.start(function(updateData){
                console.log(updateData);
                sentMsg.edit(getDefaultEmbed(data).setTitle(updateData));
              });
              msg.channel.send(getDefaultEmbed(data).setTitle("The server is up"))
            }
          break;
      }
    }catch(err){
      console.error("error", err);
      msg.channel.send("An error has occured");
    }
  }
});

console.log("trying to login");
client.login(token);

function isOnline(response){
  return response.online && response.players.max !== 0;
}

function getDefaultEmbed(data){
  return new Discord.MessageEmbed()
  .attachFiles([data.fileName])
  .setThumbnail(`attachment://${data.fileName}`);
}

async function updateBotStatus() {
  const data = await status.getStatusData(settings.serverName, settings.port);
  console.log(data);
  const isServerOnline = isOnline(data);
  data.online = isServerOnline;

  if (data.status == "error") throw new Error(data.error)

  let serverStatus;

  if(isServerOnline){
    client.user.setStatus('online');
    serverStatus = 'Server online';
  }else{
    client.user.setStatus('dnd');
    serverStatus = 'Server offline';
  }
  client.user.setActivity(serverStatus, { type: 'PLAYING' });

  return data;
}
