const Discord = require("discord.js");
const {update, fileName} = require("../updateData.js");

module.exports = {getStatusData, getStatusMessage, fileName}

async function getStatusData(serverName, serverPort) {
    const response = await update(serverName, serverPort);
    return response;
}

function getStatusMessage(isOnline) {
    return isOnline? "online" : "offline";
}
