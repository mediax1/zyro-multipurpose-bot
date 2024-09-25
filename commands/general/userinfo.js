const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "userinfo",
  description: "Displays detailed information about a user",
  role: null,
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const accountCreationDate = user.createdAt;
    const serverJoinDate = member.joinedAt;
    const accountAge = Math.floor(
      (Date.now() - accountCreationDate) / (1000 * 60 * 60 * 24)
    );
    const serverJoinAge = Math.floor(
      (Date.now() - serverJoinDate) / (1000 * 60 * 60 * 24)
    );

    const boostStatus = member.premiumSince
      ? `Since ${member.premiumSince.toDateString()}`
      : "Not a Booster";

    const roleList = member.roles.cache
      .filter((role) => role.name !== "@everyone")
      .map((role) => role.toString())
      .join(", ");

    const userInfoEmbed = new EmbedBuilder()
      .setColor("#00A1FF")
      .setTitle(`👤 User Information: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: "Username", value: `${user.username}`, inline: true },
        {
          name: "Discriminator",
          value: `#${user.discriminator}`,
          inline: true,
        },
        { name: "User ID", value: `${user.id}`, inline: false },
        {
          name: "Account Created",
          value: `${accountCreationDate.toDateString()} (${accountAge} days ago)`,
          inline: false,
        },
        {
          name: "Joined Server",
          value: `${serverJoinDate.toDateString()} (${serverJoinAge} days ago)`,
          inline: false,
        },
        {
          name: "Roles",
          value: roleList.length > 0 ? roleList : "No roles",
          inline: false,
        },
        {
          name: "Boost Status",
          value: `${boostStatus}`,
          inline: true,
        },
        {
          name: "Status",
          value: `${user.presence?.status || "Offline"}`,
          inline: true,
        }
      )
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      })
      .setTimestamp();

    const replyMessage = await message.reply({ embeds: [userInfoEmbed] });

    await message
      .delete()
      .catch((err) => console.error("Failed to delete user message:", err));

    setTimeout(() => {
      replyMessage
        .delete()
        .catch((err) => console.error("Failed to delete embed message:", err));
    }, 15000);
  },
};
