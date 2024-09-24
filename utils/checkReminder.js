const { EmbedBuilder } = require("discord.js");
const db = require("../db/db");

const checkReminders = async (client) => {
  setInterval(() => {
    const currentTime = Date.now();

    db.all(
      `SELECT * FROM reminders WHERE remind_time <= ?`,
      [currentTime],
      (err, rows) => {
        if (err) {
          return console.error("Failed to fetch reminders:", err.message);
        }

        rows.forEach(async (row) => {
          const user = await client.users.fetch(row.user_id);
          const channel = await client.channels.fetch(row.channel_id);
          if (user) {
            const reminderEmbed = new EmbedBuilder()
              .setColor("#FFA500")
              .setTitle("⏰ Reminder!")
              .setDescription(`${row.message}`)
              .addFields({
                name: "Channel",
                value: `You set this reminder in <#${row.channel_id}>.`,
              })
              .setFooter({
                text: `Reminder you set earlier`,
              })
              .setTimestamp();

            user.send({ embeds: [reminderEmbed] }).catch((err) => {
              console.error(
                `Failed to send DM to ${user.username}:`,
                err.message
              );
            });

            db.run(
              `DELETE FROM reminders WHERE id = ?`,
              [row.id],
              function (err) {
                if (err) {
                  return console.error(
                    "Failed to delete reminder:",
                    err.message
                  );
                }
              }
            );
          }
        });
      }
    );
  }, 60 * 1000);
};

module.exports = { checkReminders };
