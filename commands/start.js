const fs = require("fs");
const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

let credentials = JSON.parse(fs.readFileSync("./credentials.json", "utf8"));
defaultSettings = {
    prefix: "/"
};

const afterLoginTitle = "Login or Sign up | Aternos | Free Minecraft Server";

let driver;
let isLoaded = false;
let isStarting = false;

// setup
(async function () {
    try {
        console.log("Starting a driver");
    driver = await new Builder().forBrowser('firefox')
    .setFirefoxOptions(new firefox.Options().headless().windowSize({
        width: 5000,
        height: 5000
    })).build();
        console.log("Going to a page");
        await driver.get("https://aternos.org/go/");
        await driver.findElement(By.id("user")).sendKeys(credentials.user);
        await driver.findElement(By.id("password")).sendKeys(credentials.password, Key.RETURN);
        await driver.wait(until.titleIs(afterLoginTitle), 1000);
        await waitAndClick(By.className("server-body"));
        await waitAndClick(By.id("accept-choices"));
        isLoaded = true;
    } catch (err) {
        console.error("Error starting driver:", err);
        await driver.quit();
    }
})();

module.exports = { start }

async function start(callback) {
    if (!isLoaded) return false;
    if (isStarting) return null;

    isStarting = true;

    waitAndClick(By.id("start"));
    waitAndClick(By.css(".btn-red .fa-times"));

    // TODO: wait for it to finalise
    let lastMessage = "";
    while(true){
        await sleep(1000);
        // TODO: check for id #confirm and click

        let newMessage = await driver.findElement(By.className("statuslabel-label")).getText()
        if (newMessage !== lastMessage){
            lastMessage = newMessage;
            callback(newMessage);
        }
    }

    isStarting = false;
}

async function waitAndClick(selector) {
    await driver.wait(until.elementsLocated(selector));
    await driver.findElement(selector).click();
}

async function sleep(time){
    await new Promise(r => setTimeout(r, time));
}
