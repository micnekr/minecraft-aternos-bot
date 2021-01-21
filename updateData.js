const fs = require("fs");
const getStatusCallback = require("./minecraftServerStatus.js");
const util = require('util');

const fileName = "serverPicture.png";

const getStatus = util.promisify(getStatusCallback);

module.exports = {update, fileName};
async function update(serverName, serverPort){
    let response = await getStatus(serverName, serverPort);
    writeImageIfNeeded(response.icon);

    response.fileName = fileName;

    return response;
}

function writeImageIfNeeded(imageString) {
    if (!fs.existsSync("./" + fileName)) {
        // Remove header
        const image = imageString.split(";base64,").pop();
        fs.writeFileSync("./" + fileName, image, { encoding: "base64" });
        console.log("Image downloaded");
    }
}
