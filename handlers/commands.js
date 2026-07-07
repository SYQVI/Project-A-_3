const { REST, Routes, SlashCommandBuilder } = require("discord.js");
const config = require('../config');

module.exports = async (client) => {
  const commands = [
    new SlashCommandBuilder()
      .setName("setuprules")
      .setDescription("Send Main Embed 📕"),
    new SlashCommandBuilder()
      .setName("adminsystem")
      .setDescription("Admin Panel 📕")
  ].map(c => c.toJSON());

  const rest = new REST({ version: "10" }).setToken(config.token);

  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands }
  );
};
