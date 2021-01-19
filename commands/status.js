const Discord = require("discord.js");
const updateData = require("../updateData.js");

module.exports = {getStatusData, getStatusMessage}

async function getStatusData(serverName, serverPort) {
    const response = await updateData(serverName, serverPort);
    return response;
}

function getStatusMessage(isOnline) {
    return isOnline? "online" : "offline";
}
