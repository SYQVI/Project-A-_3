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
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

require("./handlers/commands")(client);
require("./handlers/interactions")(client);

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

const http = require('http');
http.createServer((req, res) => res.end('Bot is running!')).listen(process.env.PORT || 3000);

client.login(config.token);
