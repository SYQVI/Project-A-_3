const { Client, GatewayIntentBits } = require("discord.js");
const config = require('./config.js');
const fs = require("fs");
const path = require("path"); 

const dataFolder = path.join(__dirname, "data");
if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);

const rulesDataPath = path.join(dataFolder, "rules.json");

if (!fs.existsSync(rulesDataPath)) {
  fs.writeFileSync(rulesDataPath, JSON.stringify({ rules: [], rulesMessageId: null }, null, 2));
}

let data = require(rulesDataPath);

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

require("./handlers/commands")(client);
require("./handlers/interactions")(client);

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(config.token);
