const { EmbedBuilder } = require("discord.js");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/warnings.db");

db.run(`CREATE TABLE IF NOT EXISTS warnings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  issued_at INTEGER NOT NULL
)`);

module.exports = {
  name: "warn",
  description:
    "Issues a warning to a user. After 3 active warnings, the user is banned.",
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

    const reason = args.slice(1).join(" ") || "No reason provided";
    const oneMonthInMillis = 30 * 24 * 60 * 60 * 1000;

    const issueWarning = (callback) => {
      db.run(
        `INSERT INTO warnings (user_id, guild_id, reason, issued_at) VALUES (?, ?, ?, ?)`,
        [user.id, message.guild.id, reason, Date.now()],
        callback
      );
    };

    const countWarnings = (callback) => {
      db.all(
        `SELECT COUNT(*) as count FROM warnings WHERE user_id = ? AND guild_id = ? AND issued_at > ?`,
        [user.id, message.guild.id, Date.now() - oneMonthInMillis],
        (err, rows) => {
          if (err) return console.error(err.message);
          callback(rows[0].count);
        }
      );
    };

    const deleteExpiredWarnings = () => {
      db.run(
        `DELETE FROM warnings WHERE issued_at <= ?`,
        [Date.now() - oneMonthInMillis],
        (err) => {
          if (err)
            console.error("Failed to delete expired warnings:", err.message);
        }
      );
    };

    const deleteAllWarningsForUser = () => {
      db.run(
        `DELETE FROM warnings WHERE user_id = ? AND guild_id = ?`,
        [user.id, message.guild.id],
        (err) => {
          if (err)
            console.error(
              "Failed to delete warnings for banned user:",
              err.message
            );
        }
      );
    };

    const banUser = async () => {
      const member = message.guild.members.cache.get(user.id);
      if (member) {
        try {
          await user.send(
            `You have been banned from **${message.guild.name}** for exceeding 3 warnings.`
          );
        } catch (error) {
          console.error("Could not send ban DM to the user.");
        }

        member
          .ban({ reason: "Exceeded 3 warnings" })
          .then(() => {
            deleteAllWarningsForUser();
          })
          .catch((err) => {
            console.error("Failed to ban user:", err.message);
            message.reply("Failed to ban the user.");
          });
      }
    };

    issueWarning(async (err) => {
      if (err) {
        console.error("Failed to issue warning:", err.message);
        return message.reply("There was an error issuing the warning.");
      }

      countWarnings(async (warningCount) => {
        const warnEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle(`⚠️ Warning Issued to ${user.username}`)
          .addFields(
            { name: "User", value: `${user.tag}`, inline: true },
            { name: "User ID", value: `${user.id}`, inline: true },
            { name: "Reason", value: `${reason}`, inline: false },
            {
              name: "Total Active Warnings",
              value: `${warningCount}`,
              inline: true,
            }
          )
          .setFooter({
            text: `Issued by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp();

        message.channel.send({ embeds: [warnEmbed] });

        try {
          await user.send(
            `You have been warned in **${message.guild.name}** for: ${reason}. You now have ${warningCount} active warnings.`
          );
        } catch (error) {
          console.error("Could not send warning DM to the user.");
        }

        if (warningCount >= 3) {
          const banEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle(`🚫 ${user.username} Has Been Banned!`)
            .setDescription(
              `User has received 3 active warnings and has been banned.`
            )
            .setTimestamp();

          message.channel.send({ embeds: [banEmbed] });
          banUser();
        }

        deleteExpiredWarnings();
      });
    });
  },
};
