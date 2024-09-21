const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "userinfo",
  description: "Displays information about a user",
  role: null,
  async execute(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const userInfoEmbed = new EmbedBuilder()
      .setColor("#00A1FF")
      .setTitle("👤 User Information")
      .addFields(
        { name: "Username", value: `${user.username}#${user.discriminator}` },
        { name: "User ID", value: `${user.id}` },
        {
          name: "Account Created On",
          value: `${user.createdAt.toDateString()}`,
        },
        {
          name: "Joined Server On",
          value: `${member.joinedAt.toDateString()}`,
        },
        {
          name: "Roles",
          value:
            member.roles.cache.size > 0
              ? member.roles.cache.map((role) => role.toString()).join("\n")
              : "None",
        }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({
        text: `Requested by ${message.author.username}`,
        iconURL: message.author.avatarURL(),
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
    }, 10000);
  },
};
