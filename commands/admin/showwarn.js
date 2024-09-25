const { EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/warnings.db");

module.exports = {
  name: "showwarn",
  description: "Displays all warnings for a user.",
  role: "admin",
  async execute(message, args) {
    const userId = args[0];

    const user =
      message.mentions.users.first() ||
      (await message.guild.members
        .fetch(userId)
        .then((member) => member.user)
        .catch(() => null));
    if (!user)
      return message.reply(
        "Please mention a valid user or provide a valid user ID."
      );

    const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000;

    db.all(
      `SELECT * FROM warnings WHERE user_id = ? AND guild_id = ?`,
      [user.id, message.guild.id],
      (err, rows) => {
        if (err) {
          console.error("Failed to retrieve warnings:", err.message);
          return message.reply("There was an error retrieving the warnings.");
        }

        if (rows.length === 0) {
          return message.reply(`User **${user.tag}** has no warnings.`);
        }

        const activeWarnings = rows.filter(
          (warn) => Date.now() - warn.issued_at <= oneMonthInMillis
        );
        const expiredWarnings = rows.filter(
          (warn) => Date.now() - warn.issued_at > oneMonthInMillis
        );

        const activeWarnsDescription =
          activeWarnings.length > 0
            ? activeWarnings
                .map(
                  (warn) =>
                    `**Reason:** ${warn.reason} | **Issued At:** ${new Date(
                      warn.issued_at
                    ).toDateString()}`
                )
                .join("\n")
            : "No active warnings.";

        const expiredWarnsDescription =
          expiredWarnings.length > 0
            ? expiredWarnings
                .map(
                  (warn) =>
                    `**Reason:** ${warn.reason} | **Issued At:** ${new Date(
                      warn.issued_at
                    ).toDateString()}`
                )
                .join("\n")
            : "No expired warnings.";

        const warnEmbed = new EmbedBuilder()
          .setColor("#FFA500")
          .setTitle(`⚠️ Warning Details for ${user.tag}`)
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: "User ID", value: `${user.id}`, inline: true },
            { name: "Total Warnings", value: `${rows.length}`, inline: true },
            {
              name: "Active Warnings",
              value: activeWarnings.length.toString(),
              inline: true,
            }
          )
          .addFields(
            {
              name: "🔴 Active Warnings",
              value: activeWarnsDescription,
              inline: false,
            },
            {
              name: "⚪ Expired Warnings",
              value: expiredWarnsDescription,
              inline: false,
            }
          )
          .setFooter({
            text: `Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        message.channel.send({ embeds: [warnEmbed] });
      }
    );
  },
};
