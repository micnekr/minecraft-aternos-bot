const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();

const status = require("./commands/status.js");
const start = require("./commands/start.js");
const help = require("./commands/help.js");

const commandsWithUpdate = ["start", "status"];

let settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
defaultSettings = {
  prefix: "/"
};

const logger = require("./getWinstonLogger.js")();

// set the settings
settings = Object.assign({}, defaultSettings, settings);
settings.checkInterval *= 1000;

token = fs.readFileSync("./token.txt", "utf8").replace(/\r?\n|\r/g, "");

logger.info("settings", settings);
logger.info("token", [token]);

start.setup(settings);

client.on("ready", () => {
  logger.info(`The bot is running as ${client.user.tag}`);

  // update the bot
  updateBotStatus();
  setInterval(updateBotStatus, settings.checkInterval);
});

client.on("message", async function (msg) {
  logger.debug(msg.content);

  // check the prefix
  if (msg.content.startsWith(settings.prefix)) {
    const command = msg.content.substring(settings.prefix.length);
    try {

      let data, embed;

      // update the status
      if (commandsWithUpdate.includes(command)) data = await updateBotStatus();
      logger.debug(command);
      switch (command) {
        case "status":
          // TODO: logging
          // TODO: response codes
          // send the data
          embed = getDefaultEmbed().setTitle(`The server is ${status.getStatusMessage(data.online)}`)
          msg.channel.send(embed);

          break;
        case "start":
          // first check if the bot is online
          if (data.online) {
            // send the message that the server is online
            logger.info("already online");
            msg.channel.send(getDefaultEmbed().setTitle("The server is already online"));
          } else {

            logger.info("starting the server");
            // announce the server starting
            let sentMsg = await msg.channel.send(getDefaultEmbed().setTitle("Starting the server"));

            // update the embed until the server is up
            await start.start(function (updateData) {
              logger.info("Server update data:" + updateData);
              sentMsg.edit(getDefaultEmbed().setTitle(updateData));
            });
            logger.info("The server is up");

            // announce that the server is up
            msg.channel.send(getDefaultEmbed().setTitle("The server is up"))
          }
          break;
        case "help":
          embed = getDefaultEmbed()
            .setTitle("Minecraft Server Bot Commands")
            .setDescription(help(settings.prefix))
          msg.channel.send(embed);
          break;
      }
    } catch (err) {
      logger.error("error", err);
      msg.channel.send("An error has occured");
    }
  }
});

logger.info("Logging into discord");
client.login(token);

function isOnline(response) {
  return response.online && response.players.max !== 0;
}

function getDefaultEmbed() {
  return new Discord.MessageEmbed()
    .attachFiles([status.fileName])
    .setThumbnail(`attachment://${status.fileName}`);
}

async function updateBotStatus() {
  // fetch data
  const data = await status.getStatusData(settings.serverName, settings.port);
  const isServerOnline = isOnline(data);
  data.online = isServerOnline;

  if (data.status == "error") throw new Error(data.error)

  let serverStatus;

  if (isServerOnline) {
    client.user.setStatus('online');
    serverStatus = 'Server online';
  } else {
    client.user.setStatus('dnd');
    serverStatus = 'Server offline';
  }

  // also set the status
  client.user.setActivity(serverStatus, { type: 'PLAYING' });

  return data;
}

// to enable loging
process.on('unhandledRejection', (reason, promise) => {
  throw reason;
})

const others = [`SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`]
let signalListener;
if (process.platform === "win32") {
  signalListener = require("readline")
    .createInterface({
      input: process.stdin,
      output: process.stdout
    });
} else signalListener = process;

others.forEach((eventType) => {
  signalListener.on(eventType, async function () {
    logger.info("cleanup");
    let driver = start.getDriver()
    if (driver !== undefined) {
      await driver.quit();
      logger.info("quit the driver");
    }
    logger.info("finished cleanup");
    process.exit();
  }.bind(null));
})
