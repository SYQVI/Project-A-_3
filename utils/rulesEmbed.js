const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require("discord.js");

const config = require('../config');
const fs = require("fs");
const path = require("path");

const rulesDataPath = path.join(__dirname, "..", "data", "rules.json");

// قراءة بيانات القوانين
const data = JSON.parse(fs.readFileSync(rulesDataPath, "utf8"));

function mainEmbed() {
  return new EmbedBuilder()
    .setTitle("📜 ThailandCodes Rules")
    .setDescription(
      "**مرحباً بك في سيرفر ThailandCodes!**\n\n" +
      "قبل أن تبدأ بالمشاركة في القنوات، يرجى قراءة القوانين بعناية.\n\n" +
      "🔹 الضغط على زر أو القائمة أدناه يتيح لك الاطلاع على كل القوانين.\n" +
      "🔹 الالتزام بالقوانين يحافظ على النظام ويجنبك العقوبات.\n\n" +
      "💡 تذكير: قراءة القوانين تعني موافقتك على جميع الشروط والأحكام."
    )
    .setImage(config.rulesImage || null)
    .setColor(0xAA00FF)
    .setFooter({ text: "• Powered By Project A • f52k"})
    .setTimestamp();
}

function rulesMenu(rules) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("rules_select")
      .setPlaceholder("قم بإختيار القانون المراد رؤيته")
      .addOptions(
        rules.length
          ? rules.map((r, i) => ({
              label: r.name,
              value: String(i)
            }))
          : [{ label: "لم يتم إضافة قوانين بعد..", value: "none" }]
      )
  );
}


module.exports = { mainEmbed, rulesMenu };
