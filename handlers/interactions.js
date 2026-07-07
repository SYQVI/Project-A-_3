const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const config = require("../config.json");
const { mainEmbed, rulesMenu } = require("../utils/rulesEmbed");

const rulesDataPath = path.join(__dirname, "..", "data", "rules.json");

function loadData() {
  if (!fs.existsSync(rulesDataPath)) {
    fs.writeFileSync(
      rulesDataPath,
      JSON.stringify(
        {
          rules: [],
          rulesMessageId: null,
          rulesChannelId: null
        },
        null,
        2
      )
    );
  }

  delete require.cache[require.resolve(rulesDataPath)];
  return require(rulesDataPath);
}

function saveData(data) {
  fs.writeFileSync(rulesDataPath, JSON.stringify(data, null, 2));
}

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {

    if (interaction.isChatInputCommand() && interaction.commandName === "setuprules") {
      const data = loadData();

      const msg = await interaction.channel.send({
        embeds: [mainEmbed()],
        components: [rulesMenu(data.rules)]
      });

      data.rulesMessageId = msg.id;
      data.rulesChannelId = msg.channel.id;
      saveData(data);

      return interaction.reply({
        content: "Tln Sys : تم رسلتلك اللوحة",
        ephemeral: true
      });
    }

    /* ---------- /adminsystem ---------- */
    if (interaction.isChatInputCommand() && interaction.commandName === "adminsystem") {
      if (!interaction.member.roles.cache.has(config.adminRoleId))
        return interaction.reply({ content: "Tln Sys : ليس لديك صلاحيات ، طيييير", ephemeral: true });

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("admin_menu")
          .setPlaceholder("Admin Panel Menu")
          .addOptions(
            { label: "إضافة قانون", value: "add" },
            { label: "حذف قانون", value: "remove" },
            { label: "تعديل قانون", value: "edit" }
          )
      );

      return interaction.reply({ components: [row], ephemeral: true });
    }

    /* ---------- عرض قانون ---------- */
    if (interaction.isStringSelectMenu() && interaction.customId === "rules_select") {
      const data = loadData();
      if (interaction.values[0] === "none") return;

      const rule = data.rules[interaction.values[0]];
      if (!rule) return;

      const embed = new EmbedBuilder()
        .setTitle(rule.name)
        .setDescription(rule.text)
        .setImage(rule.image)
        .setColor(0xAA00FF);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === "admin_menu") {
      const data = loadData();
      const choice = interaction.values[0];


      if (choice === "add") {
        const modal = new ModalBuilder()
          .setCustomId("add_rule")
          .setTitle("إضافة قانون");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("name")
              .setLabel("اسم القانون")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("text")
              .setLabel("القانون المُضاف")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("image")
              .setLabel("لينك الصورة")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );

        return interaction.showModal(modal);
      }

      /* حذف */
      if (choice === "remove") {
        if (!data.rules.length)
          return interaction.reply({ content: "Tln Sys : لايوجد قوانين", ephemeral: true });

        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("remove_rule")
            .setPlaceholder("اختار القانون المراد حذفه")
            .addOptions(
              data.rules.map((r, i) => ({
                label: r.name,
                value: String(i)
              }))
            )
        );

        return interaction.reply({ components: [row], ephemeral: true });
      }


      if (choice === "edit") {
        if (!data.rules.length)
          return interaction.reply({ content: "Tln Sys : لايوجد قوانين", ephemeral: true });

        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("edit_rule")
            .setPlaceholder("اختار القانون المراد تعديله")
            .addOptions(
              data.rules.map((r, i) => ({
                label: r.name,
                value: String(i)
              }))
            )
        );

        return interaction.reply({ components: [row], ephemeral: true });
      }
    }

    if (interaction.isModalSubmit() && interaction.customId === "add_rule") {
      const data = loadData();

      data.rules.push({
        name: interaction.fields.getTextInputValue("name"),
        text: interaction.fields.getTextInputValue("text"),
        image: interaction.fields.getTextInputValue("image")
      });

      saveData(data);
      await refreshRules(interaction);

      return interaction.reply({ content: "Tln Sys : تم إضافة القانون", ephemeral: true });
    }

    /* ---------- حذف قانون ---------- */
    if (interaction.isStringSelectMenu() && interaction.customId === "remove_rule") {
      const data = loadData();
      data.rules.splice(interaction.values[0], 1);
      saveData(data);
      await refreshRules(interaction);

      return interaction.reply({ content: "Tln Sys : تم حذف القانون", ephemeral: true });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === "edit_rule") {
      const data = loadData();
      const index = interaction.values[0];
      const rule = data.rules[index];

      const modal = new ModalBuilder()
        .setCustomId(`edit_rule_${index}`)
        .setTitle("تعديل قانون");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("name")
            .setLabel("اسم القانون")
            .setStyle(TextInputStyle.Short)
            .setValue(rule.name)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("text")
            .setLabel("القانون بعد التعديل")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(rule.text)
        ),
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("image")
            .setLabel("لينك الصورة")
            .setStyle(TextInputStyle.Short)
            .setValue(rule.image)
        )
      );

      return interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith("edit_rule_")) {
      const data = loadData();
      const index = interaction.customId.split("_")[2];

      data.rules[index] = {
        name: interaction.fields.getTextInputValue("name"),
        text: interaction.fields.getTextInputValue("text"),
        image: interaction.fields.getTextInputValue("image")
      };

      saveData(data);
      await refreshRules(interaction);

      return interaction.reply({ content: "Tln Sys : لقد تم تعديل القانون", ephemeral: true });
    }
  });
};

async function refreshRules(interaction) {
  const data = loadData();
  if (!data.rulesMessageId || !data.rulesChannelId) return;

  const channel = await interaction.client.channels.fetch(data.rulesChannelId);
  const message = await channel.messages.fetch(data.rulesMessageId);

  await message.edit({
    embeds: [mainEmbed()],
    components: [rulesMenu(data.rules)]
  });
}
