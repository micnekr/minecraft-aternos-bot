const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();

const status = require("./commands/status.js");

let settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
defaultSettings = {
  port: 25565,
  prefix: "/"
};

settings = Object.assign({}, defaultSettings, settings);
settings.checkInterval *= 1000;

token = fs.readFileSync("./token.txt", "utf8");

console.log(settings);

client.on("ready", () => {
  console.log(`The bot is running as ${client.user.tag}`);

  // update the bot
  updateBotStatus();
  setInterval(updateBotStatus, settings.checkInterval);
});

client.on("message", async function (msg) {

  // do the prefix
  if (msg.content.startsWith(settings.prefix)) {
    const command = msg.content.substring(settings.prefix.length);
    try{
      switch(command){
        case "status":
            // update the status
            const data = await updateBotStatus();

            let embed = new Discord.MessageEmbed()
            .setTitle(`The server is ${status.getStatusMessage(data.online)}`)
            .attachFiles([data.fileName])
            .setThumbnail(`attachment://${data.fileName}`);
            msg.channel.send(embed);
          
          break;
      }
    }catch(err){
      console.error("error", err);
      msg.channel.send("An error has occured");
    }
  }
});

client.login(token);

function isOnline(response){
  return response.online && !response.motd.includes("offline");
}

async function updateBotStatus() {
  const data = await status.getStatusData(settings.serverName, settings.port);
  const isServerOnline = isOnline(data);
  data.online = isServerOnline;

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
