const { EmbedBuilder } = require("discord.js");
const db = require("../../db/db");

module.exports = {
  name: "remind",
  description: "Set a reminder for a specified time (e.g., 10m, 1h, 1d).",
  role: null,
  async execute(message, args) {
    if (!args[0] || !args[1]) {
      return message.reply(
        "Please provide a valid time (e.g., 10m, 1h) and a reminder message."
      );
    }

    const timeValue = parseInt(args[0].slice(0, -1));
    const timeUnit = args[0].slice(-1);

    let remindTime;
    switch (timeUnit) {
      case "m":
        remindTime = Date.now() + timeValue * 60 * 1000;
        break;
      case "h":
        remindTime = Date.now() + timeValue * 60 * 60 * 1000;
        break;
      case "d":
        remindTime = Date.now() + timeValue * 24 * 60 * 60 * 1000;
        break;
      default:
        return message.reply(
          "Please provide a valid time unit (m = minutes, h = hours, d = days)."
        );
    }

    const reminderMessage = args.slice(1).join(" ");

    db.run(
      `INSERT INTO reminders (user_id, channel_id, message, remind_time) VALUES (?, ?, ?, ?)`,
      [message.author.id, message.channel.id, reminderMessage, remindTime],
      function (err) {
        if (err) {
          return console.error("Failed to set reminder:", err.message);
        }
      }
    );

    const reminderEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("⏰ Reminder Set!")
      .addFields(
        { name: "Time", value: `In ${args[0]}`, inline: true },
        { name: "Reminder", value: `${reminderMessage}`, inline: true }
      )
      .setFooter({
        text: `Reminder set by ${message.author.username}`,
        iconURL: message.author.avatarURL(),
      })
      .setTimestamp();

    const confirmationMessage = await message.reply({
      embeds: [reminderEmbed],
    });

    setTimeout(async () => {
      await confirmationMessage
        .delete()
        .catch((err) =>
          console.error("Failed to delete confirmation message:", err)
        );
      await message.react("✅");
    }, 30000);
  },
};
