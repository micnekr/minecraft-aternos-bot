const fs = require("fs");
const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { Logger } = require("selenium-webdriver/lib/logging");

const logger = require("../getWinstonLogger.js")();

let credentials = JSON.parse(fs.readFileSync("./credentials.json", "utf8"));
defaultSettings = {
    prefix: "/"
};

const afterLoginTitle = "Login or Sign up | Aternos | Free Minecraft Server";

let driver;
let isLoaded = false;
let isStarting = false;

// setup
async function setup(settings) {
    try {

        logger.info("Starting Selenium");
        driver = await new Builder().forBrowser('firefox')
            .setFirefoxOptions(new firefox.Options().headless().windowSize({
                width: 5000,
                height: 5000
            })).build();
            logger.info("Going to the login page");
        await driver.get("https://aternos.org/go/");
        logger.info("Logging in");
        await driver.findElement(By.id("user")).sendKeys(credentials.user);
        await driver.findElement(By.id("password")).sendKeys(credentials.password, Key.RETURN);
        await sleep(3000);
        logger.info("waiting for the title to change")
        logger.info(await driver.getTitle());
        await driver.wait(until.titleIs(afterLoginTitle), 3000);
        await sleep(3000);
        // click on the correct server
        logger.info("Going to a specific server");
        if(settings.serverId == undefined) await waitAndClick(By.className("server-body"));
        else await waitAndClick(By.css(`div[data-id=${settings.serverId}]`));

        await sleep(3000);
        logger.info("Accepting privacy policy")

        // accepting the privacy policy
        await waitAndClick(By.id("accept-choices"));

        isLoaded = true;
        logger.info("Finished setup of start.js")
    } catch (err) {
        logger.error("Error starting driver:", err);
        await driver.quit();
    }
}

module.exports = { start, setup }

async function start(callback) {
    logger.info("isLoaded, isStarting:" + isLoaded + " " + isStarting);
    if (!isLoaded) return false;
    if (isStarting) return null;

    isStarting = true;

    logger.info("clicking the start button");
    waitAndClick(By.id("start"));
    logger.info("clicking the notifications button or agreeing to the policies");
    try {
        await waitAndClick(By.css(".alert-buttons .btn-green"));
        await driver.findElement(By.css(".alert-buttons .btn-green")).click()
    } catch (err) { }

    // monitoring the state of the process
    let lastMessage = "";
    while (true) {
        await sleep(3000);
        // TODO: check for id #confirm and click
        try {
            await driver.findElement(By.id("confirm")).click()
        } catch (err) { }

        let newMessage = await driver.findElement(By.className("statuslabel-label")).getText()
        if (newMessage !== lastMessage) {
            lastMessage = newMessage;
            callback(newMessage);
        }

        // if the server is online, quit
        if (newMessage.trim() === "Online") break;
    }

    logger.info("The server is up")
    isStarting = false;
    return;
}

async function waitAndClick(selector) {
    await driver.wait(until.elementsLocated(selector));
    await driver.findElement(selector).click();
}

async function sleep(time) {
    await new Promise(r => setTimeout(r, time));
}
